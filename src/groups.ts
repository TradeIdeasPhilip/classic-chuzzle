/**
 * This file exports findActionable() and hides a lot of the details.
 */

import { AllPieces, Color, Piece } from "./logical-board";

/**
 * This is all we really need from the Piece class.
 */
type HasColor = { readonly color:Color};

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
  private constructor(readonly piece: HasColor) {
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
  private static createAll(allPieces: readonly(readonly HasColor[])[]): AllGroupCells {
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
  static findActionable(allPieces: readonly(readonly HasColor[])[]): Group[] {
    const allGroupCells = this.createAll(allPieces);
    this.combineAll(allGroupCells);
    return this.findBigGroups(allGroupCells);
  }
}

/**
 * Each entry in this array represents one group.
 *
 * Although this has the same type signature as `AllPieces`, these are
 * both used in completely different ways.  For one thing, the arrays
 * involved with `AllPieces` all have length of `LogicalBoard.SIZE`.
 * The arrays involved with `Groups` are of all different sizes.
 */
export type Groups = ReadonlyArray<ReadonlyArray<Piece>>;

export function findActionable(allPieces: AllPieces): Groups {
  return GroupCell.findActionable(allPieces).map((group) => group.contents as Piece[]);
}
