/**
 * This file describes the logic of the game, with no reference to any specific GUI.
 *
 * This was a mistake.  It feels like I'm doing everything twice.  I should not have
 * associated so much of the logic with the state of the board like this.  The LogicalBoard
 * wants to share its current state, but the GUI want's to focus on the steps involved.
 * It's a total mismatch.
 */

import { initializedArray, pick } from "phil-lib/misc";
import { Groups, findActionable } from "./groups";
import { positiveModulo, rotateArray } from "./utility";

/**
 * If the user let go now, how many cells should we try to rotate?
 * (Previously known as `proposedOffset()`.)
 * @param offset How far the user has moved the pointer.  This might include fractions.
 * @returns This is always an integer between 0 and (LogicalBoard.SIZE - 1).
 */
const roundedOffset = (offset: number): number => {
  return positiveModulo(Math.round(offset), LogicalBoard.SIZE);
};

/**
 * Useful when we display a `GuiPiece` partway off the board.
 * This attaches to piece to whichever side leaves more of the piece on the board.
 * @param change
 * @returns A value between -½ and LogicalBoard.SIZE - ½.
 */
const wrap = (change: number) => {
  return positiveModulo(change + 0.5, LogicalBoard.SIZE) - 0.5;
};

/**
 * Rotate a single row.  Like when the user drags a piece left or right.
 * @param original Start from here.  Do not modify the `original` in any way.
 * @param rowNumber Which row to rotate.
 * @param by How many places left to move each piece.
 * Positive numbers move to the left, and negative numbers move to the right.
 * Must be a 32 bit integer.
 * 0 and large values are handled efficiently.
 * @returns The requested configuration.
 * This will reuse as many objects as it can, and will create new objects as needed.
 */
function rotateLeft(
  original: AllPieces,
  rowNumber: number,
  by: number
): AllPieces {
  const originalRow = original[rowNumber];
  const newRow = rotateArray(originalRow, by);
  if (originalRow == newRow) {
    // No change.  Return the original.
    return original;
  } else {
    return original.map((row) => (row == originalRow ? newRow : row));
  }
}

/**
 * Rotate a single column.  Like when the user moves a piece up or down.
 * @param original Start from here.  Do not modify the `original` in any way.
 * @param columnNumber Which column to rotate.
 * @param by How many places up to move each piece.
 * Positive numbers move up, and negative numbers move down.
 * Must be a 32 bit integer.
 * 0 and large values are handled efficiently.
 * @returns The requested configuration.
 * This will reuse as many objects as it can, and will create new objects as needed.
 */
function rotateUp(
  original: AllPieces,
  columnNumber: number,
  by: number
): AllPieces {
  const numberOfRows = original.length;
  // Simplify things by forcing by to be in [0, numberOfRows)
  by = positiveModulo(by, numberOfRows);
  if (by == 0) {
    // No change.  Return the original.
    return original;
  } else {
    return original.map((row, rowNumber) => {
      // First, create a copy of the row, so we can modify the copy.
      const result = [...row];
      // Then update the item in the column that is rotating.
      result[columnNumber] =
        original[(rowNumber + by) % numberOfRows][columnNumber];
      return result;
    });
  }
}

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
export class Piece {
  async remove(): Promise<void> {
    // This is a placeholder.  Presumably the GUI will want to override this method.
  }
  /**
   * A placeholder.  Eventually I need to deal with 2⨉2 pieces.
   */
  readonly weight = 1;
  #bomb = false;
  isBomb() {
    return this.#bomb;
  }
  makeBomb() {
    this.#bomb = true;
  }
  #row: number;
  #column: number;
  constructor(row: number, column: number, readonly color: Color) {
    this.#row = row;
    this.#column = column;
  }
  static randomColor() {
    return pick(colors);
  }
  get row() {
    return this.#row;
  }
  get column() {
    return this.#column;
  }
  moveToImmediately(row: number, column: number) {
    this.#row = row;
    this.#column = column;
  }
  moveToAnimated(row: number, column: number): Promise<unknown> {
    this.moveToImmediately(row, column);
    return Promise.resolve();
  }
}

export type PointerActions = {
  /**
   * Update the GUI to show would would happen if the user released the mouse button here.
   * The GUI updates immediately.
   * @param offset How far right or down the pointer moved in SVG units.
   * Negative numbers for left or up.
   */
  preview(offset: number): void;
  /**
   * Update the board based on the user's current choice.
   * @param offset How far right or down the pointer moved in SVG units.
   * @returns A promise that will resolve when the animation for this change is done.
   */
  release(offset: number): Promise<void>;
};

/**
 * This controls all of the groups on the screen at once.
 * 
 * One object controls an entire _group of groups_, to make sure two groups don't try to use the same decoration.
 */
export type GroupGroupActions = {
  /**
   *  Called when we first start to collect the groups.  I.e. right before the pieces start flying off the board.
   * @param counter How many times in a row we've collected a group since the user's last move.  1 for the first time,
   * 2 for the second, etc.
   */
  addToScore(counter: number): Promise<void>;
  /**
   * Show which pieces are about to be collected or would hypothetically
   * be collected if the user let go now.
   *
   * Highlight which pieces are part of which groups.
   */
  highlightGroups(): void;
};

export type Animator = {
  createPiece(row: number, column: number, color: Color): Piece;
  rotateDown(column: readonly Piece[], offset: number): Promise<void>;
  rotateRight(row: readonly Piece[], offset: number): Promise<void>;
  assignGroupDecorations(
    groups: ReadonlyArray<ReadonlyArray<Piece>>
  ): GroupGroupActions;
};

/**
 * The first index is the row number, the second is the column number.
 */
export type AllPieces = ReadonlyArray<ReadonlyArray<Piece>>;

/**
 * An entire board, with no GUI.
 */
export class LogicalBoard {
  static readonly SIZE = 6;
  #allPieces: AllPieces;

  /**
   *
   * @param columnIndex
   * @returns A _new_ array containing the `Piece`s in the given column.
   */
  private getColumn(columnIndex: number) {
    return this.#allPieces.map((row) => row[columnIndex]);
  }

  constructor(private readonly animator: Animator) {
    this.#allPieces = this.createRandom();
  }
  private createRandomPiece(rowNumber: number, columnNumber: number) {
    return this.animator.createPiece(
      rowNumber,
      columnNumber,
      Piece.randomColor()
    );
  }
  private createRandom() {
    // Start with completely random pieces.
    const result = initializedArray(LogicalBoard.SIZE, (rowNumber) =>
      initializedArray(
        LogicalBoard.SIZE,
        (columnNumber) =>
          new Piece(rowNumber, columnNumber, Piece.randomColor())
      )
    );
    // See if there are any groups that could immediately go away.
    const groups = findActionable(result);
    // Break up the groups, so nothing will happen until the user makes his first move.
    groups.forEach((group) => {
      group.forEach(({ row, column }) => {
        const nearby = new Set<Color>();
        [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ].forEach(([rowOffset, columnOffset]) => {
          const rowArray = result[row + rowOffset];
          if (rowArray) {
            const piece = rowArray[column + columnOffset];
            if (piece) {
              nearby.add(piece.color);
            }
          }
        });
        result[row][column] = new Piece(
          row,
          column,
          pick(colors.filter((color) => !nearby.has(color)))
        );
      });
    });
    return result.map((row) =>
      row.map((piece) =>
        this.animator.createPiece(piece.row, piece.column, piece.color)
      )
    );
  }

  /**
   * Collect all of the pieces in groups.
   * Replace those materials.
   * Repeat until there are no groups on the screen.
   * @param groups The groups that can currently be harvested.
   * These are the first groups available to remove.
   * This method will automatically check for additional groups after that.
   * 
   * We could recompute this, but not the `actions`.
   * @param actions The GUI associated with these `groups`.
   * We could try to recompute these, but we want this part of the display to match the preview that we've already shown.
   */
  private async updateLoop(groups: Groups, actions: GroupGroupActions) {
    for (let counter = 1; groups.length > 0; counter++) {
      await actions.addToScore(counter);
      await this.removeGroups(groups);
      groups = findActionable(this.#allPieces);
      actions = this.animator.assignGroupDecorations(groups);
      actions.highlightGroups();
    }
    // Tell the GUI we are done?  In the previous code we did this:
    //       GUI.#newScoreDiv.innerHTML = "";
    //GUI.#chainBonusDiv.innerHTML = "";
  }
  private setAllPieces(allPieces: AllPieces) {
    this.#allPieces = allPieces;
    allPieces.forEach((row, rowIndex) => {
      row.forEach((piece, columnIndex) => {
        piece.moveToImmediately(rowIndex, columnIndex); 
      });
    });
  }
  startHorizontalMove(rowIndex: number): PointerActions {
    /**
     * How to highlight the groups we might see in each position.
     * We store these so if the user moves the mouse back and forth,
     * he will see the same colors and symbols each time.
     */
    const allPossibilities = initializedArray(LogicalBoard.SIZE, (index) => {
      const pieces = rotateLeft(this.#allPieces, rowIndex, -index);
      const groups = findActionable(pieces);
      const actions = this.animator.assignGroupDecorations(groups);
      return { actions, groups, pieces };
    });
    const preview = (offset: number): void => {
      const row = this.#allPieces[rowIndex];
      row.forEach((piece, columnIndex) =>
        piece.moveToImmediately(rowIndex, wrap(columnIndex + offset))
      );
      allPossibilities[roundedOffset(offset)].actions.highlightGroups();
    };
    const release = async (offset: number): Promise<void> => {
      preview(offset);
      const proposedOffset = roundedOffset(offset);
      const revert = allPossibilities[proposedOffset].groups.length == 0;
      const finalOffset = revert ? 0 : proposedOffset;
      const row = this.#allPieces[rowIndex];
      await this.animator.rotateRight(row, finalOffset - offset);  // SIOMETHING WRONG WITH THE ANIMATION where the wrow or colyumn tries to snap to the nearest legal move.
      const finalState = allPossibilities[finalOffset];
      this.setAllPieces(finalState.pieces);
      await this.updateLoop(finalState.groups, finalState.actions);
    };
    return { preview, release };
  }

  startVerticalMove(columnIndex: number): PointerActions {
    /**
     * How to highlight the groups we might see in each position.
     * We store these so if the user moves the mouse back and forth,
     * he will see the same colors and symbols each time.
     */
    const allPossibilities = initializedArray(LogicalBoard.SIZE, (index) => {
      const pieces = rotateUp(this.#allPieces, columnIndex, -index);
      const groups = findActionable(pieces);
      const actions = this.animator.assignGroupDecorations(groups);
      return { actions, groups, pieces };
    });
    const preview = (offset: number): void => {
      const column = this.getColumn(columnIndex);
      column.forEach((piece, rowIndex) =>
        piece.moveToImmediately(wrap(rowIndex + offset), columnIndex) );
      allPossibilities[roundedOffset(offset)].actions.highlightGroups();
    };
    const release = async (offset: number): Promise<void> => {
      preview(offset);
      const proposedOffset = roundedOffset(offset);
      const revert = allPossibilities[proposedOffset].groups.length == 0;
      const finalOffset = revert ? 0 : proposedOffset;
      const column = this.getColumn(columnIndex);
      await this.animator.rotateDown(column, finalOffset-offset);

      //Need to fix this.  rotateDown() and rotateLeft() should call
      // the original Piece.moveToImmediately(), just like
      // GuiPiece.moveToAnimated() does.  In both cases
      // Logical Board is asking display-output.ts to make a movement
      // from the current position to a specified position.  In both
      // cases display-output should update the internal state of the
      // piece so we don't have to worry about updating that value
      // before or after or during the animation.

      //await sleep(500);
      const finalState = allPossibilities[finalOffset];
      this.#allPieces = finalState.pieces;
      this.setAllPieces(finalState.pieces);
      await this.updateLoop(finalState.groups, finalState.actions);
    };
    return { preview, release };
  }

  private async removeGroups(groupsToRemove: Groups) {
    /**
     * The array index is the column number.
     * The entries in each set are the row numbers.
     */
    const allIndicesToRemove = initializedArray(
      LogicalBoard.SIZE,
      () => new Set<number>()
    );
    const promises: Promise<unknown>[] = [];
    groupsToRemove.forEach((group) => {
      group.forEach(({ row, column }) => {
        const set = allIndicesToRemove[column];
        if (set.has(row)) {
          throw new Error("wtf"); // Duplicate.
        }
        set.add(row);
        promises.push(this.#allPieces[row][column].remove());
      });
    });
    await Promise.all(promises);
    promises.length = 0;
    /**
     * The first index is the row number, the second is the column number.
     */
    const final = initializedArray(
      LogicalBoard.SIZE,
      () => new Array<Piece>(LogicalBoard.SIZE)
    );
    // Note this implementation is a bit simple.  Eventually we will
    // need to deal with 2⨉2 chuzzle pieces.  Some `Piece`'s will have
    // to be added from the bottom.
    allIndicesToRemove.forEach((indicesToRemove, columnIndex) => {
      const newColumn: Piece[] = [];
      for (
        let originalRowIndex = 0;
        originalRowIndex < LogicalBoard.SIZE;
        originalRowIndex++
      ) {
        if (!indicesToRemove.has(originalRowIndex)) {
          newColumn.push(this.#allPieces[originalRowIndex][columnIndex]);
        }
      }
      for (let i = 0; newColumn.length < LogicalBoard.SIZE; i++) {
        const initialRow = -1 - i;
        const newPiece = this.createRandomPiece(initialRow, columnIndex);
        newColumn.unshift(newPiece);
      }
      newColumn.forEach((piece, finalRowIndex) => {
        final[finalRowIndex][columnIndex] = piece;
        promises.push(piece.moveToAnimated(finalRowIndex, columnIndex));
      });
    });
    this.setAllPieces(final);
    await Promise.all(promises);
  }
}
