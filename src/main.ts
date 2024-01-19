import "./style.css";
import { getById } from "phil-lib/client-misc";
import { LogicalBoard, colors } from "./logical-board";
import { animator, decorationColors } from "./display-output";
import { initializeUserInputs } from "./user-input";
import {
  Point,
  makeCircle,
  makeComposite,
  mathToPath,
  spiralPath,
} from "./math-to-path";
import { assertClass } from "./utility";
import { count, initializedArray, pick, sleep } from "phil-lib/misc";

{
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
      line.style.strokeWidth = "0.1";
      line.style.strokeLinecap = "round";
      //line.style.stroke = "hotpink";
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
    black.animate(
      colors.flatMap((color, index) => [
        { stroke: "black", offset: index / colors.length },
        { stroke: color, offset: (index + 0.25) / colors.length },
        { stroke: color, offset: (index + 0.75) / colors.length },
        { stroke: "black", offset: (index + 1) / colors.length },
      ]),
      { duration: 4000 * colors.length, iterations: Infinity }
    ),
    white.animate(
      colors.flatMap((color, index) => [
        { stroke: "white", offset: index / colors.length },
        { stroke: color, offset: (index + 0.25) / colors.length },
        { stroke: color, offset: (index + 0.75) / colors.length },
        { stroke: "white", offset: (index + 1) / colors.length },
      ]),
      { duration: 4321 * colors.length, iterations: Infinity }
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
      [curtainElement, "curtain", "unchecked"],
    ] as const
  ).forEach(([element, text, initialState]) => {
    addCheckBox(`Show ${text}`, initialState, (currentlyChecked) => {
      element.style.display = currentlyChecked ? "" : "none";
    });
  });
}

initializeUserInputs(new LogicalBoard(animator));

async function testMathToPath() {
  const svg = getById("main", SVGSVGElement);
  const newBomb = () => {
    const template = getById(
      "piece",
      HTMLTemplateElement
    ).content.querySelector(".bomb")!;
    const result = assertClass(template.cloneNode(true), SVGPathElement);
    return result;
  };
  const randomPoint = (): Point => {
    const x = (Math.random() * LogicalBoard.SIZE) | 0;
    const y = (Math.random() * LogicalBoard.SIZE) | 0;
    return { x, y };
  };
  const randomNewPoint = (previous: Point): Point => {
    while (true) {
      const result = randomPoint();
      if (result.x != previous.x || result.y != previous.y) {
        return result;
      }
    }
  };

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.style.fill = "none";
  pathElement.style.stroke = "white";
  pathElement.style.strokeWidth = "0.02px";
  pathElement.style.strokeLinecap = "round";
  pathElement.style.transform = "translate(0.5px,0.5px)";
  svg.appendChild(pathElement);
  const bombElement = newBomb();
  const bombBackgroundElement = newBomb();
  bombBackgroundElement.style.strokeWidth = "75";
  const bombHolder = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  bombHolder.appendChild(bombBackgroundElement);
  bombHolder.appendChild(bombElement);
  svg.appendChild(bombHolder);
  bombHolder.style.offsetRotate = "0deg";

  let to: Point = randomPoint();
  while (true) {
    const from = to;
    to = randomNewPoint(from);

    {
      const backgroundColor = pick(colors);
      const foregroundColor = pick(decorationColors.get(backgroundColor)!);
      bombElement.style.fill = foregroundColor;
      bombBackgroundElement.style.stroke = backgroundColor;
    }

    let path: string;
    if (Math.random() < 0.3333333) {
      path = spiralPath(from, to, 0.5 + Math.random() * 2 + Math.random() * 2);
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
      path = mathToPath(f, { numberOfSegments: 20 });
    }

    bombHolder.style.offsetPath = `path('${path}')`;
    const animation = bombHolder.animate(
      { offsetDistance: ["0%", "100%"] },
      { duration: 3000, iterations: 1, easing: "ease-in-out", fill: "both" }
    );
    pathElement.setAttribute("d", path);
    pathElement.style.display = "none";
    await animation.finished;
    pathElement.style.display = "";
    await sleep(2000);
  }
}

testMathToPath; //();
