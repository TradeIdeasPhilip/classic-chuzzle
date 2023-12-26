import {
  initializedArray,
  makeLinear,
  polarToRectangular,
} from "phil-lib/misc";

type Point = { readonly x: number; readonly y: number };

type Options = { numberOfSegments?: number };

type VectorFunction = (t: number) => Point;

function getDirection(f: VectorFunction, t: number, ε: number) {
  if (!(t >= 0 && t <= 1)) {
    throw new Error("Expected 0 ≤ t ≤ 1");
  }
  const fromInput = Math.max(0, t - ε);
  const fromOutput = f(fromInput);
  const toInput = Math.max(0, t + ε);
  const toOutput = f(toInput);
  const Δx = toOutput.x - fromOutput.x;
  const Δy = toOutput.y - fromOutput.y;
  if (Δx == 0 && Δy == 0) {
    return NaN;
  }
  return Math.atan2(Δx, Δy);
}

export function mathToPath(f: VectorFunction, options: Options = {}) {
  const numberOfSegments = Math.ceil(options.numberOfSegments ?? 10);
  if (numberOfSegments < 1) {
    throw new Error(`Invalid numberOfSegments: ${numberOfSegments}`);
  }
  const ε = 0.01 / numberOfSegments;
  const samples = initializedArray(numberOfSegments + 1, (index) => {
    const t = index / numberOfSegments;
    const point = f(t);
    const direction = getDirection(f, t, ε);
    return { t, point, direction };
  });
  const segments = initializedArray(
    numberOfSegments,
    (index) => [{ from: samples[index], to: samples[index + 1] }][0]
  );
  console.log({ samples, segments });
  let result = `M ${segments[0].from.point.x}, ${segments[0].from.point.y}`;
  segments.forEach((segment) => {
    result += ` ${segment.to.point.x},${segment.to.point.y}`; // TODO make quadratics
  });
  return result;
}

export function spiralPath(from: Point, to: Point, numberOfTurns: number) {
  const startTime = 0;
  const endTime = 1;
  const straightBack: Point = { x: from.x - to.x, y: from.y - to.y };
  const initialRadius = Math.hypot(straightBack.x, straightBack.y);
  const getRadius = makeLinear(startTime, initialRadius, endTime, 0);
  const initialAngle = Math.atan2(straightBack.y, straightBack.x);
  const getAngle = makeLinear(
    startTime,
    initialAngle,
    endTime,
    initialAngle + numberOfTurns * 2 * Math.PI
  );
  function f(t: number): Point {
    const radius = getRadius(t);
    const angle = getAngle(t);
    const offset = polarToRectangular(radius, angle);
    return { x: to.x + offset.x, y: to.y + offset.y };
  }
  return mathToPath(f, { numberOfSegments: numberOfTurns * 9.001002 });
}
