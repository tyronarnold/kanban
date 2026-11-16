# Kanban MVP - Implementation Plan

## Context

The repo is a skeleton (only `AGENTS.md` and `README.md`). AGENTS.md asks for a single-board Kanban MVP: a client-rendered Next.js app in `frontend/` with 5 fixed, renamable columns, cards with title + details, drag and drop between columns, add/delete cards, dummy data on load, no persistence, and a polished UI using the specified color scheme. The strategy requires a checked-off plan, unit tests, Playwright integration tests, and a running server at the end.

Note: on Windows, run Vitest from an uppercase drive path (`C:/...`); a lowercase `c:/` working directory makes suites fail with "failed to find the current suite".


## Stack (latest versions at install time)

- Next.js (App Router, TypeScript, `src/`, Tailwind CSS v4, ESLint) via `npx create-next-app@latest frontend`
- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` for drag and drop
- State: `useReducer` with pure functions in one module (no state library)
- Unit/component tests: Vitest + React Testing Library + `@testing-library/user-event` + jsdom
- Integration tests: Playwright (Chromium), `webServer` starts the dev server

## File layout

```
.gitignore                     # root: node_modules, .next, out, coverage, test-results, playwright-report, .env*
docs/PLAN.md                   # checklist copy of this plan, ticked off during execution
frontend/
  src/lib/board.ts             # types, column defs + colors, initial dummy data, reducer
  src/lib/board.test.ts
  src/components/Board.tsx     # 'use client'; DndContext, DragOverlay, reducer wiring
  src/components/Column.tsx    # droppable column, inline rename, add-card form
  src/components/Card.tsx      # sortable card, delete button
  src/components/Board.test.tsx
  src/app/page.tsx, layout.tsx, globals.css
  e2e/board.spec.ts
  vitest.config.ts, vitest.setup.ts, playwright.config.ts
README.md                      # replace with minimal run/test instructions
```

## Design

**Data model (`board.ts`)**
- `Card { id, title, details }`; `Column { id, title, cardIds }`; `BoardState { columns: Column[]; cards: Record<string, Card> }`
- Fixed column ids `backlog | todo | in-progress | review | done` with card colors `#D4D4D4 / #9FFCFD / #C8BFE7 / #FFD38E / #A9EBBE`
- ~10 realistic dummy cards spread over all columns
- Reducer actions: `renameColumn`, `addCard`, `deleteCard`, `moveCard(cardId, toColumnId, toIndex)`; ids via `crypto.randomUUID()`

**UI**
- Header: Dark Navy `#032147` title, Gray `#888888` subtitle, Accent Yellow `#ecad0a` underline/accent bar
- 5 equal columns in a horizontal row (horizontal scroll on narrow screens), soft neutral background, rounded panels, card-count badge, Blue `#209dd7` accents for key elements
- Cards: column-colored background, title (semibold) + details (gray, clamped), subtle shadow, hover lift; delete "x" icon visible on hover/focus with `aria-label`
- Column rename: click title -> input; Enter/blur saves, Escape cancels, empty reverts
- Add card: "Add card" button at column bottom opens inline form (title required, details optional); Purple `#753991` submit; Escape/cancel closes
- Drag and drop: `PointerSensor` (small activation distance so clicks still work) + `KeyboardSensor`; standard multi-container pattern (move across columns in `onDragOver`, reorder in `onDragEnd`); `useDroppable` per column so empty columns accept drops; `DragOverlay` with slight rotation/shadow; `DndContext id="board"` to avoid hydration id mismatch
- Font: Geist from create-next-app default; no emojis anywhere

## Phases and success criteria

### Phase 1 - Scaffolding
- [x] `frontend/` created with create-next-app (TS, Tailwind, App Router, ESLint, src dir)
- [x] Root `.gitignore` added; `docs/PLAN.md` written
- [x] dnd-kit, Vitest/RTL, Playwright installed; `npm test`, `npm run test:e2e` scripts exist
- [x] Default boilerplate removed; `npm run dev` serves a blank page; `npm run lint` and `npm run build` pass

### Phase 2 - Board logic + unit tests
- [x] `board.ts` types, columns, dummy data, reducer implemented
- [x] Unit tests cover: initial data shape (5 columns, every card referenced once), rename, add (appended to column, new id), delete (removed from column and map), move within column, move across columns, move to empty column, move to end
- [x] All unit tests pass

### Phase 3 - UI components
- [x] Board renders 5 columns with dummy data and correct per-column card colors
- [x] Rename, add, delete, drag-and-drop all work in browser
- [x] Styling matches color scheme; looks polished at 1440px and usable at ~768px
- [x] Component tests (RTL) cover render, rename (Enter, Escape), add (submit, empty title blocked, cancel), delete
- [x] No console errors/hydration warnings; lint + build pass

### Phase 4 - Integration testing (Playwright)
- [x] E2E: loads with 5 column headings and dummy cards
- [x] E2E: add card, delete card, rename column
- [x] E2E: drag card to another column (mouse down/move in steps/up), reorder within a column, drop into an emptied column
- [x] E2E: reload resets to dummy data (no persistence); no console errors during run
- [x] Any defects found are fixed and all suites green

### Phase 5 - Finish
- [x] Minimal README (run, test commands); no emojis
- [x] `docs/PLAN.md` fully checked off
- [x] Dev server running in background at http://localhost:3001 (3000 was in use) and handed to user

## Verification

From `C:/Users/tyarn/OneDrive/Desktop/Projects/kanban/frontend` (uppercase drive):
- `npm run lint && npm run build`
- `npm test` (Vitest unit + component)
- `npx playwright install chromium` then `npm run test:e2e` (runs on port 3001)
- Start `npm run dev` in background and confirm http://localhost:3001 returns 200; quick visual check via a Playwright screenshot
