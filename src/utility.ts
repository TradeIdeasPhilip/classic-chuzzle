/**
 * This file contains code that is not specific to this project in any way
 * and could be reused by a lot of other projects.
 *
 * It might make sense to move some or all of this to phil-lib.
 */

/**
 * This is similar to `numerator % denominator`, i.e. modulo division.
 * The difference is that the result will never be negative.
 * If the numerator is negative `%`  will return a negative number.
 *
 * If the 0 point is chosen arbitrarily then you should use `positiveModulo()` rather than `%`.
 * For example, C's `time_t` and JavaScript's `Date.prototype.valueOf()` say that 0 means midnight January 1, 1970.
 * Negative numbers refer to times before midnight January 1, 1970, and positive numbers refer to times after midnight January 1, 1970.
 * But midnight January 1, 1970 was chosen arbitrarily, and you probably don't want to treat times before that differently than times after that.
 * And how many people would even think to test a negative date?
 *
 * `positiveModulo(n, d)` will give the same result as `positiveModulo(n + d, d)` for all vales of `n` and `d`.
 * (You might get 0 sometimes and -0 other times, but those are both `==` so I'm not worried about that.)
 */
export function positiveModulo(numerator: number, denominator: number) {
  const simpleAnswer = numerator % denominator;
  if (simpleAnswer < 0) {
    return simpleAnswer + Math.abs(denominator);
  } else {
    return simpleAnswer;
  }
}

/**
 * Create a new array by rotating another array.
 * @param input The initial array.
 * @param by How many places to rotate left.
 * Negative values mean to the right.
 * This should be a 32 bit integer.
 * 0 and large numbers are handled efficiently.
 */
export function rotateArray<T>(input: ReadonlyArray<T>, by: number) {
  if ((by | 0) != by) {
    throw new Error(`invalid input: ${by}`);
  }
  by = positiveModulo(by, input.length);
  if (by == 0) {
    return input;
  } else {
    return [...input.slice(by), ...input.slice(0, by)];
  }
}

// This assertClass() is a small improvement on the version in phil-lib.

/**
 * Cast an object to a type.
 * Check the type at runtime.
 * @param item Check the type of this item.
 * @param ty The expected type.  This should be a class.
 * @param notes This will be included in the error message.
 * @returns item
 * @throws If the item is not of the correct type, throw an `Error` with a detailed message.
 */
export function assertClass<T extends object, ARGS extends any[]>(
  item: unknown,
  ty: { new (...args: ARGS): T },
  notes = "Assertion Failed."
): T {
  const failed = (typeFound: string) => {
    throw new Error(
      `${notes}  Expected type:  ${ty.name}.  Found type:  ${typeFound}.`
    );
  };
  if (item === null) {
    failed("null");
  } else if (typeof item != "object") {
    failed(typeof item);
  } else if (!(item instanceof ty)) {
    failed(item.constructor.name);
  } else {
    return item;
  }
  throw new Error("wtf");
}
