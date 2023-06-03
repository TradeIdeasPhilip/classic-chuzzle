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

type Color = string;

const colors: Color[] = ["red", "green", "blue", "yellow", "orange", "violet"];

type Piece = { readonly color: Color; readonly weight: number };

class GuiPiece {
  static #board = getById("board", SVGElement);
  static #pieceTemplate = getById(
    "piece",
    HTMLTemplateElement
  ).content.querySelector("g")!;
  readonly element: SVGGElement;

  setPosition(row: number, column: number) {
    this.element.setAttribute("transform", `translate(${column}, ${row})`);
  }
  constructor(public readonly piece: Piece) {
    const clone = assertClass(
      GuiPiece.#pieceTemplate.cloneNode(true),
      SVGGElement
    );
    this.element = clone;
    clone.setAttribute("fill", piece.color);
    /**
     * New Plan:
     * Only the svg gets listeners, not the individual tiles.
     * Each time we have an event we look at this.#board.getBoundingClientRect().
     * And we compare that to pointerEvent.clientX and pointerEvent.clientY.
     * We can scale the value to see which cell the user clicked on.
     * And, as the mouse moves we use those same scaled values to see how much to move the cells.
     * I can call positiveModulo() to make sense of the mouse moving 2 cells to the left vs 4 cells to the right.
     * Better yet, I can use positiveModulo(currentX - originalX + 0.5 ,6) - 0.5.
     * That will give me an output in the range -0.5 - 5.5.
     * I can round to the nearest integer to find which cell we are currently closest to.
     * And I can keep the precise value and use that to position the squares in fractional positions.
     *
     * Have to just change the translate transform to move the pieces.
     * I was thinking about layering transforms somehow.
     * But that doesn't work with the modulo logic.
     * But it's easy to add the current offset to each piece's normal position, then use the formula above to modulo the result back into range.
     * We definitely need some cleanup routines:
     * If we end normally or we abort, we will want to restore all items to their original positions.
     *
     * If I let go and the row snaps back into place, is that animated?
     * So far I update things when the mouse moves.
     * But the snapping back motion would be more of a traditional animation.
     * SVG has a lot of stuff related to animations, but I've never looked into it yet.
     *
     * Maybe we don't need a special cleanup routine.
     * Instead, we block the GUI from making any changes while the animation is in progress.
     * I.e. the user lets go of his mouse,
     * the items start to move back to their original positions,
     * the user moves his mouse and clicks somewhere else, before the animation is complete,
     * the GUI ignores that click because it is busy,
     * if there are any buttons they will be grayed out.
     */
    GuiPiece.#board.appendChild(clone);
  }
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
 */
class GroupHolder {
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
      /*
      if (this.color == "green") {
       (window as any).showGreen();
       //debugger;
      }
      */
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
        // This was aimed at a specific bug.
        // I was trying to merge a group with itself, and that was invalidating the group.
        // That error got caught the next time I tried to use the group.
        // But by explicitly checking now I could see the problem sooner and I could see the context.
        (window as any).showGreen();
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
    // showGreen() was aimed at debugging a specific problem.
    // Among other things, this gives access to groupHolders, which might be hard to track down in the debugger and the logs.
    (window as any).showGreen = () => {
      const forTable: {}[] = [];
      const forLog: Group[] = [];
      groupHolders.forEach((row) => {
        row.forEach((groupHolder) => {
          if (groupHolder.color == "green") {
            forTable.push(groupHolder.#group.debugInfo());
            forLog.push(groupHolder.#group);
          }
        });
      });
      // Notice that the row and column of the debugInfo() is the
      // original row and column for the Group.  In this context it
      // might make more sense to show the row and column of each
      // GroupHolder.
      console.table(forTable);
      console.log(forLog);
    };
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
    // showGreen() remembers the action in progress.
    // The action is finished so showGreen() is no longer relevant.
    delete (window as any).showGreen;
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
  static findActionable(allPieces: AllPieces): Group[] {
    const allGroupHolders = this.createAll(allPieces);
    this.combineAll(allGroupHolders);
    return this.findBigGroups(allGroupHolders);
  }
}

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

class LogicalBoard {
  static readonly SIZE = 6;
  private constructor(public readonly allPieces: AllPieces) {}
  static createRandom(): LogicalBoard {
    const pieces = initializedArray(LogicalBoard.SIZE, () =>
      initializedArray(LogicalBoard.SIZE, (): Piece => {
        return { weight: 1, color: pick(colors) };
      })
    );
    const groups = GroupHolder.findActionable(pieces);
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
  static readonly QUICK = this.createRandom();

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
  ];
  private static showGroups() {
    const groups = GroupHolder.findActionable(this.#currentBoard.allPieces);
    if (groups.length > 0) {
      const decorations = [...this.#decorations];
      groups.forEach((group) => {
        const decorationColor = pick(this.#backgroundColors.get(group.color)!);
        const decorationIndex = Math.floor(Math.random() * decorations.length);
        const decorationText = decorations[decorationIndex];
        decorations.splice(decorationIndex, 1);
        group.contents.forEach((groupHolder) => {
          const { row, column } = groupHolder;
          const gElement = this.#currentlyVisible[row][column].element;
          const textElement = gElement.querySelector("text")!;
          textElement.textContent = decorationText;
          textElement.style.fill = decorationColor;
        });
      });
    }
  }
  //private static removeGroups() {}
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
    this.showGroups();
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
      }
      const wrap = (change: number) => {
        return positiveModulo(change + 0.5, LogicalBoard.SIZE) - 0.5;
      };
      if (dragState == "horizontal") {
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
    });
    board.addEventListener("lostpointercapture", (pointerEvent) => {
      // lostpointercapture will happen with pointer up or pointercancel.
      // So lostpointercapture is the safer option.
      if (dragState == "none") {
        return;
      }
      const current = translateCoordinates(pointerEvent);
      if (dragState == "horizontal") {
        this.currentBoard = this.currentBoard.rotateLeft(
          fixedIndex,
          Math.round(dragStartColumn - current.column)
        );
      } else if (dragState == "vertical") {
        this.currentBoard = this.currentBoard.rotateUp(
          fixedIndex,
          Math.round(dragStartRow - current.row)
        );
      } else if (dragState == "started") {
        this.draw();
      }
      dragState = "none";
      board.style.cursor = "";
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
