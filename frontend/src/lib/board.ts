export type ColumnId = "backlog" | "todo" | "in-progress" | "review" | "done";

export type Card = { id: string; title: string; details: string };

export type Column = { id: ColumnId; title: string; color: string; cardIds: string[] };

export type BoardState = { columns: Column[]; cards: Record<string, Card> };

export type BoardAction =
  | { type: "renameColumn"; columnId: ColumnId; title: string }
  | { type: "addCard"; columnId: ColumnId; card: Card }
  | { type: "deleteCard"; cardId: string }
  | { type: "moveCard"; cardId: string; toColumnId: ColumnId; toIndex: number };

const cards: Card[] = [
  { id: "c1", title: "Define launch goals", details: "Agree on success metrics and target dates with stakeholders." },
  { id: "c2", title: "Competitor research", details: "Summarize pricing and positioning of the top five competitors." },
  { id: "c3", title: "Draft pricing page copy", details: "Three tiers with a clear comparison table." },
  { id: "c4", title: "Design onboarding flow", details: "Wireframes for the first-run experience, including empty states." },
  { id: "c5", title: "Set up analytics", details: "Track signups, activation and weekly retention." },
  { id: "c6", title: "Build signup API", details: "Email verification and rate limiting included." },
  { id: "c7", title: "Landing page hero", details: "New illustration and headline variants for A/B testing." },
  { id: "c8", title: "Security review", details: "Review auth flows and dependency audit before launch." },
  { id: "c9", title: "Project kickoff", details: "Team aligned on scope, roles and timeline." },
  { id: "c10", title: "Brand guidelines", details: "Colors, typography and logo usage finalized." },
];

export const initialBoard: BoardState = {
  columns: [
    { id: "backlog", title: "Backlog", color: "#D4D4D4", cardIds: ["c1", "c2"] },
    { id: "todo", title: "To Do", color: "#9FFCFD", cardIds: ["c3", "c4", "c5"] },
    { id: "in-progress", title: "In Progress", color: "#C8BFE7", cardIds: ["c6", "c7"] },
    { id: "review", title: "Review", color: "#FFD38E", cardIds: ["c8"] },
    { id: "done", title: "Done", color: "#A9EBBE", cardIds: ["c9", "c10"] },
  ],
  cards: Object.fromEntries(cards.map((card) => [card.id, card])),
};

export function findColumn(state: BoardState, id: string) {
  return state.columns.find((column) => column.id === id || column.cardIds.includes(id));
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "renameColumn":
      return {
        ...state,
        columns: state.columns.map((column) =>
          column.id === action.columnId ? { ...column, title: action.title } : column,
        ),
      };
    case "addCard":
      return {
        cards: { ...state.cards, [action.card.id]: action.card },
        columns: state.columns.map((column) =>
          column.id === action.columnId ? { ...column, cardIds: [...column.cardIds, action.card.id] } : column,
        ),
      };
    case "deleteCard": {
      const cards = { ...state.cards };
      delete cards[action.cardId];
      return {
        cards,
        columns: state.columns.map((column) => ({
          ...column,
          cardIds: column.cardIds.filter((id) => id !== action.cardId),
        })),
      };
    }
    case "moveCard":
      return {
        ...state,
        columns: state.columns.map((column) => {
          const cardIds = column.cardIds.filter((id) => id !== action.cardId);
          if (column.id === action.toColumnId) cardIds.splice(action.toIndex, 0, action.cardId);
          return { ...column, cardIds };
        }),
      };
  }
}
