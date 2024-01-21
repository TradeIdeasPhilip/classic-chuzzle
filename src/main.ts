import "./style.css";
import { getById } from "phil-lib/client-misc";
import { LogicalBoard, colors } from "./logical-board";
import { animator } from "./display-output";
import { initializeUserInputs } from "./user-input";
import { count, initializedArray } from "phil-lib/misc";

{
  // Debug stuff
  class UniqueId {
    private constructor() {
      throw new Error("wtf");
    }
    static #next = 0;
    static get next(): string {
      return `Unique_${this.#next++}`;
    }
  }

  const addCheckBox = (
    text: string,
    initialState: "checked" | "unchecked",
    action: (currentlyChecked: boolean) => void
  ) => {
    const initiallyChecked = initialState == "checked";
    const inputId = UniqueId.next;
    const div = document.createElement("div");
    getById("debugButtons", HTMLDivElement).appendChild(div);
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = initiallyChecked;
    input.id = inputId;
    div.appendChild(input);
    const label = document.createElement("label");
    label.innerText = text;
    label.htmlFor = inputId;
    div.appendChild(label);
    action(initiallyChecked);
    input.addEventListener("change", () => action(input.checked));
  };

  type Pauseable = Pick<Animation, "play" | "pause">;

  class ColorAnimator implements Pauseable {
    #paused = false;
    play(): void {
      this.#paused = false;
    }
    pause(): void {
      this.#paused = true;
    }
    readonly #colors: readonly string[];
    #nextIndex = 0;
    updateNowOrig() {
      this.element.style.stroke = this.#colors[this.#nextIndex];
      this.#nextIndex = (this.#nextIndex + 1) % this.#colors.length;
      this.element.style.stroke = "black";
      this.element.style.filter = `invert(50%) sepia(66%) saturate(2693%) hue-rotate(261deg) brightness(93%) contrast(101%)`;
    }
    updateNow2() {
      this.element.style.stroke = "red";
      this.element.style.filter = `hue-rotate(${++this.#nextIndex}deg)`;
    }
    private updateNow() {
      this.element.style.stroke = "cyan";
      this.element.style.strokeWidth = `${(++this.#nextIndex % 200) / 1000}px`;
    }
    // TODO I can't find it in github but I'm sure I've written a class so I'd never have to do this again.
    private loop() {
      requestAnimationFrame(() => {
        this.loop();
        if (!this.#paused) {
          this.updateNow();
        }
      });
    }
    constructor(private readonly element: SVGElement, baseColor: string) {
      this.#colors = colors.flatMap((color) => [baseColor, color]);
      this.loop();
    }
  }
  ColorAnimator;

  const rotations: Pauseable[] = [];
  // BACKGROUND ANIMATION
  const backgroundElement = getById("background", SVGGElement);
  const [black, white] = initializedArray(2, () => {
    const result = document.createElementNS("http://www.w3.org/2000/svg", "g");
    backgroundElement.appendChild(result);
    result.style.transformOrigin = "3px 3px";
    const difference = (LogicalBoard.SIZE * (Math.SQRT2 - 1)) / 2;
    const min = 0 - difference;
    const max = LogicalBoard.SIZE + difference;
    for (const y of count(min, max)) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.x1.baseVal.value = min;
      line.y1.baseVal.value = y;
      line.x2.baseVal.value = max;
      line.y2.baseVal.value = y;
      line.style.strokeLinecap = "round";
      result.appendChild(line);
    }
    return result;
  });
  rotations.push(
    black.animate(
      [{ transform: "rotate(720deg)" }, { transform: "rotate(0deg)" }],
      { duration: 67973, easing: "ease", iterations: Infinity }
    )
  );
  rotations.push(
    white.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      {
        duration: 19701,
        easing: "cubic-bezier(0.42, 0, 0.32, 1.83)",
        iterations: Infinity,
      }
    )
  );

  const lineColors: Pauseable[] = [
    //new ColorAnimator(black, "black"),
    //new ColorAnimator(white, "white"),
    black.animate(
      colors.flatMap((color, index, array) => [
        { stroke: "black", offset: index / array.length },
        { stroke: color, offset: (index + 0.25) / array.length },
        { stroke: color, offset: (index + 0.75) / array.length },
        { stroke: "black", offset: (index + 1) / array.length },
      ]),
      {
        duration: 3210 * colors.length,
        iterations: Infinity,
        easing: `steps(${colors.length * 2}, jump-start)`,
      }
    ),
    white.animate(
      colors.flatMap((color, index, array) => [
        { stroke: "white", offset: index / array.length },
        { stroke: color, offset: (index + 0.25) / array.length },
        { stroke: color, offset: (index + 0.75) / array.length },
        { stroke: "white", offset: (index + 1) / array.length },
      ]),
      {
        duration: 4321 * colors.length,
        iterations: Infinity,
        easing: `steps(${colors.length * 2}, jump-start)`,
      }
    ),
  ];

  const backWallColors: Pauseable = getById("main", SVGSVGElement).animate(
    { backgroundColor: ["#202020", "#e0e0e0", "#202020"] },
    { duration: 97531, direction: "alternate", iterations: Infinity }
  );

  (
    [
      [rotations, "line rotations", "checked"],
      [lineColors, "line colors", "checked"],
      [[backWallColors], "back wall colors", "checked"],
    ] as const
  ).forEach(([pauseables, text, initialState]) => {
    addCheckBox(`Animate ${text}`, initialState, (currentlyChecked): void => {
      const action = currentlyChecked ? "play" : "pause";
      pauseables.forEach((pauseable) => pauseable[action]());
    });
  });

  const curtainElement = getById("curtain", SVGRectElement);
  (
    [
      [backgroundElement, "background", "checked"],
      [getById("board", SVGGElement), "board", "checked"],
      [curtainElement, "curtain", "unchecked"],
    ] as const
  ).forEach(([element, text, initialState]) => {
    addCheckBox(`Show ${text}`, initialState, (currentlyChecked) => {
      element.style.display = currentlyChecked ? "" : "none";
    });
  });
}

initializeUserInputs(new LogicalBoard(animator));
