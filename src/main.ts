import "./style.css";
import { getById } from "phil-lib/client-misc";
import { LogicalBoard } from "./logical-board";
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
  const [black, white] = getById("background", SVGGElement).querySelectorAll(
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
}

initializeUserInputs(new LogicalBoard(animator));
