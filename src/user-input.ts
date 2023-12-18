/**
 * Set up the event handlers.
 */

import { getById } from "phil-lib/client-misc";
import { makeLinear } from "phil-lib/misc";
import { LogicalBoard, PointerActions } from "./logical-board";

export function initializeUserInputs(logicalBoard: LogicalBoard) {
  const svg = getById("main", SVGSVGElement);

  /**
   *
   * @param pointerEvent The browser gives mouse data to the program when an event occurs.  The program cannot ask for this data at other times.
   * @returns The mouse position in the same units as the SVG uses.
   * - 1 is the height and width of a single`GuiPiece`.
   * - (0, 0) is the top left corner of the board.
   * - Fractions are possible.
   * - Values can be off the board because the program does a mouse capture.
   */
  function translateCoordinates(pointerEvent: PointerEvent): {
    readonly row: number;
    readonly column: number;
  } {
    const rect = svg.getBoundingClientRect();
    const yToRow = makeLinear(rect.top, 0, rect.bottom, LogicalBoard.SIZE);
    const xToColumn = makeLinear(rect.left, 0, rect.right, LogicalBoard.SIZE);
    return {
      row: yToRow(pointerEvent.clientY),
      column: xToColumn(pointerEvent.clientX),
    };
  }

  /**
   * - `none` — We are not currently tracking the mouse.  This is the only place to start tracking the mouse.
   * - `started` — The user clicked the mouse but hasn't moved the mouse yet.  Or hasn't moved it enough for the program to notice it.
   * - `horizontal` — The user moved the mouse left or right, so the program is moving items left and right.  Any movement up or down is ignored.
   * - `vertical` — The user moved the mouse up or down, so the program is moving items up and down.  Any movement left or right is ignored.
   */

  type StateInfo =
    | { readonly state: "none" }
    | {
        readonly state: "started";
        readonly startRow: number;
        readonly startColumn: number;
      }
    | {
        readonly state: "horizontal" | "vertical";
        /**
         * If `dragState == "horizontal"` this is the row number.
         * If `dragState == "vertical"` this is the column number.
         */
        readonly fixedIndex: number;
        /**
         * If `dragState == "horizontal"` this is the column number.
         * If `dragState == "vertical"` this is the row number.
         */
        readonly startIndex: number;
        /**
         *
         * @param pointerEvent This contains the current position of the mouse.
         * It is not possible to read from the mouse at arbitrary times.
         * @returns How far right or down the mouse has moved since mouse down.
         * This can be negative  if the mouse moved left or up.  This can
         * be greater than LogicalBoard.SIZE.
         */
        relevantMouseMove(pointerEvent: PointerEvent): number;
        readonly actions: PointerActions;
      }
    | { readonly state: "animation" };

  let stateInfo: StateInfo = { state: "none" };

  svg.addEventListener("pointerdown", (pointerEvent) => {
    if (stateInfo.state == "none") {
      pointerEvent.stopPropagation();
      svg.setPointerCapture(pointerEvent.pointerId);
      const start = translateCoordinates(pointerEvent);
      svg.style.cursor = "move";
      stateInfo = {
        state: "started",
        startRow: start.row,
        startColumn: start.column,
      };
    }
  });

  svg.addEventListener("pointermove", (pointerEvent) => {
    if (stateInfo.state == "none" || stateInfo.state == "animation") {
      return;
    }
    pointerEvent.stopPropagation();

    /** The current mouse position in SVG coordinates.  */
    const current = translateCoordinates(pointerEvent);
    if (stateInfo.state == "started") {
      const rowDiff = Math.abs(current.row - stateInfo.startRow);
      const columnDiff = Math.abs(current.column - stateInfo.startColumn);
      if (Math.max(rowDiff, columnDiff) < 0.05) {
        // The mouse hasn't moved enough.  Don't lock the user into a direction just because he barely jiggled the mouse while clicking.
        return;
      } else if (rowDiff > columnDiff) {
        const state = "vertical";
        const fixedIndex = Math.floor(stateInfo.startColumn);
        const startIndex = stateInfo.startRow;
        const relevantMouseMove = (pointerEvent: PointerEvent): number => {
          const { row } = translateCoordinates(pointerEvent);
          return row - startIndex;
        };
        const actions: PointerActions =
          logicalBoard.startVerticalMove(fixedIndex);
        stateInfo = {
          state,
          fixedIndex,
          startIndex,
          relevantMouseMove,
          actions,
        };
        svg.style.cursor = "ns-resize";
      } else if (columnDiff > rowDiff) {
        const state = "horizontal";
        const fixedIndex = Math.floor(stateInfo.startRow);
        const startIndex = stateInfo.startColumn;
        const relevantMouseMove = (pointerEvent: PointerEvent): number => {
          const { column } = translateCoordinates(pointerEvent);
          return column - startIndex;
        };
        const actions: PointerActions =
          logicalBoard.startHorizontalMove(fixedIndex);
        stateInfo = {
          state,
          fixedIndex,
          startIndex,
          relevantMouseMove,
          actions,
        };
        svg.style.cursor = "ew-resize";
      } else {
        // both are equal.  keep trying.
        return;
      }
    }
    stateInfo.actions.preview(stateInfo.relevantMouseMove(pointerEvent));
  });

  svg.addEventListener("lostpointercapture", async (pointerEvent) => {
    // lostpointercapture will happen with pointer up or pointercancel.
    // So lostpointercapture is the safer option.
    switch (stateInfo.state) {
      case "started": {
        // Someone clicked the mouse but didn't move it enough to have any effect.
        // I.e. the GUI hasn't changed at all, and neither has the state of the board.
        break;
      }
      case "horizontal":
      case "vertical": {
        svg.style.cursor = "none";
        const instructions = stateInfo;
        stateInfo = { state: "animation" };
        await instructions.actions.release(
          instructions.relevantMouseMove(pointerEvent)
        );
        break;
      }
      default: {
        // This shouldn't happen.  We shouldn't be able to lose the pointer capture unless we captures it
        // and we would have changed state at that time.
        // Maybe something failed elsewhere and left us in an inconsistent state.
        throw new Error("wtf");
      }
    }
    stateInfo = { state: "none" };
    svg.style.cursor = "";
  });
}
