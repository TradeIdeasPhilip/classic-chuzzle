/**
 * This file exports findActionable() and hides a lot of the details.
 */

import { Color } from "./logical-board";
/**
 * Given the current board state, which pieces need to be removed?
 * @param allPieces The current state of the board.
 * We have to ignore the rowIndex and columnIndex 😒
 * @returns A set of pieces to be removed,
 * along with some additional information aimed at the GUI.
 */
export function findActionable<
  T extends { readonly color: Color; readonly bomb: boolean }
>(allPieces: ReadonlyArray<ReadonlyArray<T>>) {
  /**
   * A list of pieces that are all the same color and adjacent.
   */
  class Group {
    #contents = new Set<GroupCell>();
    /**
     * This creates a new array on each call.
     */
    get contents() {
      return [...this.#contents].map((cell) => cell.piece);
    }
    get size() {
      return this.#contents.size;
    }
    readonly debugInitialCell: GroupCell;
    readonly color: Color;
    constructor(initialContents: GroupCell) {
      this.color = initialContents.color;
      this.debugInitialCell = initialContents;
      this.#contents.add(initialContents);
    }
    /**
     * Move items from the other Group to this Group.
     * @param other The Group to be consumed.  Other will be unusable after this.
     * @returns The items that were in the other Group.
     */
    consume(other: Group) {
      const contents = this.#contents;
      const result = other.#contents;
      result.forEach((item) => contents.add(item));
      other.#contents = undefined!;
      return result;
    }
    get valid(): boolean {
      return !!this.#contents?.has(this.debugInitialCell);
    }
  }

  /**
   * The first index is the row number.
   * The second index is the column number.
   */
  type AllGroupCells = ReadonlyArray<ReadonlyArray<GroupCell>>;

  /**
   * There is exactly one GroupCell per cell.
   * It points back to its current group.
   */
  class GroupCell {
    /**
     * The group currently associated with this cell.
     * This can change frequently.
     */
    #group: Group;
    private constructor(readonly piece: T) {
      // Initially we have one group per piece.
      this.#group = new Group(this);
    }
    get color(): Color {
      return this.piece.color;
    }
    /**
     * Create a `GroupCell` for each piece.
     * @param allPieces What we want to show.
     * @returns The GUI that we are using to show it.
     */
    private static createAll(
      allPieces: readonly (readonly T[])[]
    ): AllGroupCells {
      return allPieces.map((row) => row.map((piece) => new GroupCell(piece)));
    }
    /**
     * Combine two groups, if they contain the same color pieces.
     * @param other Another group which is adjacent to `this` group.
     */
    private tryCombine(other: GroupCell) {
      if (this.#group != other.#group && this.color == other.color) {
        /**
         * `this` group will grow to contain each member of the
         * `other` group.  And the `other` group will be marked as
         * `!valid` so we don't accidentally try to use it again.
         *
         * `allChanged` contains a list of what was originally in
         * the other group.
         */
        const allChanged = this.#group.consume(other.#group);
        // Update the GroupCell objects.
        // Everything that was in the `other` group is now in `this` group.
        // (Each GroupCell points to its Group, and each Group points to all of its Group objects.)
        allChanged.forEach((changed) => (changed.#group = this.#group));
        if (!this.#group.valid) {
          throw new Error("wtf");
        }
      }
    }
    /**
     * Find all pieces that are touching and have the same color.
     * @param groupCells  Comes from createAll().
     * This function modifies this parameter to show which pieces are touching other pieces of the same color.
     */
    private static combineAll(groupCells: AllGroupCells) {
      groupCells.forEach((row, rowNumber) => {
        row.forEach((groupCell, columnNumber) => {
          if (rowNumber) {
            // Check the current piece against the piece above it.
            const previousRowNumber = rowNumber - 1;
            const otherGroupCell = groupCells[previousRowNumber][columnNumber];
            groupCell.tryCombine(otherGroupCell);
          }
          if (columnNumber) {
            // Check the current piece against the piece to its left.
            const previousColumnNumber = columnNumber - 1;
            const otherGroupCell = row[previousColumnNumber];
            groupCell.tryCombine(otherGroupCell);
          }
        });
      });
    }
    /**
     * Find all pieces that need to be removed from the board.
     * @param groupCells Comes from combineAll().
     * @returns A list of groups with 3 or more Pieces.
     */
    private static findBigGroups(groupCells: AllGroupCells) {
      const countByGroup = new Map<Group, number>();
      groupCells.forEach((row) =>
        row.forEach((groupCell) => {
          const group = groupCell.#group;
          const previousCount = countByGroup.get(group) ?? 0;
          countByGroup.set(group, previousCount + 1);
        })
      );
      const result: Group[] = [];
      for (const [group, count] of countByGroup) {
        if (count >= 3) {
          result.push(group);
        }
      }
      return result;
    }
    /**
     *
     * @param allPieces The current state of the board.
     * @returns A list of all groups of pieces which can be removed.
     */
    static findActionable(allPieces: readonly (readonly T[])[]): Group[] {
      const allGroupCells = this.createAll(allPieces);
      this.combineAll(allGroupCells);
      return this.findBigGroups(allGroupCells);
    }
  }

  /**
   * All of these pieces will go away.
   *
   * The GUI will highlight the pieces in `destroyByBomb[0]` all at once, then a brief pause, then
   * the pieces in `destroyByBomb[1]` all at once.  This is to show how one bomb can set off a second bomb, which
   * then sets off a third.
   *
   * These pieces move off the board _after_ they have been highlighted
   * for a moment, similar to making the other pieces fly away _after_
   * the group decorations flashed for a moment.  So the user knows
   * why the each piece is being destroyed.
   */
  function destroyByBomb(
    board: readonly (readonly T[])[],
    groups: readonly (readonly T[])[]
  ): T[][] {
    const location = new Map<
      T,
      { readonly rowIndex: number; readonly columnIndex: number }
    >();
    board.forEach((row, rowIndex) =>
      row.forEach((piece, columnIndex) => {
        location.set(piece, { rowIndex, columnIndex });
      })
    );
    const result: T[][] = [];
    let recentlyDeleted = groups.flat();
    const alreadyHandled = new Set<T>(recentlyDeleted);
    while (true) {
      /**
       * These bombs were set off in the previous round.
       * We need to record which new cells get deleted by these bombs.
       */
      const newBombs = recentlyDeleted.filter((piece) => piece.bomb);
      if (newBombs.length == 0) {
        break;
      }
      recentlyDeleted = [];
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
          newBombs.forEach((piece) => {
            const { rowIndex, columnIndex } = location.get(piece)!;
            const possible =
              board[rowIndex + rowOffset]?.[columnIndex + columnOffset];
            if (possible && !alreadyHandled.has(possible)) {
              recentlyDeleted.push(possible);
              alreadyHandled.add(possible);
            }
          });
        }
      }
      result.push(recentlyDeleted);
    }
    return result;
  }

  const groups: ReadonlyArray<ReadonlyArray<T>> = GroupCell.findActionable(
    allPieces
  ).map((group) => group.contents);
  const explosions = destroyByBomb(allPieces, groups);
  return { groups, explosions };
}
