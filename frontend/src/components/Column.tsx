"use client";

import { useState, type Dispatch, type FormEvent } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { BoardAction, Card, Column as ColumnData } from "@/lib/board";
import { SortableCard } from "./Card";

type ColumnProps = { column: ColumnData; cards: Card[]; dispatch: Dispatch<BoardAction> };

export function Column({ column, cards, dispatch }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  function rename(value: string) {
    const title = value.trim();
    if (title && title !== column.title) dispatch({ type: "renameColumn", columnId: column.id, title });
    setEditing(false);
  }

  function addCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title")).trim();
    if (!title) return;
    const details = String(data.get("details")).trim();
    dispatch({ type: "addCard", columnId: column.id, card: { id: crypto.randomUUID(), title, details } });
    setAdding(false);
  }

  return (
    <section
      ref={setNodeRef}
      aria-label={column.title}
      data-testid={`column-${column.id}`}
      className={`flex min-h-[28rem] flex-col rounded-2xl bg-white/80 ring-1 transition-colors ${
        isOver ? "ring-2 ring-primary/60" : "ring-slate-200"
      }`}
    >
      <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: column.color }} />
      <header className="flex items-center gap-2 px-4 pt-3 pb-2">
        {editing ? (
          <input
            autoFocus
            defaultValue={column.title}
            aria-label="Column name"
            maxLength={40}
            onBlur={(e) => rename(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") e.currentTarget.value = column.title;
              if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
            }}
            className="min-w-0 flex-1 rounded-md border border-primary bg-white px-2 py-1 text-sm font-semibold text-navy outline-none ring-2 ring-primary/20"
          />
        ) : (
          <h2 className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Rename column"
              className="w-full truncate rounded-md px-2 py-1 text-left text-sm font-semibold text-navy transition hover:bg-slate-100"
            >
              {column.title}
            </button>
          </h2>
        )}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted" aria-label={`${cards.length} cards`}>
          {cards.length}
        </span>
      </header>

      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-1 flex-col gap-2.5 px-3 pb-2">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              color={column.color}
              onDelete={() => dispatch({ type: "deleteCard", cardId: card.id })}
            />
          ))}
        </ul>
      </SortableContext>

      <div className="p-3 pt-1">
        {adding ? (
          <form
            onSubmit={addCard}
            onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
            className="space-y-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
          >
            <input
              name="title"
              autoFocus
              required
              placeholder="Card title"
              aria-label="Card title"
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-navy outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              name="details"
              rows={3}
              placeholder="Details"
              aria-label="Card details"
              className="w-full resize-none rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-navy outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-secondary/90"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-navy"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-primary"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </section>
  );
}
