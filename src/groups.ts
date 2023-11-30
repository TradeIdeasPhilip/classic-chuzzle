/**
 * This file exports findActionable() and hides a lot of the details.
 */

import { Color, LogicalBoard, Piece } from "./logical-board";

/**
 * A list of pieces that are all the same color and adjacent.
 */
export class Group {
  #contents = new Set<GroupCell>();
  get contents(): ReadonlySet<GroupCell> {
    return this.#contents;
  }
  static #nextDebugId = 0;
  #debugId = Group.#nextDebugId++;
  readonly debugInitialGroup: GroupCell;
  /**
   * This is aimed at console.log() or console.table().
   * The format is likely to change.
   */
  debugInfo() {
    return {
      row: this.debugInitialGroup.row,
      column: this.debugInitialGroup.column,
      contents: this.valid ? this.#contents.size : "invalid",
      id: this.#debugId,
    };
  }
  readonly color: Color;
  constructor(initialContents: GroupCell) {
    this.color = initialContents.color;
    this.debugInitialGroup = initialContents;
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
    return !!this.#contents?.has(this.debugInitialGroup);
  }
}

/**
 * The first index is the row number.
 * The second index is the column number.
 */
type AllGroupCells = ReadonlyArray<ReadonlyArray<GroupCell>>;

/**
 * A lot of the data in this program is readonly.
 * GroupCell has values that can be modified.
 * This is required internally by the algorithm that finds colors that are touching.
 *
 * There is exactly one GroupCell per cell.
 */
class GroupCell {
  /**
   * The group currently associated with this cell.
   * This can change frequently.
   */
  #group: Group;
  private constructor(
    readonly row: number,
    readonly column: number,
    readonly piece: Piece
  ) {
    // Initially we have one group per piece.
    this.#group = new Group(this);
  }
  get color(): Color {
    return this.piece.color;
  }
  /**
   * Show an entire board full of new pieces.
   *
   * This will replace the old GUI with the new GUI all at once, with no animations.
   * @param allPieces What we want to show.
   * @returns The GUI that we are using to show it.
   */
  private static createAll(logicalBoard: LogicalBoard): AllGroupCells {
    return logicalBoard.allPieces.map((row, rowNumber) =>
      row.map(
        (piece, columnNumber) => new GroupCell(rowNumber, columnNumber, piece)
      )
    );
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
  static findActionable(logicalBoard: LogicalBoard): Group[] {
    const allGroupCells = this.createAll(logicalBoard);
    this.combineAll(allGroupCells);
    return this.findBigGroups(allGroupCells);
  }
}

export function findActionable(logicalBoard: LogicalBoard): Group[] {
  return GroupCell.findActionable(logicalBoard);
}
