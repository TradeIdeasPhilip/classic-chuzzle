import "./style.css";
import { assertClass } from "phil-lib/misc";
import { getById } from "phil-lib/client-misc";

type Color = string;

type Piece = { readonly color: Color; readonly weight: number };

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

function getPieces(): AllPieces {
  const mainTable = getById("main", HTMLTableElement);
  const allCells = getTableCells(mainTable);
  return allCells.map((row) =>
    row.map((cell) => {
      return { color: cell.innerText, weight: 1 };
    })
  );
}

type AllGroupHolders = ReadonlyArray<ReadonlyArray<GroupHolder>>;

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

const groupHolders = GroupHolder.createAll(getPieces());
GroupHolder.combineAll(groupHolders);
const groups = GroupHolder.findBigGroups(groupHolders);
console.log(groups);