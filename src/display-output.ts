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

const newScoreDiv = getById("newScore", HTMLDivElement);
const chainBonusDiv = getById("chainBonus", HTMLDivElement);

const backgroundColors: ReadonlyMap<string, ReadonlyArray<string>> = new Map([
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

const boardElement = getById("board", SVGElement);

function clearAllHighlights() {
  boardElement
    .querySelectorAll<SVGTextElement>("text.crystal-decoration")
    .forEach((element) => (element.textContent = ""));
}

/**
 * One of these for each piece on the board.
 * These objects own the DOM Element objects.
 */
class GuiPiece extends Piece {
  /**
   * The GuiPiece elements will go on this #board.
   */
  static #pieceTemplate = getById(
    "piece",
    HTMLTemplateElement
  ).content.querySelector("g")!;
  readonly element: SVGGElement;
  readonly decorationElement: SVGTextElement;

  static readonly #positionColumn = CSS.px(Math.E);
  static readonly #positionRow = CSS.px(Math.PI);
  static readonly #positionHelper = new CSSTransformValue([
    new CSSTranslate(this.#positionColumn, this.#positionRow),
  ]);

  private updatePositionOnScreen() {
    GuiPiece.#positionColumn.value = this.column;
    GuiPiece.#positionRow.value = this.row;
    this.element.attributeStyleMap.set("transform", GuiPiece.#positionHelper);
  }

  override moveToImmediately(row: number, column: number): void {
    super.moveToImmediately(row, column);
    this.updatePositionOnScreen();
  }

  //note unusual / different use of options===undefined here.
  override moveToAnimated(
    row: number,
    column: number,
    options?: KeyframeAnimationOptions
  ): Promise<unknown> {
    const initialColumn = this.column;
    const initialRow = this.row;
    if (!options) {
      const needToMove = Math.hypot(row - initialRow, column - initialColumn);
      options = animationOptions(needToMove);
    }
    super.moveToImmediately(row, column);
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
    return animation.finished;
  }
  constructor(row: number, column: number, color: Color) {
    super(row, column, color);
    const clone = assertClass(
      GuiPiece.#pieceTemplate.cloneNode(true),
      SVGGElement
    );
    this.element = clone;
    this.decorationElement = clone.querySelector("text.crystal-decoration")!;
    clone.setAttribute("fill", color);
    boardElement.appendChild(clone);
    this.updatePositionOnScreen();
  }
  override async remove(): Promise<void> {
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
    { // Move the final point off of the board.
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
    { // Optionally flip the final position over the x axis and/or the y axis.
      // This will ensure that we have coverage in all directions.
      /**
       * This is random but weighted.  It will prefer longer moves.
       * For example, the closer the initial position is to the top, the more likely the final position will be below the bottom.
       * @param initial The starting index in one dimension or the other, in SVG units.
       * @returns `true` if the final position should be flipped.
       */
      const needToFlip = (initial: number) =>
        Math.random() > (initial + 1) / (LogicalBoard.SIZE + 1);
      if (needToFlip(this.row)) {
        finalRowIndex = LogicalBoard.SIZE - finalRowIndex - 1;
      }
      if (needToFlip(this.column)) {
        finalColumnIndex = LogicalBoard.SIZE - finalColumnIndex - 1;
      }
    }
    await this.moveToAnimated(finalRowIndex, finalColumnIndex, {
      duration: 1000,
      easing: "ease-in",
    });
    this.element.remove();
    (this as any).element = "💀";
  }
}

/**
 * How should a `GuiPiece` move?
 * This takes care of the fact that some pieces will wrap around.
 * All pieces will move at the same rate, so the pieces will always be touching.
 * @param offset How far the GuiPiece moves through the entire animation.
 * Positive for something moving left to right or top to bottom.
 */
const makeMakeScript = (offset: number) => {
  /**
   * What's the quickest way to get to the goal?
   * Remember that the items can rotate around.
   * This is the number of cells to move down or right.
   * 0 means the board is already correct.
   * Negative numbers means to move left or up.
   */
  const needToMove =
    positiveModulo(offset + LogicalBoard.SIZE / 2, LogicalBoard.SIZE) -
    LogicalBoard.SIZE / 2;
    //console.log({needToMove, offset});
  const options: KeyframeAnimationOptions = animationOptions(needToMove);

  /**
   * @param finalPosition Where the `GuiPiece` will land, in svg units.
   * @returns An array of `position`s and an array of times labeled `offset`.
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
    }    /**
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
    return { position, offset,finalPosition };
  };
  return { makeScript, options };
};

class AnimatorImpl implements Animator {
  createPiece(row: number, column: number, color: Color): Piece {
    return new GuiPiece(row, column, color);
  }
  async rotateDown(column: readonly Piece[], offset: number): Promise<void> {
    const { makeScript, options } = makeMakeScript(offset);
    const promises: Promise<unknown>[] = [];
    column.forEach((guiPiece) => {
      const { position, offset } = makeScript(guiPiece.row);
      const transform = position.map(
        (row) => `translate(${guiPiece.column}px, ${row}px)`
      );
      //console.log({transform, offset,options})
      promises.push(
        assertClass(guiPiece, GuiPiece).element.animate(
          { transform, offset },
          options
        ).finished
      );
    });
    await Promise.all(promises);
  }
  async rotateRight(row: readonly Piece[], offset: number): Promise<void> {
    //console.log({row: row.map(piece => { const {row, column} = piece;return {row,column}}),offset})
    const { makeScript, options } = makeMakeScript(offset);
    const promises: Promise<unknown>[] = [];
    row.forEach((guiPiece) => {
      const { position, offset } = makeScript(guiPiece.column);
      const transform = position.map(
        (column) => `translate(${column}px, ${guiPiece.row}px)`
      );
      //console.log({transform, offset,options})
      promises.push(
        assertClass(guiPiece, GuiPiece).element.animate(
          { transform, offset },
          options
        ).finished
      );
    });
    await Promise.all(promises);
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
          clearAllHighlights();
        },
      };
    } else {
      const decorationsAvailable = [...decorations];
      /**
       * Data that we compute once then save for later.
       */
      const save = groups.map((pieces) => {
        const decorationColor = pick(backgroundColors.get(pieces[0].color)!);
        const decorationIndex = Math.floor(
          Math.random() * decorationsAvailable.length
        );
        const decorationText = decorationsAvailable[decorationIndex];
        decorationsAvailable.splice(decorationIndex, 1);
        return { pieces, decorationColor, decorationText };
      });
      return {
        async addToScore(counter: number) {
          // Flash the items about to be collected.
          groups.forEach((group) => {
            const pieces: readonly GuiPiece[] = group.map((piece) =>
              assertClass(piece, GuiPiece)
            );
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
            pieces.forEach((piece) => {
              piece.decorationElement.animate(keyframes, options);
            });
          });
          if (counter < 2) {
            chainBonusDiv.innerHTML = "";
          } else {
            chainBonusDiv.innerText = `Chain Bonus: ⨉ ${counter}`;
          }
          newScoreDiv.innerHTML = "";
          save.forEach(({ pieces, decorationColor, decorationText }, index) => {
            if (index > 0) {
              newScoreDiv.append(" + ");
            }
            const span = document.createElement("span");
            span.innerText = `${decorationText} ${pieces.length}`;
            span.style.color = decorationColor;
            span.style.borderColor = span.style.backgroundColor =
              pieces[0].color;
            span.classList.add("individualScore");
            newScoreDiv.appendChild(span);
          });
          await sleep(2000);
        },
        highlightGroups() {
          clearAllHighlights();
          save.forEach(({ pieces, decorationColor, decorationText }) => {
            pieces.forEach((piece) => {
              const guiPiece = assertClass(piece, GuiPiece);
              const decorationElement = guiPiece.decorationElement;
              decorationElement.textContent = decorationText;
              decorationElement.style.fill = decorationColor;
            });
          });
        },
      };
    }
  }
}

export const animator: Animator = new AnimatorImpl();
