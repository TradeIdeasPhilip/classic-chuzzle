import "./style.css";
import { assertClass, zip } from "phil-lib/misc";
import { getById } from "phil-lib/client-misc";

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
function positiveModulo(numerator: number, denominator: number) {
  const simpleAnswer = numerator % denominator;
  if (simpleAnswer < 0) {
    return simpleAnswer + Math.abs(denominator);
  } else {
    return simpleAnswer;
  }
}

type Color = string;

type Piece = { readonly color: Color; readonly weight: number };

/**
 * Extract all of the cells from a table and return them in a 2 dimensional array.
 * @param table Read from here
 * @returns An array of arrays of `<td>` and/or `<th>` values.
 * The first index is the row number and the second is the column number.
 */
function getTableCells(table: HTMLTableElement) {
  const rows = Array.from(table.querySelectorAll("tr"));
  return rows.map((row) =>
    Array.from(row.children).map((cell) =>
      assertClass(cell, HTMLTableCellElement)
    )
  );
}

/**
 * The first index is the row number, the second is the column number.
 */
type AllPieces = ReadonlyArray<ReadonlyArray<Piece>>;

/**
 * Read all of the pieces from the GUI.
 *
 * Most of this code does not know or care where this info is stored.
 * And I know the storage will change.
 * Currently the GUI is only good enough for debugging.
 */
function getPieces(): AllPieces {
  const mainTable = getById("main", HTMLTableElement);
  const allCells = getTableCells(mainTable);
  return allCells.map((row) =>
    row.map((cell) => {
      return { color: cell.innerText, weight: 1 };
    })
  );
}

/**
 * Update the GUI with a complete list of pieces and positions.
 *
 * Most of this code does not know or care where this info is stored.
 * And I know the storage will change.
 * Currently the GUI is only good enough for debugging.
 *
 * The GUI will eventually include animations,
 * and that will require more information,
 * so I know this interface will need to change.
 * @param source A valid array of pieces.
 */
function showPieces(source: AllPieces) {
  const mainTable = getById("main", HTMLTableElement);
  const destination = getTableCells(mainTable);
  for (const [destinationRow, sourceRow] of zip(destination, source)) {
    for (const [cell, piece] of zip(destinationRow, sourceRow)) {
      cell.innerText = piece.color;
      cell.style.backgroundColor = piece.color;
    }
  }
  return Promise.resolve();
}

// Initialize the colors.
showPieces(getPieces());

/**
 * This does a non-destructive rotate.
 * It will not modify the original.
 * It will return the rotated version.
 *
 * E.g.
 * `rotateArray(['A', 'b', 'c', 'd', 'e'], 1)` returns ['b', 'c', 'd', 'e', 'A'].
 * `rotateArray(['A', 'b', 'c', 'd', 'e'], 2)` returns ['c', 'd', 'e', 'A', 'b'].
 * `rotateArray(['A', 'b', 'c', 'd', 'e'], -1)` returns ['e', 'A', 'b', 'c', 'd'].
 *
 * Rotating by 0 or by a large number is handled efficiently.
 * @param input The array to rotate.  Must contain at least one element.
 * @param by How many items to rotate.  Must be a 32 bit integer.
 * @returns The original array if no changes were requested.  Or a new array with the given changes.
 */
function rotateArray<T>(input: ReadonlyArray<T>, by: number) {
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

/**
 * Rotate a single row.  Like when the user drags a piece left or right.
 * @param input A valid board configuration.
 * @param rowNumber Which row to rotate.
 * @param by How many places left to move each piece.
 * Positive numbers move to the left, and negative numbers move to the right.
 * Must be a 32 bit integer.
 * 0 and large values are handled efficiently.
 * @returns A board with the requested configuration.
 * This will reuse as many arrays as it can, and will create new arrays as needed.
 */
function rotateLeft(
  input: AllPieces,
  rowNumber: number,
  by: number
): AllPieces {
  const originalRow = input[rowNumber];
  const newRow = rotateArray(originalRow, by);
  if (originalRow == newRow) {
    // No change.  Return the original.
    return input;
  } else {
    // One row changed.  Reuse the arrays for the other rows.
    return input.map((row) => (row == originalRow ? newRow : row));
  }
}

/**
 * Rotate a single column.  Like when the user moves a piece up or down.
 * @param input A valid board configuration.
 * @param columnNumber Which column to rotate.
 * @param by How many places left to move each piece.
 * Positive numbers move up, and negative numbers move down.
 * Must be a 32 bit integer.
 * 0 and large values are handled efficiently.
 * @returns A board with the requested configuration.
 * This will reuse as many arrays as it can, and will create new arrays as needed.
 */
function rotateUp(
  input: AllPieces,
  columnNumber: number,
  by: number
): AllPieces {
  const numberOfRows = input.length;
  // Simplify things by forcing by to be in [0, numberOfRows)
  by = positiveModulo(by, numberOfRows);
  if (by == 0) {
    // No change.  Return the original.
    return input;
  } else {
    return input.map((row, rowNumber) => {
      // First, create a copy of the row, so we can modify the copy.
      const result = [...row];
      // Then update the item in the column that is rotating.
      result[columnNumber] =
        input[(rowNumber + by) % numberOfRows][columnNumber];
      return result;
    });
  }
}

/**
 * The first index is the row number.
 * The second index is the column number.
 */
type AllGroupHolders = ReadonlyArray<ReadonlyArray<GroupHolder>>;

/**
 * A lot of the data in this program is readonly.
 * GroupHolder has values that can be modified.
 * This is required internally by the algorithm that finds colors that are touching.
 * TODO There are too many public functions.
 * It makes sense to call one public function to do all of the work.
 */
class GroupHolder {
  #group: Group;
  private constructor(
    readonly row: number,
    readonly column: number,
    readonly piece: Piece
  ) {
    // Initially we have one group per piece.
    this.#group = new Group(this);
  }
  get color(): Color {
    return this.piece.color;
  }
  static createAll(pieces: AllPieces): AllGroupHolders {
    return pieces.map((row, rowNumber) =>
      row.map(
        (piece, columnNumber) => new GroupHolder(rowNumber, columnNumber, piece)
      )
    );
  }
  /**
   * Combine two groups, if they contain the same color pieces.
   * @param other Another group which is adjacent to `this` group.
   */
  private tryCombine(other: GroupHolder) {
    if (this.#group != other.#group && this.color == other.color) {
      /*
      if (this.color == "green") {
       (window as any).showGreen();
       //debugger;
      }
      */
      /**
       * `this` group will grow to contain each member of the
       * `other` group.  And the `other` group will be marked as
       * `!valid` so we don't accidentally try to use it again.
       *
       * `allChanged` contains a list of what was originally in
       * the other group.
       */
      const allChanged = this.#group.consume(other.#group);
      // Update the GroupHolder objects.
      // Everything that was in the `other` group is now in `this` group.
      // (Each GroupHolder points to its Group, and each Group points to all of its Group objects.)
      allChanged.forEach((changed) => (changed.#group = this.#group));
      if (!this.#group.valid) {
        // This was aimed at a specific bug.
        // I was trying to merge a group with itself, and that was invalidating the group.
        // That error got caught the next time I tried to use the group.
        // But by explicitly checking now I could see the problem sooner and I could see the context.
        (window as any).showGreen();
        throw new Error("wtf");
      }
    }
  }
  /**
   * Find all pieces that are touching and have the same color.
   * @param groupHolders  Comes from createAll().
   * This function modifies this parameter to show which pieces are touching other pieces of the same color.
   */
  static combineAll(groupHolders: AllGroupHolders) {
    // showGreen() was aimed at debugging a specific problem.
    // Among other things, this gives access to groupHolders, which might be hard to track down in the debugger and the logs.
    (window as any).showGreen = () => {
      const forTable: {}[] = [];
      const forLog: Group[] = [];
      groupHolders.forEach((row) => {
        row.forEach((groupHolder) => {
          if (groupHolder.color == "green") {
            forTable.push(groupHolder.#group.debugInfo());
            forLog.push(groupHolder.#group);
          }
        });
      });
      // Notice that the row and column of the debugInfo() is the
      // original row and column for the Group.  In this context it
      // might make more sense to show the row and column of each
      // GroupHolder.
      console.table(forTable);
      console.log(forLog);
    };
    groupHolders.forEach((row, rowNumber) => {
      row.forEach((groupHolder, columnNumber) => {
        if (rowNumber) {
          // Check the current piece against the piece above it.
          const previousRowNumber = rowNumber - 1;
          const otherGroupHolder =
            groupHolders[previousRowNumber][columnNumber];
          groupHolder.tryCombine(otherGroupHolder);
        }
        if (columnNumber) {
          // Check the current piece against the piece to its left.
          const previousColumnNumber = columnNumber - 1;
          const otherGroupHolder = row[previousColumnNumber];
          groupHolder.tryCombine(otherGroupHolder);
        }
      });
    });
    // showGreen() remembers the action in progress.
    // The action is finished so showGreen() is no longer relevant.
    delete (window as any).showGreen;
  }
  /**
   * Find all pieces that need to be removed from the board.
   * @param groupHolders Comes from combineAll().
   * @returns A list of groups with 3 or more Pieces.
   */
  static findBigGroups(groupHolders: AllGroupHolders) {
    const countByGroup = new Map<Group, number>();
    groupHolders.forEach((row) =>
      row.forEach((groupHolder) => {
        const group = groupHolder.#group;
        const previousCount = countByGroup.get(group) ?? 0;
        countByGroup.set(group, previousCount + 1);
      })
    );
    const result: Group[] = [];
    for (const [group, count] of countByGroup) {
      if (count >= 3) {
        result.push(group);
      }
    }
    return result;
  }
}

class Group {
  #contents = new Set<GroupHolder>();
  get contents(): ReadonlySet<GroupHolder> {
    return this.#contents;
  }
  static #nextDebugId = 0;
  #debugId = Group.#nextDebugId++;
  readonly debugInitialGroup: GroupHolder;
  /**
   * This is aimed at console.log() or console.table().
   * The format is likely to change.
   */
  debugInfo() {
    return {
      row: this.debugInitialGroup.row,
      column: this.debugInitialGroup.column,
      contents: this.valid ? this.#contents.size : "invalid",
      id: this.#debugId,
    };
  }
  constructor(initialContents: GroupHolder) {
    this.debugInitialGroup = initialContents;
    this.#contents.add(initialContents);
  }
  consume(other: Group) {
    const contents = this.#contents;
    const result = other.#contents;
    result.forEach((item) => contents.add(item));
    other.#contents = undefined!;
    return result;
  }
  get valid(): boolean {
    return !!this.#contents?.has(this.debugInitialGroup);
  }
}

function checkGroups() {
  const groupHolders = GroupHolder.createAll(getPieces());
  GroupHolder.combineAll(groupHolders);
  const groups = GroupHolder.findBigGroups(groupHolders);
  console.log(groups);
}

// Debug stuff.  All of the functions below will automatically be called by the GUI.
// This allows me to test the functions in isolation,
// and to test them before the GUI is ready.

(window as any).checkGroups = checkGroups;

(window as any).rotateLeft = (rowNumber: number, by: number) => {
  showPieces(rotateLeft(getPieces(), rowNumber, by));
};

(window as any).rotateUp = (columnNumber: number, by: number) => {
  showPieces(rotateUp(getPieces(), columnNumber, by));
};
