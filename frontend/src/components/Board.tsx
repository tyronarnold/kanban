"use client";

import { useReducer, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { boardReducer, findColumn, initialBoard } from "@/lib/board";
import { CardView } from "./Card";
import { Column } from "./Column";

export function Board() {
  const [state, dispatch] = useReducer(boardReducer, initialBoard);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Moving between columns happens while dragging so the card previews in its new column.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = findColumn(state, String(active.id));
    const to = findColumn(state, String(over.id));
    if (!from || !to || from.id === to.id) return;
    const overIndex = to.cardIds.indexOf(String(over.id));
    const toIndex = overIndex === -1 ? to.cardIds.length : overIndex;
    dispatch({ type: "moveCard", cardId: String(active.id), toColumnId: to.id, toIndex });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;
    const column = findColumn(state, String(over.id));
    if (!column) return;
    const overIndex = column.cardIds.indexOf(String(over.id));
    const toIndex = overIndex === -1 ? column.cardIds.length - 1 : overIndex;
    dispatch({ type: "moveCard", cardId: String(active.id), toColumnId: column.id, toIndex });
  }

  const activeCard = activeId ? state.cards[activeId] : null;
  const cardCount = Object.keys(state.cards).length;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-4 px-6 py-6 sm:px-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Project Board</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy">Product Launch</h1>
            <div className="mt-3 h-1 w-14 rounded-full bg-accent" />
          </div>
          <p className="text-sm text-muted">
            {cardCount} {cardCount === 1 ? "card" : "cards"} across {state.columns.length} columns
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto">
        <DndContext
          id="board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={({ active }) => setActiveId(String(active.id))}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="mx-auto grid max-w-[1600px] min-w-[1120px] grid-cols-5 gap-5 px-6 py-8 sm:px-10">
            {state.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={column.cardIds.map((id) => state.cards[id])}
                dispatch={dispatch}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard && (
              <CardView card={activeCard} color={findColumn(state, activeCard.id)!.color} overlay />
            )}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
