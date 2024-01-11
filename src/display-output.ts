import { getById } from "phil-lib/client-misc";
import { pick, sleep } from "phil-lib/misc";
import {
  LogicalPiece,
  Color,
  LogicalBoard,
  Animator,
  GroupGroupActions,
  UpdateInstructions,
} from "./logical-board";
import { assertClass, positiveModulo, take } from "./utility";
import {
  Point,
  makeCircle,
  makeComposite,
  mathToPath,
  spiralPath,
} from "./math-to-path";

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
export const decorationColors: ReadonlyMap<
  Color,
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

/**
 * A set of interesting characters.
 * This program uses these characters to mark which elements are part of which groups.
 *
 * I chose this in part because it was easy to do.
 * And in part because it looks artistic.
 * And in part because its fun to go looking for new interesting unicode characters.
 */
const decorations: ReadonlyArray<string> = [
  "༟",
  "༴",
  "℣",
  "⌰",
  "⍷",
  "⎙",
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
  "⅏",
  // https://unicodeemoticons.com/cool_text_icons_and_pictures.htm
  // https://jrgraphix.net/r/Unicode/2600-26FF
  // https://www.compart.com/en/unicode/category/So
];

/**
 * Title Bar
 */
setInterval(() => {
  document.title = `${pick(decorations)} Classic Chuzzle`;
}, 1500);

/**
 * 1 means to display the animations at normal speed.
 * 0.5 means to display them at twice the normal speed.
 * I.e. when specifying the duration for an animation, multiply it by this number first.
 */
let durationFactor = 1;

/**
 *
 * @param needToMove How far, in svg units, the tile will move.
 * @returns A reasonable duration, in milliseconds, for animating the move.
 */
function distanceToDuration(needToMove: number): number {
  /**
   * Two seconds if you go all the way across the board.
   */
  return ((Math.abs(needToMove) * 2000) / LogicalBoard.SIZE) * durationFactor;
}

/**
 * The individual colored cells are direct descendants of this element.
 */
const boardElement = getById("board", SVGElement);

function clearAllDecorations() {
  boardElement
    .querySelectorAll<SVGTextElement>(
      "text.crystal-decoration,text.crystal-decoration-background"
    )
    .forEach((element) => (element.textContent = ""));
  // TODO do I need to worry about animations?
  // GuiPiece.cancelGroup() did this:  guiPiece.element.getAnimations().forEach((animation) => animation.cancel());
  // See GuiPiece.removeDecoration(), now.  It does a better job
  // removing animations.  It removes the animations from the
  // decorations, and nothing else.  That is not required
  // when clearAllDecorations() is called, but it wouldn't
  // hurt, either.
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
  static readonly #pieceTemplate = getById(
    "piece",
    HTMLTemplateElement
  ).content.querySelector("g")!;
  readonly element: SVGGElement;
  readonly decorationElement: SVGTextElement;
  readonly decorationBackgroundElement: SVGTextElement;

  private readonly bombElement: SVGPathElement;
  get bombVisible(): boolean {
    return this.bombElement.style.display == "";
  }
  set bombVisible(visible: boolean) {
    this.bombElement.style.display = visible ? "" : "none";
  }

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
   * @param options Options passed on to Element.animate().
   * @returns A promise that will resolve when the animation is complete.
   */
  async slideDirectlyTo(
    piece: HasPosition,
    options: KeyframeAnimationOptions
  ): Promise<void> {
    const initialColumn = this.#columnIndex;
    const initialRow = this.#rowIndex;
    const finalColumn = piece.columnIndex;
    const finalRow = piece.rowIndex;
    if (initialColumn != finalColumn || initialRow != finalRow) {
      const element = this.element;
      const animation = element.animate(
        [
          { transform: `translate(${initialColumn}px, ${initialRow}px)` },
          { transform: `translate(${finalColumn}px, ${finalRow}px)` },
        ],
        options
      );
      await animation.finished;
      this.updateFinalPosition(piece);
    }
  }

  async rotateTo(
    piece: LogicalPiece,
    direction: "vertical" | "horizontal"
  ): Promise<void> {
    const horizontal = direction == "horizontal";
    const duration: number = (() => {
      const offset = horizontal
        ? piece.columnIndex - this.#columnIndex
        : piece.rowIndex - this.#rowIndex;
      /**
       * This might go directly, or it might go in the opposite direction and wrap around.
       */
      const shortestMove =
        positiveModulo(offset + LogicalBoard.SIZE / 2, LogicalBoard.SIZE) -
        LogicalBoard.SIZE / 2;
      return distanceToDuration(Math.abs(shortestMove));
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
    await this.element.animate({ transform, offset }, duration).finished;
  }

  /**
   * The next animation should start from here.
   */
  #rowIndex = NaN;
  /**
   * The next animation should start from here.
   */
  get rowIndex() {
    return this.#rowIndex;
  }
  /**
   * The next animation should start from here.
   */
  #columnIndex = NaN;
  /**
   * The next animation should start from here.
   */
  get columnIndex() {
    return this.#columnIndex;
  }
  constructor(piece: LogicalPiece) {
    const clone = assertClass(
      GuiPiece.#pieceTemplate.cloneNode(true),
      SVGGElement
    );
    this.element = clone;
    this.decorationElement = clone.querySelector("text.crystal-decoration")!;
    this.decorationBackgroundElement = clone.querySelector(
      "text.crystal-decoration-background"
    )!;
    this.bombElement = clone.querySelector(".bomb")!;
    clone.style.fill = piece.color;
    this.decorationBackgroundElement.style.stroke = piece.color;
    this.bombColor = pick(decorationColors.get(piece.color)!);
    this.bombVisible = false;
    this.updateFinalPosition(piece);
    boardElement.appendChild(clone);
  }
  async remove(afterMs = 0): Promise<void> {
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
    this.element.parentElement!.appendChild(this.element);
    await this.slideDirectlyTo(
      { rowIndex: finalRowIndex, columnIndex: finalColumnIndex },
      {
        duration: 1000 * durationFactor,
        easing: "ease-in",
        delay: afterMs,
        fill: "backwards",
      }
    );
    this.element.remove();
    (this as any).element = "💀";
  }
  get bombColor() {
    return this.bombElement.style.fill;
  }
  set bombColor(newColor) {
    this.bombElement.style.fill = newColor;
  }
  removeDecoration() {
    [this.decorationElement, this.decorationBackgroundElement].forEach(
      (element) => {
        element.textContent = "";
        element.getAnimations().forEach((animation) => animation.cancel());
      }
    );
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

/**
 * Each cell comes with it's own bomb.  This will be a free
 * floating bomb, which will be flung across the board.
 */
const bombTemplate = getById(
  "piece",
  HTMLTemplateElement
).content.querySelector(".bomb")!;
/**
 * Where to place free floating bombs.
 */
const bombParent = getById("main", SVGSVGElement);

class AnimatorImpl implements Animator {
  initializeBoard(pieces: LogicalPiece[]): void {
    boardElement.innerHTML = "";
    this.#guiPieces.clear();
    pieces.forEach((piece) => this.#guiPieces.set(piece, new GuiPiece(piece)));
  }
  async updateBoard(request: UpdateInstructions) {
    this.#guiPieces.forEach((guiPiece, logicalPiece) => {
      // Draw any new bombs.  This is aimed at groups of 5 where we
      // create a new bomb in the group.  For simplicity this just
      // checks every single piece.
      guiPiece.bombVisible = logicalPiece.bomb;
    });

    {
      // Update durationFactor.
      /**
       * This is the asymptote.  The duration will constantly approach this as counter grows.
       */
      const floor = 0.1;
      const adjustable = 1 - floor;
      /**
       * What portion of the adjustable part can we keep from one round to the next.
       *
       * Range: 0 - 1.  Lower numbers lead to faster decay.
       */
      const keep = 0.75;
      durationFactor = Math.pow(keep, request.counter - 1) * adjustable + floor;
      if (request.flingBomb.length > 1) {
        // Make sure the bomb dance is visible.  Slow it down down some.
        // Never slower than the initial speed, and never faster than twice
        // that speed.
        durationFactor = Math.max(0.5, Math.min(1, durationFactor * 2));
      }
    }

    /**
     * How long to wait after the function is called before any tiles start
     * moving.
     *
     * This is called after the preview has been cleaned up, so all of
     * the tiles are where they should be.  And the group decorations only
     * recently started flashing.  This is a period where all of the tiles
     * stay in place so the user can see what's happening and which groups
     * are about to be harvested.
     */
    const initialDelay = 2000 * durationFactor;

    const bombsToFling = request.flingBomb.map((group) =>
      group.map(({ source, destination }) => {
        /**
         * `source` will be removed from `this.#guiPieces` before we are ready to start flinging the bombs.
         * The `GuiPiece` will still be valid and visible at this time.
         */
        const guiSource = this.#guiPieces.get(source);
        if (guiSource === undefined) {
          throw new Error("wtf");
        }
        return {
          logicalSource: source,
          logicalDestination: destination,
          guiSource,
        };
      })
    );

    const allRemovePromises = Promise.all(
      request.remove.map((piece) => {
        const result = this.#guiPieces.get(piece)!.remove(initialDelay);
        this.#guiPieces.delete(piece);
        return result;
      })
    );
    // We only want to clear the decorations if it's not flying away.
    // Most of the pieces want to keep their decorations.  Take it away in
    // the case where there were 5 in a group and one survived with a bomb.
    // Only that one that survived needed this.  The pieces that are flying away
    // have already been removed from this.#guiPieces.
    setTimeout(
      () => this.#guiPieces.forEach((piece) => piece.removeDecoration()),
      initialDelay
    );

    /**
     * After waiting `initialDelay` then starting the removal of the old
     * tiles wait `removeTime` before filling in the holes.
     */
    const removeTime = 1000 * durationFactor;

    request.add.forEach(({ initialRow, piece }) => {
      const guiPiece = new GuiPiece(piece);
      this.#guiPieces.set(piece, guiPiece);
      guiPiece.updateFinalPosition({
        columnIndex: piece.columnIndex,
        rowIndex: initialRow,
      });
    });

    /**
     * The length of the final phase where we slide the tiles to fill
     * in the holes.  The length of this phase depends on the length
     * of the longest path.
     */
    let maxSlideTime = 0;

    /**
     * Compute the details up front, but do the work after doing
     * some other things.
     *
     * In particular, fling the bombs after computing `maxSlideTime` and
     * before executing `slideActions`.
     */
    const slideActions: (() => Promise<void>)[] = [];

    this.#guiPieces.forEach((guiPiece, logicalPiece) => {
      const initialColumn = guiPiece.columnIndex;
      const initialRow = guiPiece.rowIndex;
      const finalColumn = logicalPiece.columnIndex;
      const finalRow = logicalPiece.rowIndex;
      const needToMove = Math.hypot(
        finalRow - initialRow,
        finalColumn - initialColumn
      );
      const duration = distanceToDuration(needToMove);
      const options: KeyframeAnimationOptions = {
        duration,
        delay: initialDelay + removeTime,
        fill: "backwards",
      };
      slideActions.push(() => guiPiece.slideDirectlyTo(logicalPiece, options));
      maxSlideTime = Math.max(maxSlideTime, duration);
    });

    const allFlingPromises = Promise.all(
      bombsToFling.flatMap((group) => {
        const totalTime = initialDelay + removeTime + maxSlideTime;
        return group.map((endPoints, index) => {
          const start =
            (Math.min(initialDelay, totalTime / 2) / (group.length + 1)) *
            (index + 1);
          const duration = totalTime - start;
          return this.flingBomb(endPoints, start, duration);
        });
      })
    );

    // ✔   New from top / initialRow computed by logical-board.  / destination : LogicalPiece.
    // ✔   Move / Piece / automatically deduce from & to
    // ✔   Update bomb immediately.  / Look at entire board.
    // *   Fling / from LogicalPiece / to LogicalPiece
    // ✔     One list per group.  Each group will be spread out in time, but can overlap with other groups.
    // ✔   Remove LogicalPiece
    // ✔   Counter -- in both addToScore() and in this.
    // ✔   Move Animator.cancelGroup() to here

    const allSlidePromises = Promise.all(
      slideActions.map((action) => action())
    );

    await Promise.all([allRemovePromises, allSlidePromises, allFlingPromises]);
  }
  async flingBomb(
    endPoints: {
      logicalSource: LogicalPiece;
      logicalDestination: LogicalPiece;
      guiSource: GuiPiece;
    },
    initialDelayMs: number,
    durationMs: number
  ) {
    const { logicalSource, logicalDestination, guiSource } = endPoints;
    const guiDestination = this.#guiPieces.get(logicalDestination)!;
    /**
     * Draw this color behind the floating bomb so it will be visible
     * in front of different colored tiles.
     */
    const backgroundColor = logicalDestination.color;
    /**
     * The color of the bomb.
     */
    const foregroundColor = guiDestination.bombColor;
    guiSource.bombColor = foregroundColor;
    guiSource.bombVisible = true;
    /**
     * This g element contains two separate images.
     * Animate the g element to make everything move together.
     */
    const bombTopElement = (() => {
      const bombElement = assertClass(
        bombTemplate.cloneNode(true),
        SVGPathElement
      );
      const bombBackgroundElement = assertClass(
        bombTemplate.cloneNode(true),
        SVGPathElement
      );
      bombBackgroundElement.style.strokeWidth = "75";
      bombElement.style.fill = foregroundColor;
      bombBackgroundElement.style.stroke = backgroundColor;
      const result = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      result.appendChild(bombBackgroundElement);
      result.appendChild(bombElement);
      result.style.offsetRotate = "0deg";
      return result;
    })();
    /**
     * The floating bomb's path.
     */
    const path = ((): string => {
      const from: Point = {
        x: logicalSource.columnIndex,
        y: logicalSource.rowIndex,
      };
      const to: Point = {
        x: logicalDestination.columnIndex,
        y: logicalDestination.rowIndex,
      };
      if (Math.random() < 0.3333333) {
        return spiralPath(
          from,
          to,
          0.5 + Math.random() * 2 + Math.random() * 2
        );
      } else {
        /**
         * Any random angle.
         */
        const initialAngle = Math.random() * 2 * Math.PI;
        /**
         * Clockwise or counterclockwise.  50%/50% odds.
         */
        const direction = ((Math.random() * 2) | 0) * 2 - 1;
        /**
         * Between ½ and 2½ complete rotations.
         */
        const finalAngle =
          initialAngle + direction * (0.5 + Math.random() * 2) * 2 * Math.PI;
        const radius = 0.5 + Math.random() * 2;
        const f = makeComposite(
          from,
          to,
          makeCircle(radius, initialAngle, finalAngle)
        );
        return mathToPath(f, { numberOfSegments: 20 });
      }
    })();
    await sleep(initialDelayMs);
    guiSource.bombVisible = false;
    bombParent.appendChild(bombTopElement);
    bombTopElement.style.offsetPath = `path('${path}')`;
    await bombTopElement.animate(
      { offsetDistance: ["0%", "100%"] },
      {
        duration: durationMs,
        iterations: 1,
        easing: "ease-in",
        fill: "both",
      }
    ).finished;
    bombTopElement.remove();
    guiDestination.bombVisible = true;
  }
  #guiPieces = new Map<LogicalPiece, GuiPiece>();
  drawPreview(
    direction: "vertical" | "horizontal",
    pieces: readonly LogicalPiece[],
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
    pieces: readonly LogicalPiece[]
  ): Promise<void> {
    const promises = pieces.map((piece) =>
      this.#guiPieces.get(piece)!.rotateTo(piece, direction)
    );
    await Promise.all(promises);
  }

  assignGroupDecorations(
    groups: ReadonlyArray<ReadonlyArray<LogicalPiece>>
  ): GroupGroupActions {
    if (groups.length == 0) {
      // This is a minor optimization.  Mostly I didn't want to
      // make a copy of decorations unless I needed to.
      return {
        addToScore() {},
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
        const decorationText = take(decorationsAvailable);
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
        addToScore(counter: number, bombCount: number) {
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
              duration: (550 + Math.random() * 150) * durationFactor,
              easing: pick(["linear", "ease-in", "ease-out", "ease-in-out"]),
              iterationStart: Math.random(),
              iterations: Infinity,
            };
            guiPieces.forEach((guiPiece) => {
              guiPiece.decorationElement.animate(keyframes, options);
              guiPiece.decorationBackgroundElement.animate(keyframes, options);
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
          if (bombCount > 0) {
            if (savedGroupInfo.length > 0) {
              newScoreDiv.append(" + ");
            }
            const svg = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg"
            );
            svg.setAttribute("viewBox", "0.25 0.25 0.5 0.5");
            const bomb = bombTemplate.cloneNode(true);
            svg.appendChild(bomb);
            svg.style.width = "1em";
            svg.style.height = "1em";
            svg.style.fill = "white";
            const span = document.createElement("span");
            span.innerHTML = `&nbsp;${bombCount}`;
            span.style.color = "white";
            span.style.borderColor = span.style.backgroundColor = "black";
            span.classList.add("individualScore");
            span.prepend(svg);
            newScoreDiv.appendChild(span);
          }
        },
        highlightGroups() {
          clearAllDecorations();
          savedGroupInfo.forEach(
            ({ guiPieces, decorationColor, decorationText }) => {
              guiPieces.forEach((guiPiece) => {
                const decorationElement = guiPiece.decorationElement;
                decorationElement.textContent = decorationText;
                decorationElement.style.fill = decorationColor;
                guiPiece.decorationBackgroundElement.textContent =
                  decorationText;
              });
            }
          );
        },
      };
    }
  }
}

export const animator: Animator = new AnimatorImpl();

const decorationTesterDiv = getById("decorationTester", HTMLDivElement);
decorations.forEach((char) => {
  const div = document.createElement("div");
  div.innerText = `${char} u+${char.codePointAt(0)!.toString(16)}`;
  decorationTesterDiv.appendChild(div);
});
