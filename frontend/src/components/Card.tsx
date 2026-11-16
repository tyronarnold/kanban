"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/lib/board";

type CardViewProps = { card: Card; color: string; onDelete?: () => void; overlay?: boolean };

export function CardView({ card, color, onDelete, overlay }: CardViewProps) {
  return (
    <div
      className={`group relative rounded-xl px-4 py-3 ring-1 ring-black/5 transition-shadow ${
        overlay ? "rotate-2 cursor-grabbing shadow-2xl" : "cursor-grab shadow-sm hover:shadow-md"
      }`}
      style={{ backgroundColor: color }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[5px] rounded-l-xl bg-accent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <h3 className="pr-6 text-sm font-semibold leading-snug text-navy">{card.title}</h3>
      {card.details && <p className="mt-1.5 text-xs leading-relaxed text-navy/70">{card.details}</p>}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${card.title}`}
          className="absolute top-2 right-2 rounded-md p-1 text-navy/50 opacity-0 transition hover:bg-black/10 hover:text-navy focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function SortableCard({ card, color, onDelete }: { card: Card; color: string; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  return (
    <li
      ref={(node) => {
        setNodeRef(node);
        setActivatorNodeRef(node);
      }}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? "opacity-40" : undefined}
      data-testid="card"
      {...attributes}
      {...listeners}
    >
      <CardView card={card} color={color} onDelete={onDelete} />
    </li>
  );
}
