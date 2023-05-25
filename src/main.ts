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
function positiveModulo(numerator : number, denominator : number) {
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
function showPieces(source : AllPieces) {
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
function rotateArray<T>(input : ReadonlyArray<T>, by : number) {
  if ((by|0)!= by) {
    throw new Error(`invalid input: ${by}`);
  }
  by = positiveModulo(by, input.length);
  if (by == 0) {
    return input;
  } else {
    return [...input.slice(by), ...input.slice(0, by)];
  }
}
//(window as any).rotateArray = rotateArray;

/**
 * 
 * @param input A valid board configuration.
 * @param rowNumber Which row to rotate.
 * @param by How many places left to move each piece.
 * Positive numbers move to the left, and negative numbers move to the right.
 * Must be a 32 bit integer.
 * 0 and large values are handled efficiently.
 * @returns A board with the requested configuration.
 * This will reuse as many arrays as it can, and will create new arrays as needed.
 */
function rotateLeft(input : AllPieces, rowNumber : number, by : number) : AllPieces {
  const originalRow = input[rowNumber];
  const newRow = rotateArray(originalRow, by);
  if (originalRow == newRow) {
    return input;
  } else {
    return input.map((row) => (row == originalRow)?newRow:row);
  }
}

/**
 * 
 * @param input A valid board configuration.
 * @param columnNumber Which column to rotate.
 * @param by How many places left to move each piece.
 * Positive numbers move up, and negative numbers move down.
 * Must be a 32 bit integer.
 * 0 and large values are handled efficiently.
 * @returns A board with the requested configuration.
 * This will reuse as many arrays as it can, and will create new arrays as needed.
 */
function rotateUp(input : AllPieces, columnNumber : number, by : number) : AllPieces  {
  const numberOfRows = input.length;
  by = positiveModulo(by, numberOfRows);
  if (by == 0) {
    return input;
  } else {
    return input.map((row, rowNumber) => {
      const result = [...row];
      result[columnNumber] = input[(rowNumber + by)%numberOfRows][columnNumber];
      return result;
    });
  }
}

type AllGroupHolders = ReadonlyArray<ReadonlyArray<GroupHolder>>;

/**
 * A lot of the data in this program is readonly.
 * GroupHolder has values that can be modified.
 * This is required internally by the algorithm that finds colors that are touching.
 */
class GroupHolder {
  #group: Group;
  private constructor(
    readonly row: number,
    readonly column: number,
    readonly piece: Piece
  ) {
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
  private tryCombine(other: GroupHolder) {
    if (this.color == other.color) {
      const allChanged = this.#group.consume(other.#group);
      allChanged.forEach((changed) => (changed.#group = this.#group));
    }
  }
  static combineAll(groupHolders: AllGroupHolders) {
    groupHolders.forEach((row, rowNumber) => {
      row.forEach((groupHolder, columnNumber) => {
        if (rowNumber) {
          const previousRowNumber = rowNumber - 1;
          const otherGroupHolder =
            groupHolders[previousRowNumber][columnNumber];
          groupHolder.tryCombine(otherGroupHolder);
        }
        if (columnNumber) {
          const previousColumnNumber = columnNumber - 1;
          const otherGroupHolder = row[previousColumnNumber];
          groupHolder.tryCombine(otherGroupHolder);
        }
      });
    });
  }
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
  constructor(initialContents: GroupHolder) {
    this.#contents.add(initialContents);
  }
  consume(other: Group) {
    const contents = this.#contents;
    const result = other.#contents;
    result.forEach((item) => contents.add(item));
    other.#contents = undefined!;
    return result;
  }
}

function checkGroups() {
  const groupHolders = GroupHolder.createAll(getPieces());
  GroupHolder.combineAll(groupHolders);
  const groups = GroupHolder.findBigGroups(groupHolders);
  console.log(groups);
}
checkGroups();

(window as any).checkGroups = checkGroups;

(window as any).rotateLeft = (rowNumber : number, by : number) => {
  showPieces(rotateLeft(getPieces(), rowNumber, by));
}

(window as any).rotateUp = (columnNumber : number, by : number) => {
  showPieces(rotateUp(getPieces(), columnNumber, by));
}

// Bug:  When I was in the following configuration checkGroups() failed.
/**
 * green   blue   yellow  blue    violet  violet
 * green   blue   yellow  yellow  orange  red
 * violet  red    green   yellow  yellow  violet
 * red     green  blue    yellow  orange  violet
 * red     green  blue    orange  orange  violet
 * red     green  blue    orange  orange  red
 */
// It gave me the following output:
/**
 * (6) [Group, Group, Group, Group, Group, Group]
0: Group {#contents: Set(6)}
1: Group {#contents: Set(3)}
2: Group {#contents: Set(3)}
3: Group {#contents: Set(3)}
4: Group {#contents: Set(3)}
5: Group {#contents: undefined}
length: 6
[[Prototype]]: Array(0)
 */
// On closer inspection the red, green, blue and violet groups are correct.
// The last group should contain 5 orange cells, but instead I see a group that is in an invalid state.
// TODO  Fix this bug!