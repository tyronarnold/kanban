import { describe, expect, it } from "vitest";
import { boardReducer, findColumn, initialBoard, type BoardState, type ColumnId } from "./board";

const ids = (state: BoardState, columnId: ColumnId) => findColumn(state, columnId)!.cardIds;

describe("initialBoard", () => {
  it("has the five fixed columns with their card colors", () => {
    expect(initialBoard.columns.map((c) => [c.id, c.title, c.color])).toEqual([
      ["backlog", "Backlog", "#D4D4D4"],
      ["todo", "To Do", "#9FFCFD"],
      ["in-progress", "In Progress", "#C8BFE7"],
      ["review", "Review", "#FFD38E"],
      ["done", "Done", "#A9EBBE"],
    ]);
  });

  it("references every card exactly once and every column has cards", () => {
    const referenced = initialBoard.columns.flatMap((c) => c.cardIds);
    expect(referenced.sort()).toEqual(Object.keys(initialBoard.cards).sort());
    expect(initialBoard.columns.every((c) => c.cardIds.length > 0)).toBe(true);
  });
});

describe("findColumn", () => {
  it("finds a column by its id or by a card id", () => {
    expect(findColumn(initialBoard, "review")?.id).toBe("review");
    expect(findColumn(initialBoard, "c6")?.id).toBe("in-progress");
    expect(findColumn(initialBoard, "missing")).toBeUndefined();
  });
});

describe("boardReducer", () => {
  it("renames a column without touching others", () => {
    const state = boardReducer(initialBoard, { type: "renameColumn", columnId: "todo", title: "Next Up" });
    expect(findColumn(state, "todo")?.title).toBe("Next Up");
    expect(findColumn(state, "backlog")?.title).toBe("Backlog");
    expect(findColumn(initialBoard, "todo")?.title).toBe("To Do");
  });

  it("adds a card to the end of a column", () => {
    const card = { id: "new", title: "New card", details: "Some details" };
    const state = boardReducer(initialBoard, { type: "addCard", columnId: "review", card });
    expect(state.cards.new).toEqual(card);
    expect(ids(state, "review")).toEqual(["c8", "new"]);
  });

  it("deletes a card from its column and the card map", () => {
    const state = boardReducer(initialBoard, { type: "deleteCard", cardId: "c4" });
    expect(state.cards.c4).toBeUndefined();
    expect(ids(state, "todo")).toEqual(["c3", "c5"]);
    expect(initialBoard.cards.c4).toBeDefined();
  });

  it("reorders a card within a column", () => {
    const state = boardReducer(initialBoard, { type: "moveCard", cardId: "c3", toColumnId: "todo", toIndex: 2 });
    expect(ids(state, "todo")).toEqual(["c4", "c5", "c3"]);
  });

  it("moves a card to a position in another column", () => {
    const state = boardReducer(initialBoard, { type: "moveCard", cardId: "c1", toColumnId: "done", toIndex: 1 });
    expect(ids(state, "backlog")).toEqual(["c2"]);
    expect(ids(state, "done")).toEqual(["c9", "c1", "c10"]);
  });

  it("moves a card to the end of another column", () => {
    const state = boardReducer(initialBoard, { type: "moveCard", cardId: "c8", toColumnId: "todo", toIndex: 3 });
    expect(ids(state, "todo")).toEqual(["c3", "c4", "c5", "c8"]);
    expect(ids(state, "review")).toEqual([]);
  });

  it("moves a card into an empty column", () => {
    const emptied = boardReducer(initialBoard, { type: "deleteCard", cardId: "c8" });
    const state = boardReducer(emptied, { type: "moveCard", cardId: "c2", toColumnId: "review", toIndex: 0 });
    expect(ids(state, "review")).toEqual(["c2"]);
    expect(ids(state, "backlog")).toEqual(["c1"]);
  });
});
