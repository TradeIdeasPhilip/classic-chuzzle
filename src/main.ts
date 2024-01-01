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
import { pick, sleep } from "phil-lib/misc";

{
  // TITLE BAR
  let showNext = "☆";
  setInterval(() => {
    document.title = `${showNext} Classic Chuzzle`;
    showNext = showNext == "☆" ? "★" : "☆";
  }, 1000);
}

{
  // BACKGROUND ANIMATION
  const [black, white, color] = getById(
    "background",
    SVGGElement
  ).querySelectorAll("circle");
  black.animate(
    [{ transform: "rotate(720deg)" }, { transform: "rotate(0deg)" }],
    { duration: 67973, easing: "ease", iterations: Infinity }
  );
  white.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
    {
      duration: 19701,
      easing: "cubic-bezier(0.42, 0, 0.32, 1.83)",
      iterations: Infinity,
    }
  );
  color.animate(
    colors.flatMap((color, index) => [
      { fill: color, opacity: 0, offset: index / colors.length },
      { fill: color, opacity: 0.15, offset: (index + 0.25) / colors.length },
      { fill: color, opacity: 0.15, offset: (index + 0.75) / colors.length },
      { fill: color, opacity: 0, offset: (index + 1) / colors.length },
    ]),
    { duration: 4000 * colors.length, iterations: Infinity }
  );
}

getById("main", SVGSVGElement).animate(
  { backgroundColor: ["#404040", "#C0C0C0", "#404040"] },
  { duration: 97531, direction: "alternate", iterations: Infinity }
);

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

  if (false) {
    const path = spiralPath(
      { x: 1, y: 1 },
      { x: 3, y: 4 },
      0.5 + Math.random() * 2 + Math.random() * 2
    );
    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathElement.style.fill = "none";
    pathElement.style.stroke = "white";
    pathElement.style.strokeWidth = "0.02px";
    pathElement.style.strokeLinecap = "round";
    pathElement.style.transform = "translate(0.5px,0.5px)";
    pathElement.setAttribute("d", path);
    svg.appendChild(pathElement);
    const bombElement = newBomb();
    bombElement.style.fill = "black";
    const bombHolder = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    bombHolder.appendChild(bombElement);
    svg.appendChild(bombHolder);
    //bombHolder.style.transform="translate(1px,2px)";
    bombHolder.style.offsetPath = `path('${path}')`;
    bombHolder.style.offsetRotate = "0deg";
    bombHolder.animate(
      { offsetDistance: ["0%", "100%"] },
      { duration: 3000, iterations: Infinity, easing: "ease-in-out" }
    );

    console.log({ path, pathElement, bombElement, bombHolder });
  }
  if (false) {
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
      { x: 1, y: 1 },
      { x: 3, y: 4 },
      makeCircle(radius, initialAngle, finalAngle)
    );
    const path = mathToPath(f, { numberOfSegments: 20 });
    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathElement.style.fill = "none";
    pathElement.style.stroke = "blue";
    pathElement.style.strokeWidth = "0.02px";
    pathElement.style.strokeLinecap = "round";
    pathElement.style.transform = "translate(0.5px,0.5px)";
    pathElement.setAttribute("d", path);
    svg.appendChild(pathElement);

    const bombElement = newBomb();
    bombElement.style.fill = "cyan";
    const bombHolder = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    bombHolder.appendChild(bombElement);
    svg.appendChild(bombHolder);
    //bombHolder.style.transform="translate(1px,2px)";
    bombHolder.style.offsetPath = `path('${path}')`;
    bombHolder.style.offsetRotate = "0deg";
    bombHolder.animate(
      [
        { offset: 0, offsetDistance: "0%", easing: "ease-in-out" },
        { offset: 0.95, offsetDistance: "100%", easing: "ease-in-out" },
        { offset: 1, offsetDistance: "100%", easing: "ease-in-out" },
      ],
      {
        duration: 3000,
        iterations: Infinity,
        easing: "ease-in-out",
        iterationStart: 0.5,
      }
    );

    console.log(path, pathElement);
  }
}

testMathToPath();
