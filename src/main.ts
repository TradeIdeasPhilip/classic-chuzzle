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
  static removeAll() {
    this.#board.innerHTML = "";
  }
  /**
   * The GuiPiece elements will go on this #board.
   */
  static #board = getById("board", SVGElement);
  static #pieceTemplate = getById(
    "piece",
    HTMLTemplateElement
  ).content.querySelector("g")!;
  readonly element: SVGGElement;

  static readonly #positionColumn = CSS.px(Math.E);
  static readonly #positionRow = CSS.px(Math.PI);
  static readonly #positionHelper = new CSSTransformValue([
    new CSSTranslate(this.#positionColumn, this.#positionRow),
  ]);

  #row = 0;
  get row() {
    return this.#row;
  }
  #column = 0;
  get column() {
    return this.#column;
  }

  /**
   * Move the piece to the given position.
   * @param row 0 for the first row, 1 for the second.  Fractions and negative values work.
   * @param column  0 for the first row, 1 for the second.  Fractions and negative values work.
   */
  setPosition(row: number, column: number) {
    GuiPiece.#positionColumn.value = this.#column = column;
    GuiPiece.#positionRow.value = this.#row = row;
    this.element.attributeStyleMap.set("transform", GuiPiece.#positionHelper);
  }
  animateMove(
    row: number,
    column: number,
    options: number | KeyframeAnimationOptions
  ) {
    const initialColumn = this.#column;
    const initialRow = this.#row;
    this.setPosition(row, column);
    const element = this.element;
    // Does not work for svg: element.style.zIndex="3";
    // So instead I'm moving it to the end of the list to get the same effect.
    element.parentElement?.appendChild(element);
    const animation = element.animate(
      [
        { transform: `translate(${initialColumn}px, ${initialRow}px)` },
        { transform: `translate(${column}px, ${row}px)` },
      ],
      options
    );
    /*
    console.log(
      `translate(${initialColumn}px, ${initialRow}px)`,
      `translate(${column}px, ${row}px)`
    );
    */
    return animation.finished;
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

type ColumnAnimation = {
  addFromTop: Piece[];
  addFromBottom: Piece[];
  indicesToRemove: Set<number>;
};

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
  }
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
    "𝄢",
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
    GuiPiece.removeAll();
    this.#currentlyVisible = [];
  }
  static animationOptions(needToMove: number): KeyframeAnimationOptions {
    /**
     * Four seconds if you go all the way across the board.
     */
    const duration = (Math.abs(needToMove) * 4000) / LogicalBoard.SIZE;
    return {
      duration,
      easing: "ease-in-out",
    };
  }
  /**
   * Set up the event handlers.
   */
  static #staticInit: void = (() => {
    this.draw();
    const board = getById("board", SVGElement);
    /**
     *
     * @param pointerEvent The browser gives mouse data to the program when an event occurs.  The program cannot ask for this data at other times.
     * @returns The mouse position in the same units as the SVG uses.
     * - 1 is the height and width of a single`GuiPiece`.
     * - (0, 0) is the top left corner of the board.
     * - Fractions are possible.
     * - Values can be off the board because the program does a mouse capture.
     */
    function translateCoordinates(pointerEvent: PointerEvent) {
      const rect = board.getBoundingClientRect();
      const yToRow = makeLinear(rect.top, 0, rect.bottom, LogicalBoard.SIZE);
      const xToColumn = makeLinear(rect.left, 0, rect.right, LogicalBoard.SIZE);
      return {
        row: yToRow(pointerEvent.clientY),
        column: xToColumn(pointerEvent.clientX),
      };
    }
    /**
     * - `none` — We are not currently tracking the mouse.  This is the ideal place to start tracking the mouse.
     * - `started` — The user clicked the mouse but hasn't moved the mouse yet.  Or hasn't moved it enough for the program to notice it.
     * - `horizontal` — The user moved the mouse left or right, so the program is moving items left and right.  Any movement up or down is ignored.
     * - `vertical` — The user moved the mouse up or down, so the program is moving items up and down.  Any movement left or right is ignored.
     * - `animation` — The user let go of the mouse and the program is displaying something.  The program ignores any user input until the animation finishes.
     */
    let dragState:
      | "none"
      | "started"
      | "horizontal"
      | "vertical"
      | "animation" = "none";
    /**
     * Where was the most recent mouse down event.
     */
    let dragStartRow = -1;
    /**
     * Where was the most recent mouse down event.
     */
    let dragStartColumn = -1;
    /**
     * If `dragState == "horizontal"` this is the row number.
     * If `dragState == "vertical"` this is the column number.
     */
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
     *
     * @param pointerEvent This contains the current position of the mouse.
     * It is not possible to read from the mouse at arbitrary times.
     * @returns How far left or up the mouse has moved since mouse down.
     * This can be negative  if the mouse moved right or down.  This can
     * be greater than LogicalBoard.SIZE.  This will be `undefined` if
     * we are not currently moving in any particular direction.
     */
    const relevantMouseMove = (
      pointerEvent: PointerEvent
    ): number | undefined => {
      switch (dragState) {
        case "none":
        case "started":
        case "animation": {
          return undefined;
        }
        case "horizontal": {
          const { column } = translateCoordinates(pointerEvent);
          return dragStartColumn - column;
        }
        case "vertical": {
          const { row } = translateCoordinates(pointerEvent);
          return dragStartRow - row;
        }
      }
      throw new Error("wtf");
    };
    /**
     * If the user let go now, how many cells should we try to rotate?
     * @param pointerEvent
     * @returns This is always an integer between 0 and (LogicalBoard.SIZE - 1).
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
    /**
     * What to do if the user lets go of the mouse.
     *
     * The index should be the output of `proposedOffset()`.
     *
     * `board` is the state of the board if the user let go at that point, before anything was deleted.
     * `groups` is a list of groups to highlight as the user passes through this state, and to delete if the user lets go here.
     */
    let possibleMoves:
      | { readonly board: LogicalBoard; readonly groups: Group[] }[]
      | undefined;
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
      if (dragState == "none" || dragState == "animation") {
        return;
      }
      pointerEvent.stopPropagation();
      /** The current mouse position in SVG coordinates.  */
      const current = translateCoordinates(pointerEvent);
      if (dragState == "started") {
        const rowDiff = Math.abs(current.row - dragStartRow);
        const columnDiff = Math.abs(current.column - dragStartColumn);
        if (Math.max(rowDiff, columnDiff) < 0.05) {
          // The mouse hasn't moved enough.  Don't lock the user into a direction just because he barely jiggled the mouse while clicking.
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
          // Invariant failed.
          throw new Error("wtf");
        }
        const translate = dragState == "vertical" ? "rotateUp" : "rotateLeft";
        possibleMoves = initializedArray(LogicalBoard.SIZE, (by) => {
          const board = this.#currentBoard[translate](fixedIndex, by);
          const groups = GroupHolder.findActionable(board.allPieces);
          return { board, groups };
        });
        previewOffset = 0;
      }
      /**
       * Useful when we display a `GuiPiece` part way off the board.
       * This attaches to piece to whichever side leaves more of the piece on the board.
       * @param change
       * @returns A value between -½ and LogicalBoard.SIZE - ½.
       */
      const wrap = (change: number) => {
        return positiveModulo(change + 0.5, LogicalBoard.SIZE) - 0.5;
      };
      if (dragState == "horizontal") {
        /**
         * How far left the user has moved, in SVG units.
         * Negative numbers move right.
         */
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
      if (dragState == "none" || dragState == "started") {
        // Someone clicked the mouse but didn't move it enough to have any effect.
        // I.e. the GUI hasn't changed at all, and neither has the state of the board.
        dragState = "none";
        board.style.cursor = "";
        if (possibleMoves) {
          // Invariant failed.
          // possibleMoves should be defined if and only if dragState is "horizontal" or "vertical".
          // Note that this leaves the board in a bad state!
          throw new Error("wtf");
        }
        return;
      }

      board.style.cursor = "wait";

      /**
       * The program typically starts multiple animations at the same time.
       */
      const promises: Promise<unknown>[] = [];

      // The user has slid a row or column by some offset.
      // Put the board back into a sane state.  The offset will be rounded to
      // the nearest integer.  If that is not a valid spot, i.e. there are no
      // cells to delete, then move back to the original spot before the
      // user started moving anything.  Do not say
      // this.currentBoard = proposedBoard(pointerEvent);
      // the setter for currentBoard would destroy the visual indication of
      // the groups.
      if (!possibleMoves) {
        // Invariant failed.
        // possibleMoves should be defined if and only if dragState is "horizontal" or "vertical".
        throw new Error("wtf");
      }
      /**
       * How far to move the row or column from the original position.
       * This might _not_ be a legal move.
       * See `newBoard` for the actual amount after the program disables illegal moves.
       */
      const offset = proposedOffset(pointerEvent);
      /**
       * What would happen if the user was allowed to move by `offset` units.
       */
      const moves = possibleMoves[offset];
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
      /**
       * What's the quickest way to get to the goal?
       * Remember that the items can rotate around.
       * This is the number of cells to move down or right.
       * 0 means the board is already correct.
       * Negative numbers means to move left or up.
       */
      const needToMove =
        positiveModulo(
          relevantMouseMove(pointerEvent)! - newOffset + LogicalBoard.SIZE / 2,
          LogicalBoard.SIZE
        ) -
        LogicalBoard.SIZE / 2;
      const options: KeyframeAnimationOptions =
        GUI.animationOptions(needToMove);
      /**
       * How should a `GuiPiece` move?
       * This takes care of the fact that some pieces will wrap around.
       * All pieces will move at the same rate, so the pieces will always be touching.
       * @param initialPosition Where the `GuiPiece` is right now.
       * This is the only part that is different for each piece.
       * The other info comes from variables above.
       * @returns An array of `position`s, an array of times labeled `offset`, and a `finalPosition`.
       * `offset` is in the right format for a PropertyIndexedKeyframes input to `Element.animate()`.
       */
      const makeScript = (initialPosition: number) => {
        const position = [initialPosition];
        const offset = [0];
        const finalPosition = positiveModulo(
          Math.round(initialPosition + needToMove),
          LogicalBoard.SIZE
        );
        if (finalPosition > 5.1) {
          // finalPosition should be an integer ≥ 0 and < LogicalBoard.SIZE
          throw new Error("wtf");
        }
        /**
         * Add points to the script to make the GuiPiece wrap around.
         * @param secondPosition The position of the GuiPiece immediately _before_ it jumps to the other side.
         * @param thirdPosition The position of the GuiPiece immediately _after_ it jumps to the other side.
         */
        const addMiddle = (secondPosition: number, thirdPosition: number) => {
          position.push(secondPosition, thirdPosition);
          /** How far to move _before_ wrapping. */
          const initialSize = Math.abs(initialPosition - secondPosition);
          /** How far to move _after_ wrapping. */
          const finalSize = Math.abs(thirdPosition - finalPosition);
          /** Total amount of the move. */
          const totalSize = initialSize + finalSize;
          /**
           * When to make the jump.  0 would mean at the very beginning.
           * 1 would mean at the very end.  This is the right format for
           * Element.animate().
           */
          const jumpTime = initialSize / totalSize;
          offset.push(jumpTime, jumpTime);
        };
        // If the piece wraps around, add some intermediate points.
        if (Math.sign(needToMove) == -1) {
          if (finalPosition > initialPosition) {
            addMiddle(-0.5, LogicalBoard.SIZE - 0.5);
          }
        } else {
          if (finalPosition < initialPosition) {
            addMiddle(LogicalBoard.SIZE - 0.5, -0.5);
          }
        }
        position.push(finalPosition);
        offset.push(1.0);
        return { position, offset, finalPosition };
      };
      //console.log({ needToMove, duration });
      if (dragState == "horizontal") {
        const row = this.#currentlyVisible[fixedIndex];
        row.forEach((guiPiece) => {
          const {
            position,
            offset,
            finalPosition: finalColumnPosition,
          } = makeScript(guiPiece.column);
          const transform = position.map(
            (column) => `translate(${column}px, ${fixedIndex}px)`
          );
          promises.push(
            guiPiece.element.animate({ transform, offset }, options).finished
          );
          //console.log({ transform, offset });
          guiPiece.setPosition(fixedIndex, finalColumnPosition);
        });
      } else if (dragState == "vertical") {
        this.#currentlyVisible.forEach((row) => {
          const guiPiece = row[fixedIndex];
          const {
            position,
            offset,
            finalPosition: finalRowPosition,
          } = makeScript(guiPiece.row);
          const transform = position.map(
            (row) => `translate(${fixedIndex}px, ${row}px)`
          );
          promises.push(
            guiPiece.element.animate({ transform, offset }, options).finished
          );
          guiPiece.setPosition(finalRowPosition, fixedIndex);
        });
      }

      dragState = "animation";

      if (promises.length > 0) {
        await Promise.all(promises);
        promises.length = 0;
        this.currentBoard = newBoard;
      }
      possibleMoves = undefined;

      // Remove some pieces from the board because the colors matched matched.
      while (true) {
        const groups = GroupHolder.findActionable(this.currentBoard.allPieces);
        if (groups.length == 0) {
          break;
        }
        const { columns, final } = this.currentBoard.compileAnimation(groups);
        // Move the old pieces out of the way.
        columns.forEach((columnAnimation, columnIndex) => {
          for (const rowIndex of columnAnimation.indicesToRemove) {
            const guiPiece = this.#currentlyVisible[rowIndex][columnIndex];
            promises.push(
              guiPiece.animateMove(
                LogicalBoard.SIZE * 1.5 + Math.random() * 2,
                Math.random() * LogicalBoard.SIZE,
                { duration: 1000, easing: "ease-in" }
              )
            );
          }
        });
        await Promise.all(promises);
        promises.length = 0;
        // Move the new pieces onto the board.
        columns.forEach(
          ({ addFromTop, addFromBottom, indicesToRemove }, columnIndex) => {
            if (addFromBottom.length > 0) {
              throw new Error("Not implemented yet.");
            }
            if (
              addFromBottom.length + addFromTop.length !=
              indicesToRemove.size
            ) {
              throw new Error("wtf");
            }
            let needToMove = addFromTop.length;
            const options = GUI.animationOptions(needToMove);
            addFromTop.forEach((piece, index) => {
              const guiPiece = new GuiPiece(piece);
              const initialRow = -(index + 1);
              const finalRow = initialRow + needToMove;
              guiPiece.setPosition(initialRow, columnIndex);
              promises.push(
                guiPiece.animateMove(finalRow, columnIndex, options)
              );
            });
            this.currentBoard
              .getColumn(columnIndex)
              .forEach((piece, initialRowIndex) => {
                if (indicesToRemove.has(initialRowIndex)) {
                  needToMove--;
                } else if (needToMove) {
                  const guiPiece = GuiPiece.for(piece);
                  guiPiece.animateMove(
                    initialRowIndex + needToMove,
                    columnIndex,
                    options
                  );
                }
              });
          }
        );
        await Promise.all(promises);
        promises.length = 0;
        this.currentBoard = final;
        break; // TODO keep the loop going.  Add some delays and and some flashing letters so the player can see what's going on.
      }
      board.style.cursor = "";
      dragState = "none";
    });
  })();
}
GUI;

/**
 * The first index is the row number.
 * The second index is the column number.
 */
type AllGroupHolders = ReadonlyArray<ReadonlyArray<GroupHolder>>;
