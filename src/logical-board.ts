/**
 * This file describes the logic of the game, with no reference to any specific GUI.
 */

import { initializedArray, pick } from "phil-lib/misc";
import { Group, findActionable } from "./groups";
import { positiveModulo, rotateArray } from "./utility";

//
/**
 * The background colors for the pieces.
 *
 * Currently these are all valid html colors but at some point I need to add "rainbow".
 */
export type Color = "red" | "green" | "blue" | "yellow" | "orange" | "violet";

/**
 * Each legal color listed once.
 */
const colors: readonly Color[] = [
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "violet",
];

/**
 * What is in each cell.
 */
export type Piece = {
  readonly color: Color;
  /**
   * A placeholder.  Eventually I need to deal with 2⨉2 pieces.
   */
  readonly weight: number;
};

/**
 * The first index is the row number, the second is the column number.
 */
type AllPieces = ReadonlyArray<ReadonlyArray<Piece>>;

type ColumnAnimation = {
  addFromTop: Piece[];
  addFromBottom: Piece[];
  indicesToRemove: Set<number>;
};

/**
 * An entire board, with no GUI.
 */
export class LogicalBoard {
  static readonly SIZE = 6;
  private constructor(public readonly allPieces: AllPieces) {}

  /**
   *
   * @param columnIndex
   * @returns A _new_ array containing the `Piece`s in the given column.
   */
  getColumn(columnIndex: number) {
    return this.allPieces.map((row) => row[columnIndex]);
  }

  static randomPiece(): Piece {
    return { weight: 1, color: pick(colors) };
  }
  static createRandom(): LogicalBoard {
    // Start with completely random pieces.
    const pieces = initializedArray(LogicalBoard.SIZE, () =>
      initializedArray(LogicalBoard.SIZE, this.randomPiece)
    );
    // See if there are any groups that could immediately go away.
    const groups = findActionable(new LogicalBoard(pieces));
    // Break up the groups, so nothing will happen until the user makes his first move.
    groups.forEach((group) => {
      group.contents.forEach(({ row, column }) => {
        const nearby = new Set<Color>();
        [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ].forEach(([rowOffset, columnOffset]) => {
          const rowArray = pieces[row + rowOffset];
          if (rowArray) {
            const piece = rowArray[column + columnOffset];
            if (piece) {
              nearby.add(piece.color);
            }
          }
        });
        pieces[row][column] = {
          color: pick(colors.filter((color) => !nearby.has(color))),
          weight: 1,
        };
      });
    });
    return new this(pieces);
  }

  /**
   * Rotate a single row.  Like when the user drags a piece left or right.
   * @param rowNumber Which row to rotate.
   * @param by How many places left to move each piece.
   * Positive numbers move to the left, and negative numbers move to the right.
   * Must be a 32 bit integer.
   * 0 and large values are handled efficiently.
   * @returns A LogicalBoard with the requested configuration.
   * This will reuse as many objects as it can, and will create new objects as needed.
   */
  rotateLeft(rowNumber: number, by: number): LogicalBoard {
    const originalRow = this.allPieces[rowNumber];
    const newRow = rotateArray(originalRow, by);
    if (originalRow == newRow) {
      // No change.  Return the original.
      return this;
    } else {
      // One row changed.  Reuse the arrays for the other rows.
      return new LogicalBoard(
        this.allPieces.map((row) => (row == originalRow ? newRow : row))
      );
    }
  }

  /**
   * Rotate a single column.  Like when the user moves a piece up or down.
   * @param columnNumber Which column to rotate.
   * @param by How many places up to move each piece.
   * Positive numbers move up, and negative numbers move down.
   * Must be a 32 bit integer.
   * 0 and large values are handled efficiently.
   * @returns A LogicalBoard with the requested configuration.
   * This will reuse as many objects as it can, and will create new objects as needed.
   */
  rotateUp(columnNumber: number, by: number): LogicalBoard {
    const numberOfRows = this.allPieces.length;
    // Simplify things by forcing by to be in [0, numberOfRows)
    by = positiveModulo(by, numberOfRows);
    if (by == 0) {
      // No change.  Return the original.
      return this;
    } else {
      return new LogicalBoard(
        this.allPieces.map((row, rowNumber) => {
          // First, create a copy of the row, so we can modify the copy.
          const result = [...row];
          // Then update the item in the column that is rotating.
          result[columnNumber] =
            this.allPieces[(rowNumber + by) % numberOfRows][columnNumber];
          return result;
        })
      );
    }
  }

  /**
   * Rearrange the pieces that we want to remove and create replacement pieces.
   *
   * This doesn't know anything about the GUI except that it will try to show individual steps.
   * @param groupsToRemove
   * @returns A list of instruction for each column, and the final state of the board.
   */
  compileAnimation(groupsToRemove: Group[]): {
    columns: ColumnAnimation[];
    final: LogicalBoard;
  } {
    /**
     * The array index is the column number.
     * The entries in each set are the row numbers.
     */
    const allIndicesToRemove = initializedArray(
      LogicalBoard.SIZE,
      () => new Set<number>()
    );
    groupsToRemove.forEach((group) => {
      group.contents.forEach(({ row, column }) => {
        const set = allIndicesToRemove[column];
        if (set.has(row)) {
          throw new Error("wtf"); // Duplicate.
        }
        set.add(row);
      });
    });
    // Note this implementation is a bit simple.  Eventually we will
    // need to deal with 2⨉2 chuzzle pieces.  That's why there's an
    // addFromBottom section.
    const columns = allIndicesToRemove.map(
      (indicesToRemove): ColumnAnimation => {
        return { addFromBottom: [], addFromTop: [], indicesToRemove };
      }
    );
    /**
     * The first index is the row number, the second is the column number.
     *
     * This will eventually be returned as a LogicalBoard, but for now
     * none of the arrays are read only.
     */
    const final = initializedArray(
      LogicalBoard.SIZE,
      () => new Array<Piece>(LogicalBoard.SIZE)
    );
    columns.forEach((columnAnimation, columnIndex) => {
      const indicesToRemove = allIndicesToRemove[columnIndex];
      const newColumn: Piece[] = [];
      for (
        let originalRowIndex = 0;
        originalRowIndex < LogicalBoard.SIZE;
        originalRowIndex++
      ) {
        if (!indicesToRemove.has(originalRowIndex)) {
          newColumn.push(this.allPieces[originalRowIndex][columnIndex]);
        }
      }
      while (newColumn.length < LogicalBoard.SIZE) {
        const newPiece = LogicalBoard.randomPiece();
        columnAnimation.addFromTop.push(newPiece);
        newColumn.unshift(newPiece);
      }
      newColumn.forEach(
        (piece, finalRowIndex) => (final[finalRowIndex][columnIndex] = piece)
      );
    });
    return { columns, final: new LogicalBoard(final) };
  }
}
