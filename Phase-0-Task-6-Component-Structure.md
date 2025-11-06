# Phase 0 - Task 6: Component Structure

**Task ID:** P0-T6  
**Estimated Time:** 10 minutes  
**Dependencies:** P0-T5 (Hooks created)

---

## Context

Create placeholder React components for the kanban board. These are minimal implementations just to establish the structure - full implementation happens in Phase 1.

---

## Objectives

1. Create component file structure
2. Add placeholder implementations
3. Establish component hierarchy
4. Verify Next.js rendering

---

## Tasks

### 6.1 Create `components/KanbanBoard.tsx`

```typescript
'use client';

import { useBoard } from '@/hooks/useBoard';

/**
 * KanbanBoard - Root component for the kanban board
 * 
 * Placeholder for Phase 0. Full implementation in Phase 1.
 */
export function KanbanBoard() {
  const { board, isLoaded, getAllColumnsWithCards } = useBoard();

  if (!isLoaded || !board) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-secondary)]">Loading board...</p>
      </div>
    );
  }

  const columns = getAllColumnsWithCards();

  return (
    <div className="h-screen bg-[var(--color-bg)] p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Agwakwagan
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Board ID: {board.id}
        </p>
      </div>

      <div className="flex gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-[var(--color-surface)] rounded-lg p-4 w-80"
          >
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
              {column.title}
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {column.cards.length} cards
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.2 Create `components/Column.tsx`

```typescript
'use client';

import { ColumnWithCards } from '@/types/board';

/**
 * Column - Represents a single column in the kanban board
 * 
 * Placeholder for Phase 0. Full implementation in Phase 1.
 */
interface ColumnProps {
  column: ColumnWithCards;
  onAddCard?: (columnId: string, title: string) => void;
}

export function Column({ column, onAddCard }: ColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-[var(--color-surface)] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {column.title}
      </h2>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          {column.cards.length} cards in this column
        </p>
        {/* Card components will be rendered here in Phase 1 */}
      </div>

      <button
        className="w-full text-left text-sm text-[var(--color-text-secondary)] 
                   hover:text-[var(--color-text)] py-2 px-3 rounded 
                   hover:bg-[var(--color-bg)] transition-colors"
        onClick={() => console.log('Add card clicked - will implement in Phase 1')}
      >
        + Add Card
      </button>
    </div>
  );
}
```

### 6.3 Create `components/Card.tsx`

```typescript
'use client';

import { Card as CardType } from '@/types/board';

/**
 * Card - Represents a single task card
 * 
 * Placeholder for Phase 0. Full implementation in Phase 1.
 */
interface CardProps {
  card: CardType;
  index?: number;
  onUpdate?: (cardId: string, updates: Partial<CardType>) => void;
  onDelete?: (cardId: string) => void;
}

export function Card({ card, index = 0, onUpdate, onDelete }: CardProps) {
  return (
    <div className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] 
                    rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="text-sm font-medium text-[var(--color-text)]">
        {card.title}
      </h3>
      {card.description && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {card.description}
        </p>
      )}
      {card.notes.length > 0 && (
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          {card.notes.length} note{card.notes.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
```

### 6.4 Create `components/BoardHeader.tsx`

```typescript
'use client';

import { Board } from '@/types/board';

/**
 * BoardHeader - Header with theme toggle, export, import
 * 
 * Placeholder for Phase 0. Full implementation in Phase 3-4.
 */
interface BoardHeaderProps {
  board: Board;
  onImport?: (board: Board) => void;
}

export function BoardHeader({ board, onImport }: BoardHeaderProps) {
  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Agwakwagan
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {board.id}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => console.log('Theme toggle - will implement in Phase 4')}
            className="px-4 py-2 text-sm border border-[var(--color-border)] 
                       text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)] 
                       transition-colors"
          >
            🌙 Theme
          </button>
          
          <button
            onClick={() => console.log('Export - will implement in Phase 3')}
            className="px-4 py-2 text-sm bg-[var(--color-secondary)] text-white 
                       rounded hover:bg-[var(--color-secondary-hover)] transition-colors"
          >
            Export
          </button>
          
          <button
            onClick={() => console.log('Import - will implement in Phase 3')}
            className="px-4 py-2 text-sm border border-[var(--color-border)] 
                       text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)] 
                       transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </header>
  );
}
```

### 6.5 Update `app/page.tsx`

Replace the contents of `app/page.tsx`:

```typescript
import { KanbanBoard } from '@/components/KanbanBoard';

export default function Home() {
  return <KanbanBoard />;
}
```

---

## Acceptance Criteria

- [ ] All 4 component files created
- [ ] KanbanBoard displays board ID and columns
- [ ] Column shows column title and card count
- [ ] Card component structure defined
- [ ] BoardHeader shows placeholder buttons
- [ ] app/page.tsx uses KanbanBoard
- [ ] All components have 'use client' directive
- [ ] Components compile without errors
- [ ] Visual check: Board renders with 3 columns

---

## Verification

1. Start dev server: `npm run dev`
2. Open browser to http://localhost:3000
3. Should see:
   - "Agwakwagan" title
   - Board ID displayed (board-default)
   - 3 columns: TODO, In Progress, Done
   - Each column shows "0 cards"
   - Header with placeholder buttons

Test localStorage:
1. Open DevTools → Application → LocalStorage
2. Should see key: `agwakwagan-board-default`
3. Value should be JSON with board data

---

## Notes

**Component Hierarchy:**
```
Page
└── KanbanBoard (root)
    ├── BoardHeader (Phase 3-4)
    └── ColumnList (inline in Phase 1, separate later)
        └── Column (multiple)
            └── Card (multiple, Phase 1)
```

**Placeholder Pattern:**
- Minimal rendering for Phase 0
- Console.log for interactions (temporary)
- Structure matches final architecture
- Easy to fill in during Phase 1

**CSS Variables Usage:**
- `bg-[var(--color-bg)]` - Use CSS variables in Tailwind
- Falls back gracefully if variable undefined
- Supports theme switching automatically

---

## Next Task

After completion, proceed to **Phase-0-Task-7-Verification.md**
