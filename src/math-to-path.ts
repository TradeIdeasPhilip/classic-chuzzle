import {
  initializedArray,
  makeLinear,
  polarToRectangular,
} from "phil-lib/misc";

type Point = { readonly x: number; readonly y: number };

type Options = {
  /**
   * An integer greater than 0.
   * A larger number will give you more precision and a longer string.
   *
   * Each segment will correspond to a single quadratic Bézier curve.
   * So each segment can only curve one way or the other.
   * And a single segment can't curve 180° around.
   */
  numberOfSegments?: number;
};

/**
 * This is a function that describes a path.
 *
 * If you call this function with a parameter of 0 the result should be the the point at the beginning of the path.
 * If you call this with 1, the result should be the point at the end of the path.
 * If you call it with any value in between, you should get a point on the path.
 * As you make smaller and smaller changes to the input, you should get smaller and smaller changes in the output.
 * I.e. the function is continuous and smooth.
 *
 * (Aside from being smooth) the change in output does not have to be linked to the change in input.
 * In the spiral example each segment covers the same number of degrees.  The animation will automatically
 * move a certain specific distance / second.  It will take more time to traverse longer segments than to traverse
 * shorter segments.  We get this for free because we are creating a single segment.  If you break your animation
 * up into multiple functions, you'll have to deal with that yourself.
 */
type VectorFunction = (t: number) => Point;

/**
 * What direction is the output of the given function moving at the given time?
 *
 * Basically a derivative in more dimensions.
 * @param f Find the derivative of this function.
 * @param t Take the derivative at this time.
 * @param ε A small value that we can add to t or subtract from t, to estimate the derivative.
 * @returns An angle, in a form suitable for Math.tan().
 */
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

/**
 * This allows you to specify a _smooth_ curve in terms of a JavaScript function, and it will return a path string suitable for use with
 * [svg](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) and
 * [css](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_motion_path).
 * @param f This function describes the desired path.  For any time between 0 and 1, this function will return a point.
 * These points are expected to describe a __smooth__ curve.
 * @param options Accuracy vs performance.
 * @returns A path string suitable for use with svg and css.
 */
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
    const controlPoint = findIntersection(
      {
        x0: segment.from.point.x,
        y0: segment.from.point.y,
        slope: 1 / Math.tan(segment.from.direction),
      },
      {
        x0: segment.to.point.x,
        y0: segment.to.point.y,
        slope: 1 / Math.tan(segment.to.direction),
      }
    );
    if (controlPoint) {
      result += ` Q ${controlPoint.x},${controlPoint.y}`;
    } else {
      result += " M";
    }
    result += ` ${segment.to.point.x},${segment.to.point.y}`;
  });
  return result;
}

/**
 *
 * @param from The starting point of the path.  This is on the outside of the spiral.
 * @param to The ending point of the path.  This is at the center of the spiral.
 * @param numberOfTurns This should be a positive number.  Bigger numbers make longer paths.
 * @returns A path appropriate for use in CSS and SVG.
 */
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

// TODO these should really be rays.  Two rays might not meet at all.
// If they do meet, findIntersection() will give the right answer.
// We need to know an angle, not a slope, to find that out.
//
// TODO if there is a problem matching the rays, we should draw a
// straight line, instead of skipping the segment or drawing some
// wild curves.  As learned from #SOME3.  Still skip the segment
// if an input is NaN.
type Line = { x0: number; y0: number; slope: number };

function findIntersection(α: Line, β: Line): Point | undefined {
  if (isNaN(α.slope) || isNaN(β.slope) || α.slope == β.slope) {
    return undefined;
  }
  const αIsVertical = α.slope == Infinity || α.slope == -Infinity;
  const βIsVertical = β.slope == Infinity || β.slope == -Infinity;
  if (αIsVertical || βIsVertical) {
    return undefined;
  }
  const x = αIsVertical
    ? α.x0
    : βIsVertical
    ? β.x0
    : (β.y0 - β.slope * β.x0 - α.y0 + α.slope * α.x0) / (α.slope - β.slope);
  const y = αIsVertical
    ? β.slope * (x - β.x0) + β.y0
    : α.slope * (x - α.x0) + α.y0;
  return { x, y };
}