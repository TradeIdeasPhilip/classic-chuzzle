import { getById } from "phil-lib/client-misc";
import { pick, sleep } from "phil-lib/misc";
import {
  Piece,
  Color,
  LogicalBoard,
  Animator,
  GroupGroupActions,
} from "./logical-board";
import { assertClass, positiveModulo } from "./utility";

// TODO exponential changes in speed.  If the user makes one move and that sets off several automatic moves
// in a row, each of the automatic moves in the series should take less time than the previous one.  So people
// don't get bored.

/**
 * This is where we are documenting what will be added to the score.
 * 
 * Presumably at some time I'll add points to each of these, and keep a running tally.
 * That's why I use terms like `addToScore()` and `newScoreDiv`.
 */
const newScoreDiv = getById("newScore", HTMLDivElement);

/**
 * How many automatic moves we've seen in a row.
 * And how that affects the score.
 */
const chainBonusDiv = getById("chainBonus", HTMLDivElement);

/**
 * The keys are background colors, i.e the colors of the cells.
 * The values are foreground colors that go well with each background color.
 */
const decorationColors: ReadonlyMap<Color, ReadonlyArray<string>> = new Map([
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

/**
 * A set of interesting characters.
 * This program uses these characters to mark which elements are part of which groups.
 * 
 * I chose this in part because it was easy to do.
 * And in part because it looks artistic.
 * And in part because its fun to go looking for new interesting unicode characters.
 */
const decorations: ReadonlyArray<string> = [
  "ʻ",
  "☆",
  "𝛿",
  "∞",
  "•",
  "⭑",
  "†",
  "‡",
  "؟",
  "༗",
  "ၯ",
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
  "ƈ",
  "Ɣ",
  "ƕ",
  "Ɋ",
  "ɕ",
  "ɮ",
  "ʆ",
  "Ξ",
  "Ж",
  "Ѭ",
  "Զ",
  "ঔ",
  "ਐ",
  "ઝ",
  "ଈ",
  "ஜ",
  "ధ",
  "ൠ",
  "ඊ",
  "ጯ",
  "ᡀ",
  "‰",
  "₻",
  "↉",
  "↜",
  "↸",
  "⋨",
  "⌤",
  "⎌",
  "⍾",
  "☏",
  "✗",
  "➘",
  "〷",
  "ご",
  "ᇌ",
  "㊤",
  "﹆",
  "🜇",
  "🝤",
  // https://unicodeemoticons.com/cool_text_icons_and_pictures.htm
  // https://jrgraphix.net/r/Unicode/2600-26FF
];

/**
 *
 * @param needToMove How far, in svg units, the tile will move.
 * @returns A reasonable set of animation options.
 */
function animationOptions(needToMove: number): KeyframeAnimationOptions {
  /**
   * Two seconds if you go all the way across the board.
   */
  const duration = (Math.abs(needToMove) * 2000) / LogicalBoard.SIZE;
  return {
    duration,
    //easing: "ease-in-out",
  };
}

/**
 * The individual colored cells are direct descendants of this element.
 */
const boardElement = getById("board", SVGElement);

function clearAllDecorations() {
  boardElement
    .querySelectorAll<SVGTextElement>("text.crystal-decoration")
    .forEach((element) => (element.textContent = ""));
}

type HasPosition = { readonly rowIndex: number; columnIndex: number };

/**
 * One of these for each piece on the board.
 * These objects own the DOM Element objects.
 */
class GuiPiece {
  /**
   * New GuiPiece elements be cloned from this element.
   */
  static #pieceTemplate = getById(
    "piece",
    HTMLTemplateElement
  ).content.querySelector("g")!;
  readonly element: SVGGElement;
  readonly decorationElement: SVGTextElement;

  /**
   * This is part of an optimization.  This avoids my code translating the 
   * instructions into a string, and the API parsing the values back out.
   */
  static readonly #positionColumn = CSS.px(Math.E);
  /**
   * This is part of an optimization.  This avoids my code translating the 
   * instructions into a string, and the API parsing the values back out.
   */
  static readonly #positionRow = CSS.px(Math.PI);
  /**
   * This is part of an optimization.  This avoids my code translating the 
   * instructions into a string, and the API parsing the values back out.
   */
  static readonly #positionHelper = new CSSTransformValue([
    new CSSTranslate(this.#positionColumn, this.#positionRow),
  ]);

  /**
   * Move to here.
   *
   * If there is no animation in progress, just move to here
   * immediately.  If there is an animation, this is where the
   * piece will land after the animation.
   *
   * Either way, the next animation will start from here.
   *
   * Presumably you'd start the animation _then immediately_ call this
   * method.
   * @param piece Grab the position from here.
   */
  updateFinalPosition(piece: HasPosition): void {
    // Save this position.  The next animation will start from here.
    this.#columnIndex = piece.columnIndex;
    this.#rowIndex = piece.rowIndex;
    // Set the position of the GUI element.
    GuiPiece.#positionColumn.value = piece.columnIndex;
    GuiPiece.#positionRow.value = piece.rowIndex;
    this.element.attributeStyleMap.set("transform", GuiPiece.#positionHelper);
  }

  /**
   * Move the gui element from it's current position to the specified position.
   * The element will move along a straight line.
   * @param piece This specifies the destination where the animation will land.
   * @param options Options passed on the Element.animate().
   * The default will be something reasonable based on how far the piece has to move.
   * @returns A promise that will resolve when the animation is complete.
   */
  async slideDirectlyTo(
    piece: HasPosition,
    options?: KeyframeAnimationOptions
  ): Promise<void> {
    const initialColumn = this.#columnIndex;
    const initialRow = this.#rowIndex;
    this.updateFinalPosition(piece);
    const finalColumn = this.#columnIndex;
    const finalRow = this.#rowIndex;
    if (!options) {
      const needToMove = Math.hypot(
        finalRow - initialRow,
        finalColumn - initialColumn
      );
      options = animationOptions(needToMove);
    }
    const element = this.element;
    // Does not work for svg: element.style.zIndex="3";
    // So instead I'm moving it to the end of the list to get the same effect.
    element.parentElement?.appendChild(element);
    const animation = element.animate(
      [
        { transform: `translate(${initialColumn}px, ${initialRow}px)` },
        { transform: `translate(${piece.columnIndex}px, ${piece.rowIndex}px)` },
      ],
      options
    );
    await animation.finished;
  }

  async rotateTo(
    piece: Piece,
    direction: "vertical" | "horizontal"
  ): Promise<void> {
    const horizontal = direction == "horizontal";
    /*
    console.log({
      guiRow: this.#rowIndex,
      guiColumn: this.#columnIndex,
      logicalRow: piece.rowIndex,
      logicalColumn: piece.columnIndex,
      direction,
      horizontal,
      offset: horizontal
        ? piece.columnIndex - this.#columnIndex
        : piece.rowIndex - this.#rowIndex,
    });
    */
    const options: KeyframeAnimationOptions = (() => {
      const offset = horizontal
        ? piece.columnIndex - this.#columnIndex
        : piece.rowIndex - this.#rowIndex;
      /**
       * This might go directly, or it might go in the opposite direction and wrap around.
       */
      const shortestMove =
        positiveModulo(offset + LogicalBoard.SIZE / 2, LogicalBoard.SIZE) -
        LogicalBoard.SIZE / 2;
      return animationOptions(Math.abs(shortestMove));
    })();
    const { position, offset } = horizontal
      ? makeScript(this.#columnIndex, piece.columnIndex)
      : makeScript(this.#rowIndex, piece.rowIndex);
    const transform = position.map((index) =>
      horizontal
        ? `translate(${index}px, ${piece.rowIndex}px)`
        : `translate(${piece.columnIndex}px, ${index}px)`
    );
    this.updateFinalPosition(piece);
    await this.element.animate({ transform, offset }, options).finished;
  }

  /** 
   * The next animation should start from here.
   */
  #rowIndex = NaN;
  /** 
   * The next animation should start from here.
   */
  #columnIndex = NaN;
  constructor(piece: Piece) {
    const clone = assertClass(
      GuiPiece.#pieceTemplate.cloneNode(true),
      SVGGElement
    );
    this.element = clone;
    this.decorationElement = clone.querySelector("text.crystal-decoration")!;
    clone.setAttribute("fill", piece.color);
    this.updateFinalPosition(piece);
    //TODO bomb
    boardElement.appendChild(clone);
  }
  async remove(): Promise<void> {
    /**
     * Where `this` will land at the end of the animation.
     */
    let finalRowIndex: number;
    /**
     * Where `this` will land at the end of the animation.
     */
    let finalColumnIndex: number;
    // Pick a spot completely contained in the top left quarter of the board.
    finalRowIndex = Math.random() * (LogicalBoard.SIZE / 2 - 1);
    finalColumnIndex = Math.random() * (LogicalBoard.SIZE / 2 - 1);
    {
      // Move the final point off of the board.
      /**
       * * ⅓ chance of moving directly up.
       * * ⅓ chance of moving directly left.
       * * ⅓ chance of moving up and left.
       */
      const r = Math.random() * 3;
      if (r > 1) {
        finalRowIndex -= LogicalBoard.SIZE / 2;
      }
      if (r < 2) {
        finalColumnIndex -= LogicalBoard.SIZE / 2;
      }
    }
    {
      // Optionally flip the final position over the x axis and/or the y axis.
      // This will ensure that we have coverage in all directions.
      /**
       * This is random but weighted.  It will prefer longer moves.
       * For example, the closer the initial position is to the top, the more likely the final position will be below the bottom.
       * @param initial The starting index in one dimension or the other, in SVG units.
       * @returns `true` if the final position should be flipped.
       */
      const needToFlip = (initial: number) =>
        Math.random() > (initial + 1) / (LogicalBoard.SIZE + 1);
      if (needToFlip(this.#rowIndex)) {
        finalRowIndex = LogicalBoard.SIZE - finalRowIndex - 1;
      }
      if (needToFlip(this.#columnIndex)) {
        finalColumnIndex = LogicalBoard.SIZE - finalColumnIndex - 1;
      }
    }
    await this.slideDirectlyTo(
      { rowIndex: finalRowIndex, columnIndex: finalColumnIndex },
      {
        duration: 1000,
        easing: "ease-in",
      }
    );
    this.element.remove();
    (this as any).element = "💀";
  }
}

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
 * Create a script for animating a tile.  The tile can move along a
 * row or a column.  The tile will always take the shortest path,
 * possibly wrapping around.
 * @param initialPosition Where the `GuiPiece` is starting from.
 * @param finalPosition Where the `GuiPiece` will land, in svg units.
 * @returns An array of `position`s and an array of times labeled `offset`.
 * `offset` is in the right format for a PropertyIndexedKeyframes input to `Element.animate()`.
 */
const makeScript = (initialPosition: number, finalPosition: number) => {
  const position = [initialPosition];
  const offset = [0];
  if (Math.abs(initialPosition - finalPosition) > LogicalBoard.SIZE / 2) {
    // The direct route would have taken more than half a complete
    // rotation.  So we wrap around, instead, to take the shorter route.
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
    if (finalPosition > initialPosition) {
      addMiddle(-0.5, LogicalBoard.SIZE - 0.5);
    } else {
      addMiddle(LogicalBoard.SIZE - 0.5, -0.5);
    }
  }
  position.push(finalPosition);
  offset.push(1.0);
  return { position, offset };
};

class AnimatorImpl implements Animator {
  #guiPieces = new Map<Piece, GuiPiece>();
  initializePiece(piece: Piece): void {
    this.#guiPieces.set(piece, new GuiPiece(piece));
  }
  destroyPiece(piece: Piece): Promise<void> {
    const guiPiece = this.#guiPieces.get(piece)!;
    this.#guiPieces.delete(piece);
    return guiPiece.remove();
  }
  jumpTo(piece: Piece): void {
    this.#guiPieces.get(piece)!.updateFinalPosition(piece);
  }
  slideTo(piece: Piece): Promise<void> {
    return this.#guiPieces.get(piece)!.slideDirectlyTo(piece);
  }
  drawPreview(
    direction: "vertical" | "horizontal",
    pieces: readonly Piece[],
    offset: number
  ): void {
    pieces.forEach((piece) => {
      const guiPiece = this.#guiPieces.get(piece)!;
      let { rowIndex, columnIndex } = piece;
      if (direction == "vertical") {
        rowIndex = wrap(rowIndex + offset);
      } else {
        columnIndex = wrap(columnIndex + offset);
      }
      guiPiece.updateFinalPosition({ rowIndex, columnIndex });
    });
  }
  async rotateTo(
    direction: "vertical" | "horizontal",
    pieces: readonly Piece[]
  ): Promise<void> {
    const promises = pieces.map((piece) =>
      this.#guiPieces.get(piece)!.rotateTo(piece, direction)
    );
    await Promise.all(promises);
  }
  updateBomb(piece: Piece): void {
    piece;
    throw new Error("Method not implemented.");
  }

  assignGroupDecorations(
    groups: ReadonlyArray<ReadonlyArray<Piece>>
  ): GroupGroupActions {
    if (groups.length == 0) {
      // This is a minor optimization.  Mostly I didn't want to
      // make a copy of decorations unless I needed to.
      return {
        addToScore() {
          return Promise.resolve();
        },
        highlightGroups() {
          clearAllDecorations();
        },
      };
    } else {
      const decorationsAvailable = [...decorations];
      /**
       * Data that we compute once then save for later.
       */
      const savedGroupInfo = groups.map((pieces) => {
        const backgroundColor = pieces[0].color;
        const decorationColor = pick(decorationColors.get(backgroundColor)!);
        const decorationIndex = Math.floor(
          Math.random() * decorationsAvailable.length
        );
        const decorationText = decorationsAvailable[decorationIndex];
        decorationsAvailable.splice(decorationIndex, 1);
        const guiPieces = pieces.map((piece) => {
          const guiPiece = this.#guiPieces.get(piece);
          if (guiPiece == undefined) {
            throw new Error("wtf");
          }
          return guiPiece;
        });
        return { guiPieces, decorationColor, decorationText, backgroundColor };
      });
      return {
        async addToScore(counter: number) {
          // Flash the items about to be collected.
          savedGroupInfo.forEach(({ guiPieces }) => {
            const maxOpacity = 1;
            const minOpacity = Math.random() * 0.2 + 0.05;
            const keyframes: Keyframe[] = [
              { opacity: minOpacity },
              { opacity: maxOpacity },
            ];
            const options: KeyframeAnimationOptions = {
              direction: pick([
                "alternate",
                "alternate-reverse",
                "normal",
                "reverse",
              ]),
              duration: 550 + Math.random() * 150,
              easing: pick(["linear", "ease-in", "ease-out", "ease-in-out"]),
              iterationStart: Math.random(),
              iterations: Infinity,
            };
            guiPieces.forEach((guiPiece) => {
              guiPiece.decorationElement.animate(keyframes, options);
            });
          });
          if (counter < 2) {
            chainBonusDiv.innerHTML = "";
          } else {
            chainBonusDiv.innerText = `Chain Bonus: ⨉ ${counter}`;
          }
          newScoreDiv.innerHTML = "";
          savedGroupInfo.forEach(
            (
              { guiPieces, decorationColor, decorationText, backgroundColor },
              index
            ) => {
              if (index > 0) {
                newScoreDiv.append(" + ");
              }
              const span = document.createElement("span");
              span.innerText = `${decorationText} ${guiPieces.length}`;
              span.style.color = decorationColor;
              span.style.borderColor = span.style.backgroundColor =
                backgroundColor;
              span.classList.add("individualScore");
              newScoreDiv.appendChild(span);
            }
          );
          await sleep(2000);
        },
        highlightGroups() {
          clearAllDecorations();
          savedGroupInfo.forEach(
            ({ guiPieces, decorationColor, decorationText }) => {
              guiPieces.forEach((guiPiece) => {
                const decorationElement = guiPiece.decorationElement;
                decorationElement.textContent = decorationText;
                decorationElement.style.fill = decorationColor;
              });
            }
          );
        },
      };
    }
  }
}

export const animator: Animator = new AnimatorImpl();
