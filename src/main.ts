import "./style.css";
import { getById } from "phil-lib/client-misc";
import { LogicalBoard, colors } from "./logical-board";
import { animator } from "./display-output";
import { initializeUserInputs } from "./user-input";

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
  const [black, white, color] = getById("background", SVGGElement).querySelectorAll(
    "circle"
  );
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
    colors.flatMap((color, index) => [{fill:color, opacity: 0, offset: index/colors.length}, {fill:color, opacity: 0.15, offset: (index+0.25)/colors.length}, {fill:color, opacity: 0.15, offset: (index+0.75)/colors.length}, {fill:color, opacity: 0, offset: (index+1)/colors.length}]), {duration:4000*colors.length, iterations: Infinity}
  )
}

initializeUserInputs(new LogicalBoard(animator));
