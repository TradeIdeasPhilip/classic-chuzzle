import "./style.css";
import { assertClass, initializedArray, makeLinear, pick } from "phil-lib/misc";
import { getById } from "phil-lib/client-misc";

{
  let showNext = "☆";
  setInterval(() => {
    document.title = `${showNext} Classic Chuzzle`;
    showNext = showNext == "☆" ? "★" : "☆";
  }, 1000);
}
/**
 * This is similar to `numerator % denominator`, i.e. modulo division.
 * The difference is that the result will never be negative.
 * If the numerator is negative `%`  will return a negative number.
 *
 * If the 0 point is chosen arbitrarily then you should use `positiveModulo()` rather than `%`.
 * For example, C's `time_t` and JavaScript's `Date.prototype.valueOf()` say that 0 means midnight January 1, 1970.
 * Negative numbers refer to times before midnight January 1, 1970, and positive numbers refer to times after midnight January 1, 1970.
 * But midnight January 1, 1970 was chosen arbitrarily, and you probably don't want to treat times before that differently than times after that.
 * And how many people would even think to test a negative date?
 *
 * `positiveModulo(n, d)` will give the same result as `positiveModulo(n + d, d)` for all vales of `n` and `d`.
 * (You might get 0 sometimes and -0 other times, but those are both `==` so I'm not worried about that.)
 */
function positiveModulo(numerator: number, denominator: number) {
  const simpleAnswer = numerator % denominator;
  if (simpleAnswer < 0) {
    return simpleAnswer + Math.abs(denominator);
  } else {
    return simpleAnswer;
  }
}

// The background colors for the pieces.
type Color = "red" | "green" | "blue" | "yellow" | "orange" | "violet";

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
type Piece = {
  readonly color: Color;
  /**
   * A placeholder.  Eventually I need to deal with 2⨉2 pieces.
   */
  readonly weight: number;
};

/**
 * One of these for each piece on the board.
 * These objects own the DOM Element objects.
 *
 * These are semi-disposable.
 * Sometimes it's nice to animate these as they move.
 * But sometimes it's easier to throw the old ones away and start fresh.
 *
 * I separated GuiPiece from Piece in case the GUI changed.
 */
class GuiPiece {
  /**
   * The GuiPiece elements will go on this #board.
   */
  static #board = getById("board", SVGElement);
  static #pieceTemplate = getById(
    "piece",
    HTMLTemplateElement
  ).content.querySelector("g")!;
  readonly element: SVGGElement;

  /**
   * Move the piece to the given position.
   * @param row 0 for the first row, 1 for the second.  Fractions and negative values work.
   * @param column  0 for the first row, 1 for the second.  Fractions and negative values work.
   */
  setPosition(row: number, column: number) {
    this.element.setAttribute("transform", `translate(${column}, ${row})`);
  }
  /**
   *
   * @param row 0 for the top row.  Can be negative or fractional.
   * @param column 0 for the left column. Can be negative for fractional.
   * @returns Instructions to move a piece to the given position.
   * This is an a format appropriate for GuiPiece.element.animate().
   */
  static setPosition(row: number, column: number): Keyframe {
    return { transform: `translate(${column}px, ${row}px)` };
  }
  static readonly #BACK_LINK = Symbol("GuiPiece");
  constructor(public readonly piece: Piece) {
    (piece as any)[GuiPiece.#BACK_LINK] = this;
    const clone = assertClass(
      GuiPiece.#pieceTemplate.cloneNode(true),
      SVGGElement
    );
    this.element = clone;
    clone.setAttribute("fill", piece.color);
    GuiPiece.#board.appendChild(clone);
  }
  static for(piece: Piece): GuiPiece {
    // The following doesn't work because of TypeScript.
    // I think it's complaining because assertClass requires a constructor
    // with 0 arguments, but GuiPiece does not have such a constructor.
    //return assertClass((piece as any)[this.#BACK_LINK], GuiPiece)
    const result = (piece as any)[this.#BACK_LINK];
    if (!(result instanceof GuiPiece)) {
      console.error(result);
      throw new Error("wtf");
    }
    // This is more than a little ugly.  Maybe we have more than one
    // GUI?  Maybe each GUI needs a map from Piece objects to GuiPiece
    // objects.
    return result;
  }
  /**
   * Remove this object from the GUI.
   */
  remove() {
    this.element.remove();
  }
}

/**
 * The first index is the row number, the second is the column number.
 */
type AllPieces = ReadonlyArray<ReadonlyArray<Piece>>;

/**
 * This does a non-destructive rotate.
 * It will not modify the original.
 * It will return the rotated version.
 *
 * E.g.
 * `rotateArray(['A', 'b', 'c', 'd', 'e'], 1)` returns ['b', 'c', 'd', 'e', 'A'].
 * `rotateArray(['A', 'b', 'c', 'd', 'e'], 2)` returns ['c', 'd', 'e', 'A', 'b'].
 * `rotateArray(['A', 'b', 'c', 'd', 'e'], -1)` returns ['e', 'A', 'b', 'c', 'd'].
 *
 * Rotating by 0 or by a large number is handled efficiently.
 * @param input The array to rotate.  Must contain at least one element.
 * @param by How many items to rotate.  Must be a 32 bit integer.
 * @returns The original array if no changes were requested.  Or a new array with the given changes.
 */
function rotateArray<T>(input: ReadonlyArray<T>, by: number) {
  if ((by | 0) != by) {
    throw new Error(`invalid input: ${by}`);
  }
  by = positiveModulo(by, input.length);
  if (by == 0) {
    return input;
  } else {
    return [...input.slice(by), ...input.slice(0, by)];
  }
}

/**
 * A lot of the data in this program is readonly.
 * GroupHolder has values that can be modified.
 * This is required internally by the algorithm that finds colors that are touching.
 *
 * There is exactly one GroupHolder per cell.
 */
class GroupHolder {
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
  private static createAll(allPieces: AllPieces): AllGroupHolders {
    return allPieces.map((row, rowNumber) =>
      row.map(
        (piece, columnNumber) => new GroupHolder(rowNumber, columnNumber, piece)
      )
    );
  }
  /**
   * Combine two groups, if they contain the same color pieces.
   * @param other Another group which is adjacent to `this` group.
   */
  private tryCombine(other: GroupHolder) {
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
      // Update the GroupHolder objects.
      // Everything that was in the `other` group is now in `this` group.
      // (Each GroupHolder points to its Group, and each Group points to all of its Group objects.)
      allChanged.forEach((changed) => (changed.#group = this.#group));
      if (!this.#group.valid) {
        throw new Error("wtf");
      }
    }
  }
  /**
   * Find all pieces that are touching and have the same color.
   * @param groupHolders  Comes from createAll().
   * This function modifies this parameter to show which pieces are touching other pieces of the same color.
   */
  private static combineAll(groupHolders: AllGroupHolders) {
    groupHolders.forEach((row, rowNumber) => {
      row.forEach((groupHolder, columnNumber) => {
        if (rowNumber) {
          // Check the current piece against the piece above it.
          const previousRowNumber = rowNumber - 1;
          const otherGroupHolder =
            groupHolders[previousRowNumber][columnNumber];
          groupHolder.tryCombine(otherGroupHolder);
        }
        if (columnNumber) {
          // Check the current piece against the piece to its left.
          const previousColumnNumber = columnNumber - 1;
          const otherGroupHolder = row[previousColumnNumber];
          groupHolder.tryCombine(otherGroupHolder);
        }
      });
    });
  }
  /**
   * Find all pieces that need to be removed from the board.
   * @param groupHolders Comes from combineAll().
   * @returns A list of groups with 3 or more Pieces.
   */
  private static findBigGroups(groupHolders: AllGroupHolders) {
    const countByGroup = new Map<Group, number>();
    groupHolders.forEach((row) =>
      row.forEach((groupHolder) => {
        const group = groupHolder.#group;
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
  static findActionable(allPieces: AllPieces): Group[] {
    const allGroupHolders = this.createAll(allPieces);
    this.combineAll(allGroupHolders);
    return this.findBigGroups(allGroupHolders);
  }
}

/**
 * A list of pieces that are all the same color and adjacent.
 */
class Group {
  #contents = new Set<GroupHolder>();
  get contents(): ReadonlySet<GroupHolder> {
    return this.#contents;
  }
  static #nextDebugId = 0;
  #debugId = Group.#nextDebugId++;
  readonly debugInitialGroup: GroupHolder;
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
  constructor(initialContents: GroupHolder) {
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
 * An entire board, with no GUI.
 */
class LogicalBoard {
  static readonly SIZE = 6;
  private constructor(public readonly allPieces: AllPieces) {}
  static randomPiece(): Piece {
    return { weight: 1, color: pick(colors) };
  }
  static createRandom(): LogicalBoard {
    // Start with completely random pieces.
    const pieces = initializedArray(LogicalBoard.SIZE, () =>
      initializedArray(LogicalBoard.SIZE, this.randomPiece)
    );
    // See if there are any groups that could immediately go away.
    const groups = GroupHolder.findActionable(pieces);
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
}

type ColumnAnimation = {
  addFromTop: Piece[];
  addFromBottom: Piece[];
  indicesToRemove: Iterable<number>;
};

function compileAnimation(
  initialBoard: LogicalBoard,
  groupsToRemove: Group[]
): {
  columns: ColumnAnimation[];
  final: AllPieces;
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
  const columns = allIndicesToRemove.map((indicesToRemove): ColumnAnimation => {
    const addFromTop = initializedArray(
      indicesToRemove.size,
      LogicalBoard.randomPiece
    );
    return { addFromBottom: [], addFromTop, indicesToRemove };
  });
  /**
   * The first index is the row number, the second is the column number.
   *
   * This will eventually be returned as a AllPieces, but for now
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
        newColumn.push(initialBoard.allPieces[columnIndex][originalRowIndex]);
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
  return { columns, final };
}

class GUI {
  private constructor() {
    GUI.#staticInit;
    throw new Error("wtf");
  }
  static #currentlyVisible: GuiPiece[][] = [];
  static #currentBoard: LogicalBoard = LogicalBoard.createRandom();
  static get currentBoard(): LogicalBoard {
    return this.#currentBoard;
  }
  static set currentBoard(newBoard: LogicalBoard) {
    this.#currentBoard = newBoard;
    this.draw();
    this.hideTemporaries();
  }
  private static hideTemporaries(): void {}
  static readonly #backgroundColors: ReadonlyMap<
    string,
    ReadonlyArray<string>
  > = new Map([
    [
      "orange",
      [
        "cyan",
        "brown",
        "white",
        "darkviolet",
        "lightyellow",
        "darkgreen",
        "darkolivegreen",
        "darkred",
      ],
    ],
    [
      "yellow",
      [
        "brown",
        "darkviolet",
        "lightcoral",
        "lightsalmon",
        "lightseagreen",
        "darkblue",
        "darkcyan",
        "darkgoldenrod",
        "darkgreen",
        "darkkhaki",
        "darkolivegreen",
        "darkorange",
        "darkred",
        "darksalmon",
        "darkseagreen",
      ],
    ],
    [
      "violet",
      ["cyan", "brown", "white", "darkviolet", "lightgreen", "darkblue"],
    ],
    [
      "blue",
      [
        "cyan",
        "white",
        "lightcoral",
        "lightgreen",
        "lightgray",
        "lightsalmon",
        "lightseagreen",
        "lightseagreen",
        "lightskyblue",
        "lightslategray",
        "darkorange",
        "darkseagreen",
        "darkturquoise",
      ],
    ],
    [
      "red",
      [
        "cyan",
        "white",
        "lightcoral",
        "lightgreen",
        "lightsalmon",
        "darkkhaki",
        "darkseagreen",
        "chartreuse",
      ],
    ],
    [
      "green",
      [
        "cyan",
        "white",
        "lightcoral",
        "lightcyan",
        "lightgreen",
        "lightyellow",
        "darkred",
        "darkseagreen",
        "chartreuse",
      ],
    ],
  ]);
  static readonly #decorations: ReadonlyArray<string> = [
    "ʻ",
    "☆",
    "𝛿",
    "∞",
    "•",
    "⭑",
    "†",
    "‡",
    "؟",
    "*",
    "◦",
    "§",
    "_",
    "ɝ",
    "Ԕ",
    "⟳",
    "⚐",
    "🜚",
    "愛",
    "❝",
    "ℵ",
    "を",
    "ᇸ",
    "ڰ",
    "ॾ",
    "ৼ",
    "ན",
    "ᛧ",
    "ß",
    "⧕",
    "↯",
    "➷",
    "⅋",
    "☙",
    "„",
    "⌥",
    "⧷",
    "⁎",
    "╕",
    "₰",
    "…",
    "⑈",
    "۽",
    "ₜ",
    "ಠ",
    "෴",
    "ጃ",
    "ᔱ",
    "ᔰ",
    "Ѧ",
    "ᑥ",
    //    "☃",
    // https://unicodeemoticons.com/cool_text_icons_and_pictures.htm
    // https://jrgraphix.net/r/Unicode/2600-26FF
  ];
  /**
   * Find any groups that could be deleted, and highlight them on the
   * screen.
   * @param
   */
  private static showGroups(board: LogicalBoard) {
    const groups = GroupHolder.findActionable(board.allPieces);
    if (groups.length > 0) {
      const decorations = [...this.#decorations];
      groups.forEach((group) => {
        const decorationColor = pick(this.#backgroundColors.get(group.color)!);
        const decorationIndex = Math.floor(Math.random() * decorations.length);
        const decorationText = decorations[decorationIndex];
        decorations.splice(decorationIndex, 1);
        group.contents.forEach((groupHolder) => {
          const gElement = GuiPiece.for(groupHolder.piece).element;
          const textElement = gElement.querySelector("text")!;
          textElement.textContent = decorationText;
          textElement.style.fill = decorationColor;
        });
      });
    }
  }
  /**
   * Hide any text drawn as part of showGroups().
   */
  private static removeGroups() {
    this.#currentlyVisible.forEach((row) =>
      row.forEach(
        (guiPiece) => (guiPiece.element.querySelector("text")!.textContent = "")
      )
    );
  }
  private static draw() {
    this.resetAll();
    this.#currentlyVisible = this.#currentBoard.allPieces.map(
      (row, rowNumber) => {
        return row.map((piece, columnNumber) => {
          const guiPiece = new GuiPiece(piece);
          guiPiece.setPosition(rowNumber, columnNumber);
          return guiPiece;
        });
      }
    );
  }
  private static resetAll() {
    this.#currentlyVisible.forEach((row) => {
      row.forEach((piece) => {
        piece.remove();
      });
    });
    this.#currentlyVisible = [];
    this.hideTemporaries();
  }
  static #staticInit: void = (() => {
    this.draw();
    const board = getById("board", SVGElement);
    function translateCoordinates(pointerEvent: PointerEvent) {
      const rect = board.getBoundingClientRect();
      const yToRow = makeLinear(rect.top, 0, rect.bottom, LogicalBoard.SIZE);
      const xToColumn = makeLinear(rect.left, 0, rect.right, LogicalBoard.SIZE);
      return {
        row: yToRow(pointerEvent.clientY),
        column: xToColumn(pointerEvent.clientX),
      };
    }
    let dragState: "none" | "started" | "horizontal" | "vertical" = "none";
    let dragStartRow = -1;
    let dragStartColumn = -1;
    let fixedIndex = -1;
    board.addEventListener("pointerdown", (pointerEvent) => {
      if (dragState == "none") {
        pointerEvent.stopPropagation();
        dragState = "started";
        board.setPointerCapture(pointerEvent.pointerId);
        const initial = translateCoordinates(pointerEvent);
        dragStartRow = initial.row;
        dragStartColumn = initial.column;
        board.style.cursor = "move";
      }
    });
    /**
     * If the user let go now, how many cells should we try to rotate?
     * @param pointerEvent
     * @returns
     */
    const proposedOffset = (pointerEvent: PointerEvent): number => {
      if (dragState == "none") {
        return 0;
      } else {
        const current = translateCoordinates(pointerEvent);
        if (dragState == "horizontal") {
          return positiveModulo(
            Math.round(dragStartColumn - current.column),
            LogicalBoard.SIZE
          );
        } else if (dragState == "vertical") {
          return positiveModulo(
            Math.round(dragStartRow - current.row),
            LogicalBoard.SIZE
          );
        } else if (dragState == "started") {
          return 0;
        }
      }
      throw new Error("wtf");
    };
    let possibleMoves: { board: LogicalBoard; groups: Group[] }[] | undefined;
    /**
     * Which row or column we are closest to.
     *
     * As you slide a row or column you get previews of what groups
     * would form if you let go now.  You do **not** have to be perfectly
     * lined up to get the preview.  The program shows you whichever
     * position you are closest to.  I.e. the position gets _rounded_
     * to the nearest integer before it is stored in previewOffset.
     *
     * Invariant:  (previewOffset >= 0) && (previewOffset < LogicalBoard.SIZE)
     * proposedOffset() is the preferred way to update this.
     */
    let previewOffset = 0;
    board.addEventListener("pointermove", (pointerEvent) => {
      if (dragState == "none") {
        return;
      }
      pointerEvent.stopPropagation();
      const current = translateCoordinates(pointerEvent);
      if (dragState == "started") {
        const rowDiff = Math.abs(current.row - dragStartRow);
        const columnDiff = Math.abs(current.column - dragStartColumn);
        if (Math.max(rowDiff, columnDiff) < 0.05) {
          return;
        } else if (rowDiff > columnDiff) {
          dragState = "vertical";
          board.style.cursor = "ns-resize";
          fixedIndex = Math.floor(dragStartColumn);
        } else if (columnDiff > rowDiff) {
          dragState = "horizontal";
          board.style.cursor = "ew-resize";
          fixedIndex = Math.floor(dragStartRow);
        } else {
          return;
        }
        fixedIndex = Math.max(0, Math.min(LogicalBoard.SIZE, fixedIndex));
        if (possibleMoves) {
          // It would be tempting to throw an exception here.
          // But it like continuing would leave the program in a better state.
          console.error("unexpected", possibleMoves);
        }
        const translate = dragState == "vertical" ? "rotateUp" : "rotateLeft";
        possibleMoves = initializedArray(LogicalBoard.SIZE, (by) => {
          const board = this.#currentBoard[translate](fixedIndex, by);
          const groups = GroupHolder.findActionable(board.allPieces);
          return { board, groups };
        });
        previewOffset = 0;
      }
      const wrap = (change: number) => {
        return positiveModulo(change + 0.5, LogicalBoard.SIZE) - 0.5;
      };
      if (dragState == "horizontal") {
        // TODO
        // Remove the call to display the groups when we display the board.  DONE
        // In pointerdown we only reset some variables.
        // We don't try to display the groups.  DONE
        // It's slightly simpler this way and the should be no groups so it shouldn't matter.
        // Set the previewOffset to 0.  DONE
        // Each call to pointermove, if possibleMoves has been initialized,
        // Check the current previewOffset.
        // If the value has changed, then {
        //   Store the new value of previewOffset.
        //   Clear any group indications from the screen.
        //   Clear the relevant timer, if one is active.
        //   Set a new timer for 250 ms,
        //   Store the timer's id in case we need to cancel it.
        //   When the timer goes off, display the current group info.
        //}
        // Set possibleMoves to undefined in pointerup.
        // How to draw the groups:
        // Try using the existing code as is,
        // It might be wrong, but it's a good starting place.
        // TODO Add an animation.
        const moveLeft = dragStartColumn - current.column;
        const row = this.#currentlyVisible[fixedIndex];
        row.forEach((guiPiece, columnIndex) => {
          guiPiece.setPosition(fixedIndex, wrap(columnIndex - moveLeft));
        });
      } else if (dragState == "vertical") {
        const moveUp = dragStartRow - current.row;
        this.#currentlyVisible.forEach((row, rowIndex) => {
          const guiPiece = row[fixedIndex];
          guiPiece.setPosition(wrap(rowIndex - moveUp), fixedIndex);
        });
      }
      if (possibleMoves) {
        const newPreviewOffset = proposedOffset(pointerEvent);
        if (newPreviewOffset != previewOffset) {
          previewOffset = newPreviewOffset;
          this.removeGroups();
          //   Clear the relevant timer, if one is active.
          //   Set a new timer for 250 ms,
          //   Store the timer's id in case we need to cancel it.
          this.showGroups(possibleMoves[previewOffset].board);
        }
      }
    });
    board.addEventListener("lostpointercapture", async (pointerEvent) => {
      // lostpointercapture will happen with pointer up or pointercancel.
      // So lostpointercapture is the safer option.
      // The user has slid a row or column by some offset.
      // Put the board back into a sane state.  The offset will be rounded to
      // the nearest integer.  If that is not a valid spot, i.e. there are no
      // cells to delete, then move back to the original spot before the
      // user started moving anything.  Do not say
      // this.currentBoard = proposedBoard(pointerEvent);
      // the setter for currentBoard would destroy the visual indication of
      // the groups.
      {
        if (!possibleMoves) {
          console.warn("Does this even happen?");
          // Maybe this should throw an exception?
          // This does happen!  I'm not sure why.
          // I saw 4 of these in a row in my console.
        } else {
          const offset = proposedOffset(pointerEvent);
          const moves = possibleMoves[offset];
          console.log("possibleMoves[proposedOffset(pointerEvent)]", moves);
          const { newBoard, newOffset } =
            moves.groups.length == 0
              ? {
                  newBoard: this.currentBoard,
                  newOffset: 0,
                }
              : {
                  newBoard: moves.board,
                  newOffset: offset,
                };
          const promises: Promise<void>[] = [];
          const animatedMove = (
            guiPiece: GuiPiece,
            destinationRow: number,
            destinationColumn: number
          ) => {
            const duration = 1000;
            const animation = guiPiece.element.animate(
              [
                //GuiPiece.setPosition(destinationRow - 3, destinationColumn - 3),
                GuiPiece.setPosition(destinationRow, destinationColumn),
              ],
              { duration }
            );
            promises.push(
              animation.finished.then(() =>
                guiPiece.setPosition(destinationRow, destinationColumn)
              )
            );
          };
          if (dragState == "horizontal") {
            const moveLeft = newOffset;
            const row = this.#currentlyVisible[fixedIndex];
            row.forEach((guiPiece, columnIndex) => {
              animatedMove(
                guiPiece,
                fixedIndex,
                positiveModulo(columnIndex - moveLeft, LogicalBoard.SIZE)
              );
            });
          } else if (dragState == "vertical") {
            const moveUp = newOffset;
            this.#currentlyVisible.forEach((row, rowIndex) => {
              const guiPiece = row[fixedIndex];
              animatedMove(
                guiPiece,
                positiveModulo(rowIndex - moveUp, LogicalBoard.SIZE),
                fixedIndex
              );
            });
          }
          if (promises.length > 0) {
            this.#currentBoard = newBoard;
            this.#currentlyVisible = this.#currentBoard.allPieces.map((row) =>
              row.map((piece) => GuiPiece.for(piece))
            );
            await Promise.all(promises);
            // TODO What about the case where one or more goes all the way around?
            // That doesn't look good now.  It needs to be fixed.
            // It needs to work just like normal sliding.
            // TODO Timing is terrible.  It always takes the same
            // amount of time to do this whether we move 0 pixels or
            // half way around.  The time for the animation is proportional
            // to the square root of the distance.
            // TODO The faster we go, the bigger the overshoot should be.
            // Use a cubic bezier for the timing function.
          }
        }
      }

      possibleMoves = undefined;
      dragState = "none";
      board.style.cursor = "";
      while (true) {
        const groups = GroupHolder.findActionable(this.currentBoard.allPieces);
        if (groups.length == 0) {
          break;
        }
        const { columns, final } = compileAnimation(this.currentBoard, groups);
        final; // TODO actually use this!!!!
        columns.forEach((columnAnimation, columnIndex) => {
          for (const rowIndex of columnAnimation.indicesToRemove) {
            //this.#currentlyVisible[rowIndex][columnIndex].element.style.opacity="0.125";
            const element =
              this.#currentlyVisible[rowIndex][columnIndex].element;
            element.animate(
              [
                GuiPiece.setPosition(rowIndex, columnIndex),
                GuiPiece.setPosition(
                  LogicalBoard.SIZE * 1.5 + Math.random() * 2,
                  Math.random() * LogicalBoard.SIZE
                ),
              ],
              { duration: 1000, easing: "ease-in" }
            );
            // Does not work for svg:
            //element.style.zIndex="3";
            element.parentElement?.appendChild(element);
          }
        });
        break;
      }
      // TODO restore the mouse.
    });
  })();
}

/**
 * The first index is the row number.
 * The second index is the column number.
 */
type AllGroupHolders = ReadonlyArray<ReadonlyArray<GroupHolder>>;

function checkGroups() {
  const groups = GroupHolder.findActionable(GUI.currentBoard.allPieces);
  console.log(groups);
}

// Debug stuff.  All of the functions below will automatically be called by the GUI.
// This allows me to test the functions in isolation,
// and to test them before the GUI is ready.

(window as any).checkGroups = checkGroups;

(window as any).rotateLeft = (rowNumber: number, by: number) => {
  GUI.currentBoard = GUI.currentBoard.rotateLeft(rowNumber, by);
};

(window as any).rotateUp = (columnNumber: number, by: number) => {
  GUI.currentBoard = GUI.currentBoard.rotateUp(columnNumber, by);
};

// This is a nice way to view the events.
// But I'm not working on that right now and this display can be distracting.
/*
{
  const eventNames = [
    "pointerover",
    "pointerenter",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointercancel",
    "pointerout",
    "pointerleave",
    "gotpointercapture",
    "lostpointercapture",
  ] as const;
  const allEventsContainer = document.createElement("div");
  document.body.appendChild(allEventsContainer);
  const svgElement = document.querySelector("svg")!;
  eventNames.forEach((eventName) => {
    let eventElement = document.createElement("div");
    eventElement.innerText = eventName;
    eventElement.style.color = "lightgrey";
    allEventsContainer.appendChild(eventElement);
    let firstTime = false;
    svgElement.addEventListener(eventName, (pointerEvent) => {
      if (firstTime) {
        console.log(eventName, pointerEvent, eventElement);
        firstTime = false;
      }
      eventElement.remove();
      eventElement = document.createElement("div");
      eventElement.innerText = eventName;
      eventElement.classList.add("event-fired");
      allEventsContainer.insertBefore(
        eventElement,
        allEventsContainer.firstElementChild
      );
    });
  });
}
*/
