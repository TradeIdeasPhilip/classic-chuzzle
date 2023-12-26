import "./style.css";
import { getById } from "phil-lib/client-misc";
import { LogicalBoard, colors } from "./logical-board";
import { animator } from "./display-output";
import { initializeUserInputs } from "./user-input";
import { spiralPath } from "./math-to-path";

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

{
  // Test math-to-path.ts
  const path = spiralPath({ x: 1.5, y: 1.5 }, { x: 3.5, y: 4.5 }, 3);
  const svg = getById("main", SVGSVGElement);
  path||svg;

  /*
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.style.fill="none";
  pathElement.style.stroke="black";
  pathElement.style.strokeWidth = "0.07px";
  pathElement.style.strokeLinecap="round";
  pathElement.setAttribute("d", path);
  svg.appendChild(pathElement);
  console.log(path,pathElement);
  */

  /*
  const circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleElement.style.fill="rgba(255,255,255 , 0.9)";
  circleElement.r.baseVal.value=0.25;
  circleElement.style.offsetPath = `path("${path}")` ;
  svg.appendChild(circleElement);
 
  const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textElement.textContent="💣";
  textElement.style.fontSize="0.25px";
  textElement.style.offsetPath = circleElement.style.offsetPath;
  textElement.style.offsetRotate = "0deg";
  //    text-shadow: 4px 4px 2px white, -4px 4px 2px white, 4px -4px 2px white, -4px -4px 2px white;
 svg.appendChild( textElement);
 */
}
