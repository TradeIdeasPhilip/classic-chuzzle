/**
 * This file describes the logic of the game, with no reference to any specific GUI.
 *
 * This file is aware of the GUI, but there are strict interfaces between the inputs,
 * this file, and the outputs.
 *
 * user-inputs.ts always initiates new actions.  Some actions are immediate and others
 * return promises to `void`.  user-inputs.ts must `await` those promises,
 * but otherwise it knows nothing about the state of this file or display-outputs.ts.
 *
 * This file sends requests to display-output.ts.  Some actions are immediate and others
 * return promises to `void`.
 *
 * GuiPiece and LogicalPiece each have their own rowIndex and columnIndex.  That is
 * useful when adding animations.  logical-board can focus on where a piece needs
 * to move.  display-output knows for certain where the piece currently is.  These
 * can update separately; you don't need any special coordination between the sides.
 */

import {
  initializedArray,
  pick,
  positiveModulo,
  rotateArray,
  take,
} from "phil-lib/misc";
import { findActionable } from "./groups";

/**
 * These are the changes that will have to happen if the user leaves the
 * board in a particular state.
 *
 * This is basically a list of pieces to destroy.
 * The rest of the details are hints to the GUI.
 */
export type Actionable = ReturnType<typeof findActionable<LogicalPieceImpl>>;

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
 * Rotate a single rowIndex.  Like when the user drags a piece left or right.
 * @param original Start from here.  Do not modify the `original` in any way.
 * @param rowNumber Which rowIndex to rotate.
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
    return original.map((rowIndex, rowNumber) => {
      // First, create a copy of the rowIndex, so we can modify the copy.
      const result = [...rowIndex];
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
export type Color =
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "orange"
  | "violet"
  | "whitesmoke";

/**
 * Each legal color listed once.
 */
export const colors: readonly Color[] = [
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "violet",
  "whitesmoke",
];

/**
 * What is in each cell.
 */
export type LogicalPiece = {
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly color: Color;
  readonly bomb: boolean;
};

class LogicalPieceImpl implements LogicalPiece {
  /**
   * A placeholder.  Eventually I need to deal with 2⨉2 pieces.
   */
  readonly weight = 1;
  bomb = false;
  constructor(
    public rowIndex: number,
    public columnIndex: number,
    readonly color: Color = LogicalPieceImpl.randomColor()
  ) {}
  static randomColor() {
    return pick(colors);
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
 * One object controls an entire _group of groups_, to make sure two groups don't try to use the same decoration at the same time.
 */
export type GroupGroupActions = {
  /**
   * Called when we first start to collect the groups.  I.e. right before the pieces start flying off the board.
   * @param counter How many times in a rowIndex we've collected a group since the user's last move.  1 for the first time,
   * 2 for the second, etc.
   * @param bombCount The number of cells destroyed by a bomb.
   * If something was in a group, and destroyed by a bomb, the
   * group gets the score, not this.
   */
  addToScore(counter: number): void;
  /**
   * Show which pieces are about to be collected or would hypothetically
   * be collected if the user let go now.
   *
   * Highlight which pieces are part of which groups.
   */
  highlightGroups(): void;
};

export type Animator = {
  /**
   * Tell the GUI that we are going to use new pieces.  The GUI will
   * dispose of any previous pieces and add all of these.
   * @param piece This is the LogicalPiece that we want to display.
   * It is safe (and expected) for the GUI to use these pieces as
   * keys in a `Map`.
   */
  initializeBoard(pieces: LogicalPiece[]): void;

  /**
   * When the user is dragging the mouse we send constant updates to the GUI.
   * @param direction Which coordinate to keep fixed and which to change.
   * @param pieces The pieces to move.  The order of `pieces` is not important.
   * @param offset How far to move each piece.  Positive numbers mean right or down.
   * Negative numbers mean left or up.  This number is relative to the position in
   * each individual `Piece`.
   */
  drawPreview(
    direction: "vertical" | "horizontal",
    pieces: readonly LogicalPiece[],
    offset: number
  ): void;

  /**
   * Move the GuiPiece to the position specified in the given LogicalPiece.
   * Animate the move from the GUI element's current position to this new position,
   * then leave this element in its new position.
   * The element will take the shortest path, either by moving directly from start to finish,
   * or by moving in the opposite direction and wrapping around.
   *
   * Presumably this will come after a series of calls to drawPreview().  The preview
   * allows fractional positions, and it allows illegal positions.  After the program
   * determines the final locations of each Piece, this function will move the pieces
   * from the last preview location to their final location.
   *
   * Note:  This function and drawPreview() both take a list of pieces while
   * slideTo() works on individual pieces.  Originally I thought that grouping
   * these operations together was required.  Then I thought it wasn't required, but
   * it would help optimize things.  Now I don't see any value to accepting a whole
   * array in some functions.  It's not a huge problem, but it is inconsistent.
   * @param direction Which coordinate to keep fixed and which to change.
   * @param pieces The pieces to move.  The order of `pieces` is not important.
   */
  rotateTo(
    direction: "vertical" | "horizontal",
    pieces: readonly LogicalPiece[]
  ): Promise<void>;

  /**
   *
   * @param groups
   */
  assignGroupDecorations(actionable: Actionable): GroupGroupActions;

  /**
   * Update the board after making a move.
   *
   * Several actions are all sent to the GUI at once because some of the operations overlap.
   *
   * This covers one set of groups all disappearing and being replaced by new tiles.  If that
   * creates new groups, this function will be called again.
   * @param request Specific details of what to animate.
   */
  updateBoard(request: UpdateInstructions): Promise<void>;
};

export type UpdateInstructions = {
  /**
   * New pieces that the GUI has not seen before.
   */
  add: {
    /**
     * A suggestion for the GUI.
     * Start the animation from this row.
     * Then move to the location in the `piece`.
     */
    initialRow: number;
    /**
     * The new piece.
     */
    piece: LogicalPiece;
  }[];
  /**
   * Each of these pieces will be flung off the board,
   * never to be seen or heard from again.
   */
  remove: LogicalPiece[];
  /**
   * This is aimed a a group of 6 cells.  Each of the 6 gets
   * assigned a bomb.  Then the bomb moves to another cell
   * as the initial cell is about to be cleared.
   *
   * The top level array contains one entry per group.
   * Each group is an array of pieces.
   * The animations for each piece in a group are offset slightly in time.
   * If there are multiple groups, they can overlap in time.
   */
  flingBomb: { source: LogicalPiece; destination: LogicalPiece }[][];
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
  destroyByBomb: LogicalPiece[][];
  /**
   * 1 if the user just made a move.  I.e. 1st move in the series.
   * 2 if this is the first automatic move after the user's move.  I.e. 2nd move in the series.
   * Increment for each move in the series.
   *
   * The affects the speed of the animations.
   * They start slow so you can see what's going on.
   * And they speed up so you don't get bored.
   */
  counter: number;
};

/**
 * The first index is the rowIndex number, the second is the column number.
 */
type AllPieces = ReadonlyArray<ReadonlyArray<LogicalPieceImpl>>;

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
    return this.#allPieces.map((rowIndex) => rowIndex[columnIndex]);
  }

  constructor(private readonly animator: Animator) {
    this.#allPieces = LogicalBoard.#createRandom();
    this.animator.initializeBoard(this.#allPieces.flat());
  }
  static #createRandom() {
    // Start with completely random pieces.
    const result = initializedArray(LogicalBoard.SIZE, (rowIndex) =>
      initializedArray(
        LogicalBoard.SIZE,
        (columnIndex) => new LogicalPieceImpl(rowIndex, columnIndex)
      )
    );
    /**
     *  Any groups that could immediately go away.
     */
    const { groups } = findActionable(result);
    // Break up the groups, so nothing will happen until the user makes his first move.
    groups.forEach((group) => {
      group.forEach(({ rowIndex, columnIndex }) => {
        const nearby = new Set<Color>();
        [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ].forEach(([rowOffset, columnOffset]) => {
          const rowArray = result[rowIndex + rowOffset];
          if (rowArray) {
            const piece = rowArray[columnIndex + columnOffset];
            if (piece) {
              nearby.add(piece.color);
            }
          }
        });
        const newPiece = new LogicalPieceImpl(
          rowIndex,
          columnIndex,
          pick(colors.filter((color) => !nearby.has(color)))
        );
        result[rowIndex][columnIndex] = newPiece;
        // This was some debug code. 
        // I wanted to create more bombs more quickly.
        //newPiece.bomb = true;
      });
    });
    return result;
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
  private async updateLoop(actionable: Actionable, actions: GroupGroupActions) {
    for (let counter = 1; actionable.groups.length > 0; counter++) {
      /**
       * When we get a group with exactly 5 tiles, we immediately add a bomb to one of the pieces
       * and add that peace to this set.  This tile cannot be removed and this bomb can not be set
       * off until the next iteration of this loop, when this variable and set are recreated.
       */
      const immuneFromDestruction = new Set<LogicalPiece>();
      const bombFlingingSources: (readonly LogicalPieceImpl[])[] = [];
      actionable.groups.forEach((group) => {
        if (group.length > 5) {
          bombFlingingSources.push(group);
        } else if (group.length == 5) {
          const addBombToThisPiece = pick(group); // TODO pick the middle piece.
          addBombToThisPiece.bomb = true;
          immuneFromDestruction.add(addBombToThisPiece);
        }
      });
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
      actions.addToScore(counter);

      const piecesToRemove = actionable.groups.flatMap((group) =>
        group.filter((piece) => !immuneFromDestruction.has(piece))
      );
      actionable.explosions.forEach((epoch) =>
        epoch.forEach((piece) => piecesToRemove.push(piece))
      );
      const piecesToAdd = this.removePieces(piecesToRemove);

      const availableDestinations = this.#allPieces
        .flat()
        .filter((piece) => !piece.bomb);
      const flingBomb = bombFlingingSources.map((group) => {
        const trajectories: {
          source: LogicalPieceImpl;
          destination: LogicalPieceImpl;
        }[] = [];
        group.forEach((source) => {
          if (!source.bomb && availableDestinations.length > 0) {
            const destination = take(availableDestinations);
            trajectories.push({ source, destination });
          }
        });
        return trajectories;
      });

      await this.animator.updateBoard({
        remove: piecesToRemove,
        counter,
        flingBomb,
        destroyByBomb: actionable.explosions,
        add: piecesToAdd,
      });

      flingBomb.flat().forEach(({ destination }) => (destination.bomb = true));

      actionable = findActionable(this.#allPieces);
      actions = this.animator.assignGroupDecorations(actionable);
      actions.highlightGroups();
    }
    // Tell the GUI that we are done?  In the previous code we did this:
    //       GUI.#newScoreDiv.innerHTML = "";
    //GUI.#chainBonusDiv.innerHTML = "";
  }
  private setAllPieces(allPieces: AllPieces) {
    this.#allPieces = allPieces;
    allPieces.forEach((row, rowIndex) => {
      row.forEach((piece, columnIndex) => {
        piece.columnIndex = columnIndex;
        piece.rowIndex = rowIndex;
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
      const actionable: Actionable = findActionable(pieces);
      const actions = this.animator.assignGroupDecorations(actionable);
      return { actions, actionable, pieces };
    });
    const preview = (offset: number): void => {
      const row = this.#allPieces[rowIndex];
      this.animator.drawPreview("horizontal", row, offset);
      allPossibilities[roundedOffset(offset)].actions.highlightGroups();
    };
    const release = async (offset: number): Promise<void> => {
      preview(offset);
      const proposedOffset = roundedOffset(offset);
      const revert =
        allPossibilities[proposedOffset].actionable.groups.length == 0;
      const finalOffset = revert ? 0 : proposedOffset;
      const finalState = allPossibilities[finalOffset]; // drawOffsetNow(row, 2.3, "row").  All relative to the original position of the cells.  same for drawOffsetAnimated() versions.  update the internal state after the animation has finished.  NO CHANGES AT all in LogicalBoard or LogicalPiece until the animation is done.  GuiPiece will keep track on the position while previewing.
      this.setAllPieces(finalState.pieces);
      const row = this.#allPieces[rowIndex];
      await this.animator.rotateTo("horizontal", row);
      await this.updateLoop(finalState.actionable, finalState.actions);
    };
    return { preview, release };
  }

  startVerticalMove(columnIndex: number): PointerActions {
    /**
     * How to highlight the groups we might see in each position.
     * We store these so if the user moves the mouse up and down,
     * he will see the same colors and symbols each time.
     */
    const allPossibilities = initializedArray(LogicalBoard.SIZE, (index) => {
      const pieces = rotateUp(this.#allPieces, columnIndex, -index);
      const actionable: Actionable = findActionable(pieces);
      const actions = this.animator.assignGroupDecorations(actionable);
      return { actions, actionable, pieces };
    });
    const preview = (offset: number): void => {
      const column = this.getColumn(columnIndex);
      this.animator.drawPreview("vertical", column, offset);
      allPossibilities[roundedOffset(offset)].actions.highlightGroups();
    };
    const release = async (offset: number): Promise<void> => {
      preview(offset);
      const proposedOffset = roundedOffset(offset);
      const revert =
        allPossibilities[proposedOffset].actionable.groups.length == 0;
      const finalOffset = revert ? 0 : proposedOffset;
      const finalState = allPossibilities[finalOffset];
      this.setAllPieces(finalState.pieces);
      const column = this.getColumn(columnIndex);
      await this.animator.rotateTo("vertical", column);
      await this.updateLoop(finalState.actionable, finalState.actions);
    };
    return { preview, release };
  }

  /**
   * Update the board.  Create new pieces to replace the old pieces.
   * Update the pieces and the board with the new positions.
   * @param piecesToRemove
   * @returns A list of new pieces.
   * Each piece includes an initialRow, so the GUI knows where to start the animation.
   */
  private removePieces(piecesToRemove: LogicalPiece[]) {
    /**
     * The array index is the column number.
     * The entries in each set are the rowIndex numbers.
     */
    const allIndicesToRemove = initializedArray(
      LogicalBoard.SIZE,
      () => new Set<number>()
    );
    piecesToRemove.forEach(({ rowIndex, columnIndex }) => {
      const set = allIndicesToRemove[columnIndex];
      if (set.has(rowIndex)) {
        throw new Error("wtf"); // Duplicate.
      }
      set.add(rowIndex);
    });
    /**
     * The first index is the row number, the second is the column number.
     */
    const final = initializedArray(
      LogicalBoard.SIZE,
      () => new Array<LogicalPieceImpl>(LogicalBoard.SIZE)
    );
    const newPieces: { initialRow: number; piece: LogicalPieceImpl }[] = [];
    // Note this implementation is a bit simple.  Eventually we will
    // need to deal with 2⨉2 chuzzle pieces.  Some `Piece`'s will have
    // to be added from the bottom.
    allIndicesToRemove.forEach((indicesToRemove, columnIndex) => {
      const newColumn: LogicalPieceImpl[] = [];
      for (
        let originalRowIndex = 0;
        originalRowIndex < LogicalBoard.SIZE;
        originalRowIndex++
      ) {
        if (!indicesToRemove.has(originalRowIndex)) {
          // Keep this piece, but possibly move it down.
          newColumn.push(this.#allPieces[originalRowIndex][columnIndex]);
        }
      }
      for (let i = 0; newColumn.length < LogicalBoard.SIZE; i++) {
        const initialRow = -1 - i;
        const newPiece = new LogicalPieceImpl(NaN, columnIndex);
        newPieces.push({ initialRow, piece: newPiece });
        newColumn.unshift(newPiece);
      }

      newColumn.forEach((piece, finalRowIndex) => {
        final[finalRowIndex][columnIndex] = piece;
        piece.columnIndex = columnIndex;
        piece.rowIndex = finalRowIndex;
      });
    });

    this.setAllPieces(final);
    return newPieces;
  }
}
