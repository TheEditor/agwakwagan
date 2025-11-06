# Agwakwagan - Implementation Phases Document

**Project:** Agwakwagan Kanban Board (Complete Rebuild)  
**Document Type:** Implementation Roadmap  
**Version:** 1.0  
**Created:** November 5, 2025  
**Status:** Planning Phase

---

## Document Purpose

This document defines the **step-by-step build plan** for Agwakwagan, broken into incremental phases. Each phase:
- Produces a working application
- Builds on the previous phase
- Has clear acceptance criteria
- Can be tested independently

This is the **construction schedule** - the tactical plan for implementation.

---

## Overview

### Build Strategy

**Philosophy:** Incremental, testable slices

- **Phase 0:** Project setup (1-2 hours)
- **Phase 1:** Static rendering (3-4 hours)
- **Phase 2:** Drag & drop (4-6 hours)
- **Phase 3:** Persistence (2-3 hours)
- **Phase 4:** Polish & export (3-4 hours)
- **Phase 5:** Undo/redo (4-6 hours) - Post-MVP
- **Phase 6:** Tags & advanced features (8-12 hours) - Post-MVP

**MVP = Phases 0-4** (~13-19 hours)

---

## Phase 0: Project Setup & Foundation

**Goal:** Clean slate with proper architecture foundation  
**Duration:** 1-2 hours  
**Status:** NOT STARTED

### Tasks

#### 0.1 Clean Existing Codebase
- [ ] Remove old component files (keeping only layout structure)
- [ ] Clear unused dependencies from package.json
- [ ] Delete old state management code
- [ ] Keep: Next.js structure, Tailwind config, basic styling

#### 0.2 Install Dependencies
```bash
npm install @hello-pangea/dnd
npm install framer-motion
npm install date-fns  # For date formatting
```

#### 0.3 Setup Type Definitions
Create `types/board.ts`:
```typescript
export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];
}

export interface Note {
  id: string;
  text: string;
  createdAt: Date;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Board {
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
  metadata: BoardMetadata;
}

export interface BoardMetadata {
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnWithCards extends Column {
  cards: Card[];
}
```

#### 0.4 Setup Utility Functions
Create `utils/ids.ts`:
```typescript
export function generateId(type: 'card' | 'column' | 'note'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${type}-${timestamp}-${random}`;
}
```

Create `utils/constants.ts`:
```typescript
import { Board } from '@/types/board';

export const DEFAULT_BOARD: Board = {
  cards: {},
  columns: {
    'col-todo': {
      id: 'col-todo',
      title: 'TODO',
      order: 0
    },
    'col-progress': {
      id: 'col-progress',
      title: 'In Progress',
      order: 1
    },
    'col-done': {
      id: 'col-done',
      title: 'Done',
      order: 2
    }
  },
  columnOrder: ['col-todo', 'col-progress', 'col-done'],
  metadata: {
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

export const STORAGE_KEY = 'agwakwagan-board';
```

#### 0.5 Setup Ozhiaki Theme
Update `globals.css` with CSS variables:
```css
:root {
  /* Ozhiaki Brand Colors */
  --color-primary: #6a0032;        /* CMU Maroon */
  --color-primary-hover: #8b0041;
  --color-secondary: #2d5016;      /* Forest Green */
  --color-secondary-hover: #3a6b1c;
  
  /* Neutrals */
  --color-bg: #ffffff;
  --color-surface: #f5f5f5;
  --color-border: #e0e0e0;
  --color-text: #1a1a1a;
  --color-text-secondary: #6b6b6b;
  
  /* Status Colors */
  --color-success: #2d5016;
  --color-warning: #f59e0b;
  --color-error: #dc2626;
}

.dark {
  --color-primary: #8b0041;
  --color-primary-hover: #6a0032;
  --color-secondary: #3a6b1c;
  --color-secondary-hover: #2d5016;
  
  --color-bg: #1a1a1a;
  --color-surface: #2a2a2a;
  --color-border: #404040;
  --color-text: #e5e5e5;
  --color-text-secondary: #a0a0a0;
}
```

#### 0.6 Create Hook Structure
Create empty hook files:
- `hooks/useBoardState.ts`
- `hooks/useBoardActions.ts`
- `hooks/useBoardSelectors.ts`
- `hooks/useBoard.ts` (composition)
- `hooks/useLocalStorage.ts`

#### 0.7 Create Component Structure
Create empty component files:
- `components/KanbanBoard.tsx`
- `components/Column.tsx`
- `components/Card.tsx`
- `components/BoardHeader.tsx`

### Acceptance Criteria
- [ ] Project compiles without errors
- [ ] Types defined and exported
- [ ] Default board constant available
- [ ] CSS variables applied
- [ ] File structure matches architecture doc
- [ ] No old code remains

### Definition of Done
- [ ] All files created
- [ ] Dependencies installed
- [ ] `npm run dev` works
- [ ] Browser shows blank page (no errors)

---

## Phase 1: Static Rendering

**Goal:** Display columns and cards without drag & drop  
**Duration:** 3-4 hours  
**Prerequisites:** Phase 0 complete

### Tasks

#### 1.1 Implement useLocalStorage Hook
Create `hooks/useLocalStorage.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setIsLoaded(true);
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [value, setStoredValue, isLoaded];
}
```

#### 1.2 Implement useBoardState Hook
Create `hooks/useBoardState.ts`:
```typescript
import { useLocalStorage } from './useLocalStorage';
import { Board } from '@/types/board';
import { DEFAULT_BOARD, STORAGE_KEY } from '@/utils/constants';

export function useBoardState() {
  const [board, setBoard, isLoaded] = useLocalStorage<Board>(
    STORAGE_KEY,
    DEFAULT_BOARD
  );
  
  return { board, setBoard, isLoaded };
}
```

#### 1.3 Implement useBoardSelectors Hook
Create `hooks/useBoardSelectors.ts`:
```typescript
import { useCallback, useMemo } from 'react';
import { Board, Card, Column, ColumnWithCards } from '@/types/board';

export function useBoardSelectors(board: Board) {
  const getColumnCards = useCallback((columnId: string): Card[] => {
    return Object.values(board.cards)
      .filter(card => card.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }, [board.cards]);
  
  const getColumnWithCards = useCallback((columnId: string): ColumnWithCards | null => {
    const column = board.columns[columnId];
    if (!column) return null;
    
    return {
      ...column,
      cards: getColumnCards(columnId)
    };
  }, [board.columns, getColumnCards]);
  
  const getAllColumnsWithCards = useMemo((): ColumnWithCards[] => {
    return board.columnOrder
      .map(colId => getColumnWithCards(colId))
      .filter((col): col is ColumnWithCards => col !== null);
  }, [board.columnOrder, getColumnWithCards]);
  
  return {
    getColumnCards,
    getColumnWithCards,
    getAllColumnsWithCards
  };
}
```

#### 1.4 Implement Basic useBoardActions
Create `hooks/useBoardActions.ts` (partial):
```typescript
import { useCallback } from 'react';
import { Board, Card } from '@/types/board';
import { generateId } from '@/utils/ids';

export function useBoardActions(board: Board, setBoard: (b: Board) => void) {
  const addCard = useCallback((columnId: string, title: string) => {
    const column = board.columns[columnId];
    if (!column) return;

    const cardsInColumn = Object.values(board.cards)
      .filter(c => c.columnId === columnId);
    const maxOrder = Math.max(-1, ...cardsInColumn.map(c => c.order));

    const newCard: Card = {
      id: generateId('card'),
      title: title.trim(),
      columnId,
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: []
    };
    
    setBoard({
      ...board,
      cards: {
        ...board.cards,
        [newCard.id]: newCard
      },
      metadata: {
        ...board.metadata,
        updatedAt: new Date()
      }
    });
  }, [board, setBoard]);
  
  return { addCard };
}
```

#### 1.5 Implement useBoard Composition Hook
Create `hooks/useBoard.ts`:
```typescript
import { useBoardState } from './useBoardState';
import { useBoardActions } from './useBoardActions';
import { useBoardSelectors } from './useBoardSelectors';

export function useBoard() {
  const { board, setBoard, isLoaded } = useBoardState();
  const actions = useBoardActions(board, setBoard);
  const selectors = useBoardSelectors(board);
  
  return {
    board,
    isLoaded,
    ...actions,
    ...selectors
  };
}
```

#### 1.6 Create Card Component
Create `components/Card.tsx`:
```typescript
import { Card as CardType } from '@/types/board';

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  return (
    <div className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="text-sm font-medium text-[var(--color-text)]">
        {card.title}
      </h3>
      {card.description && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {card.description}
        </p>
      )}
    </div>
  );
}
```

#### 1.7 Create Column Component
Create `components/Column.tsx`:
```typescript
import { ColumnWithCards } from '@/types/board';
import { Card } from './Card';

interface ColumnProps {
  column: ColumnWithCards;
  onAddCard: (columnId: string, title: string) => void;
}

export function Column({ column, onAddCard }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle);
      setNewCardTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-80 bg-[var(--color-surface)] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {column.title}
      </h2>
      
      <div className="space-y-2 mb-4">
        {column.cards.map(card => (
          <Card key={card.id} card={card} />
        ))}
      </div>

      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] py-2 px-3 rounded hover:bg-[var(--color-bg)] transition-colors"
        >
          + Add Card
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCard();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            placeholder="Card title..."
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddCard}
              className="px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewCardTitle('');
              }}
              className="px-3 py-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 1.8 Create KanbanBoard Component
Create `components/KanbanBoard.tsx`:
```typescript
import { useBoard } from '@/hooks/useBoard';
import { Column } from './Column';

export function KanbanBoard() {
  const { isLoaded, getAllColumnsWithCards, addCard } = useBoard();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  const columns = getAllColumnsWithCards();

  return (
    <div className="h-screen bg-[var(--color-bg)] overflow-x-auto">
      <div className="flex gap-4 p-6 h-full">
        {columns.map(column => (
          <Column
            key={column.id}
            column={column}
            onAddCard={addCard}
          />
        ))}
      </div>
    </div>
  );
}
```

#### 1.9 Update Main Page
Update `app/page.tsx`:
```typescript
import { KanbanBoard } from '@/components/KanbanBoard';

export default function Home() {
  return <KanbanBoard />;
}
```

### Acceptance Criteria
- [ ] Board displays with 3 default columns
- [ ] Can add cards to any column
- [ ] Cards appear in correct column
- [ ] Cards persist after page reload
- [ ] Clean, styled interface matches Ozhiaki brand

### Definition of Done
- [ ] All components render without errors
- [ ] Add card functionality works
- [ ] Data saves to localStorage
- [ ] Styling matches design guidelines
- [ ] Tested in Chrome, Firefox, Safari

---

## Phase 2: Drag & Drop

**Goal:** Enable card movement between columns  
**Duration:** 4-6 hours  
**Prerequisites:** Phase 1 complete

### Tasks

#### 2.1 Add moveCard Action
Update `hooks/useBoardActions.ts`:
```typescript
const moveCard = useCallback((cardId: string, toColumnId: string, newOrder: number) => {
  const card = board.cards[cardId];
  if (!card) return;

  // Reorder cards in destination column
  const destCards = Object.values(board.cards)
    .filter(c => c.columnId === toColumnId && c.id !== cardId)
    .sort((a, b) => a.order - b.order);

  // Insert at new position
  const updatedCards = { ...board.cards };
  
  // Update moved card
  updatedCards[cardId] = {
    ...card,
    columnId: toColumnId,
    order: newOrder,
    updatedAt: new Date()
  };

  // Reorder other cards
  destCards.forEach((c, index) => {
    const adjustedOrder = index >= newOrder ? index + 1 : index;
    if (c.order !== adjustedOrder) {
      updatedCards[c.id] = {
        ...c,
        order: adjustedOrder,
        updatedAt: new Date()
      };
    }
  });

  setBoard({
    ...board,
    cards: updatedCards,
    metadata: {
      ...board.metadata,
      updatedAt: new Date()
    }
  });
}, [board, setBoard]);
```

#### 2.2 Integrate @hello-pangea/dnd
Update `components/KanbanBoard.tsx`:
```typescript
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useBoard } from '@/hooks/useBoard';
import { Column } from './Column';

export function KanbanBoard() {
  const { isLoaded, getAllColumnsWithCards, addCard, moveCard } = useBoard();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside valid area
    if (!destination) return;

    // Dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveCard(draggableId, destination.droppableId, destination.index);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  const columns = getAllColumnsWithCards();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen bg-[var(--color-bg)] overflow-x-auto">
        <div className="flex gap-4 p-6 h-full">
          {columns.map(column => (
            <Column
              key={column.id}
              column={column}
              onAddCard={addCard}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
```

#### 2.3 Make Column Droppable
Update `components/Column.tsx`:
```typescript
import { Droppable } from '@hello-pangea/dnd';
import { ColumnWithCards } from '@/types/board';
import { Card } from './Card';
import { useState } from 'react';

interface ColumnProps {
  column: ColumnWithCards;
  onAddCard: (columnId: string, title: string) => void;
}

export function Column({ column, onAddCard }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle);
      setNewCardTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-80 bg-[var(--color-surface)] rounded-lg p-4 flex flex-col">
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {column.title}
      </h2>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 mb-4 min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            {column.cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add card section same as before */}
    </div>
  );
}
```

#### 2.4 Make Card Draggable
Update `components/Card.tsx`:
```typescript
import { Draggable } from '@hello-pangea/dnd';
import { Card as CardType } from '@/types/board';

interface CardProps {
  card: CardType;
  index: number;
}

export function Card({ card, index }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            snapshot.isDragging ? 'opacity-50 rotate-2' : ''
          }`}
        >
          <h3 className="text-sm font-medium text-[var(--color-text)]">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {card.description}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
```

### Acceptance Criteria
- [ ] Cards can be dragged within same column
- [ ] Cards can be dragged to different columns
- [ ] Visual feedback during drag (opacity, hover states)
- [ ] Drop position indicated clearly
- [ ] Order updates persist after page reload
- [ ] Smooth animations

### Definition of Done
- [ ] Drag and drop works in all browsers
- [ ] No visual glitches
- [ ] Performance smooth with 20+ cards
- [ ] Keyboard drag works (Space to grab, arrows to move)

---

## Phase 3: Data Persistence & Management

**Goal:** Robust data handling, export/import  
**Duration:** 2-3 hours  
**Prerequisites:** Phase 2 complete

### Tasks

#### 3.1 Add Delete Card Action
Update `hooks/useBoardActions.ts`:
```typescript
const deleteCard = useCallback((cardId: string) => {
  const { [cardId]: removed, ...remainingCards } = board.cards;
  
  setBoard({
    ...board,
    cards: remainingCards,
    metadata: {
      ...board.metadata,
      updatedAt: new Date()
    }
  });
}, [board, setBoard]);
```

#### 3.2 Add Update Card Action
```typescript
const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
  const card = board.cards[cardId];
  if (!card) return;

  setBoard({
    ...board,
    cards: {
      ...board.cards,
      [cardId]: {
        ...card,
        ...updates,
        updatedAt: new Date()
      }
    },
    metadata: {
      ...board.metadata,
      updatedAt: new Date()
    }
  });
}, [board, setBoard]);
```

#### 3.3 Add Export Functionality
Create `utils/export.ts`:
```typescript
import { Board } from '@/types/board';

export function exportBoard(board: Board): void {
  const dataStr = JSON.stringify(board, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `agwakwagan-board-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

#### 3.4 Add Import Functionality
```typescript
export function importBoard(file: File): Promise<Board> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const board = JSON.parse(result) as Board;
        
        // Validate board structure
        if (!board.cards || !board.columns || !board.columnOrder) {
          throw new Error('Invalid board format');
        }
        
        resolve(board);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
```

#### 3.5 Create BoardHeader Component
Create `components/BoardHeader.tsx`:
```typescript
import { useRef } from 'react';
import { Board } from '@/types/board';
import { exportBoard, importBoard } from '@/utils/export';

interface BoardHeaderProps {
  onImport: (board: Board) => void;
  board: Board;
}

export function BoardHeader({ onImport, board }: BoardHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportBoard(board);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedBoard = await importBoard(file);
      
      if (confirm('This will replace your current board. Continue?')) {
        onImport(importedBoard);
      }
    } catch (error) {
      alert('Failed to import board. Please check the file format.');
      console.error(error);
    }
    
    // Reset input
    e.target.value = '';
  };

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Agwakwagan
        </h1>
        
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-[var(--color-secondary)] text-white rounded hover:bg-[var(--color-secondary-hover)] transition-colors"
          >
            Export
          </button>
          
          <button
            onClick={handleImportClick}
            className="px-4 py-2 text-sm border border-[var(--color-border)] text-[var(--color-text)] rounded hover:bg-[var(--color-surface)] transition-colors"
          >
            Import
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}
```

#### 3.6 Integrate Header into KanbanBoard
Update `components/KanbanBoard.tsx`:
```typescript
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useBoard } from '@/hooks/useBoard';
import { Column } from './Column';
import { BoardHeader } from './BoardHeader';

export function KanbanBoard() {
  const { board, isLoaded, getAllColumnsWithCards, addCard, moveCard, setBoard } = useBoard();

  // ... handleDragEnd same as before

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  const columns = getAllColumnsWithCards();

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <BoardHeader board={board} onImport={setBoard} />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-6 h-full">
            {columns.map(column => (
              <Column
                key={column.id}
                column={column}
                onAddCard={addCard}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
```

### Acceptance Criteria
- [ ] Can export board as JSON file
- [ ] Can import previously exported board
- [ ] Import validates file format
- [ ] Import shows confirmation dialog
- [ ] All data preserved in export/import cycle
- [ ] Can delete cards

### Definition of Done
- [ ] Export/import tested with multiple boards
- [ ] File validation catches corrupt files
- [ ] No data loss in round-trip
- [ ] User feedback for all operations

---

## Phase 4: Polish & MVP Completion

**Goal:** Theme switching, inline editing, UX polish  
**Duration:** 3-4 hours  
**Prerequisites:** Phase 3 complete

### Tasks

#### 4.1 Add Theme Toggle
Create `hooks/useTheme.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return { theme, toggleTheme };
}
```

Update `components/BoardHeader.tsx` to include theme toggle:
```typescript
// Add this button to the header
<button
  onClick={toggleTheme}
  className="p-2 rounded hover:bg-[var(--color-surface)] transition-colors"
  title="Toggle theme"
>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

#### 4.2 Add Card Expansion
Update `components/Card.tsx`:
```typescript
import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card as CardType } from '@/types/board';

interface CardProps {
  card: CardType;
  index: number;
  onUpdate?: (cardId: string, updates: Partial<CardType>) => void;
  onDelete?: (cardId: string) => void;
}

export function Card({ card, index, onUpdate, onDelete }: CardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');

  const handleSave = () => {
    if (editTitle.trim() && onUpdate) {
      onUpdate(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => !isEditing && setIsExpanded(!isExpanded)}
          className={`bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            snapshot.isDragging ? 'opacity-50 rotate-2' : ''
          }`}
        >
          {!isEditing ? (
            <>
              <h3 className="text-sm font-medium text-[var(--color-text)]">
                {card.title}
              </h3>
              
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {card.description && (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {card.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className="text-xs text-[var(--color-primary)] hover:underline"
                    >
                      Edit
                    </button>
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this card?')) {
                            onDelete(card.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div onClick={(e) => e.stopPropagation()} className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-[var(--color-border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description..."
                rows={3}
                className="w-full px-2 py-1 text-xs border border-[var(--color-border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-2 py-1 text-xs bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditTitle(card.title);
                    setEditDescription(card.description || '');
                    setIsEditing(false);
                  }}
                  className="px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
```

#### 4.3 Add Save Indicator
Create `components/SaveStatus.tsx`:
```typescript
import { useEffect, useState } from 'react';

interface SaveStatusProps {
  lastSaved: Date;
}

export function SaveStatus({ lastSaved }: SaveStatusProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [lastSaved]);

  if (!showSaved) return null;

  return (
    <div className="fixed bottom-4 right-4 px-4 py-2 bg-[var(--color-success)] text-white rounded shadow-lg text-sm">
      ✓ Saved
    </div>
  );
}
```

Add to KanbanBoard:
```typescript
<SaveStatus lastSaved={board.metadata.updatedAt} />
```

### Acceptance Criteria
- [ ] Theme toggle works (light/dark)
- [ ] Theme preference persists
- [ ] Cards can be edited inline
- [ ] Cards can be deleted with confirmation
- [ ] Save indicator appears after changes
- [ ] All interactions feel polished

### Definition of Done
- [ ] Theme switching smooth, no flicker
- [ ] Inline editing doesn't interfere with drag
- [ ] Delete confirmation prevents accidents
- [ ] Save feedback visible but not intrusive
- [ ] Full manual test of all features

---

## Phase 5: Undo/Redo (Post-MVP)

**Goal:** Add undo/redo functionality  
**Duration:** 4-6 hours  
**Prerequisites:** Phase 4 complete

### High-Level Tasks
1. Implement `useBoardUndo` hook with history stack
2. Wrap all actions to push to history
3. Add keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
4. Add undo/redo buttons to header
5. Show toast feedback ("Undid: Move card")
6. Limit history to last 50 actions
7. Test edge cases (undo after import, etc.)

---

## Phase 6: Tags & Advanced Features (Post-MVP)

**Goal:** Add tagging system  
**Duration:** 8-12 hours  
**Prerequisites:** Phase 5 complete

### High-Level Tasks
1. Extend data model with tags
2. Create tag manager UI
3. Add tag selector to cards
4. Implement tag filtering
5. Add tag colors/styling
6. Tag persistence in export/import

---

## Testing Strategy

### Per Phase
- Manual testing of new features
- Regression testing of previous features
- Browser compatibility check (Chrome, Firefox, Safari)

### Before MVP Release
- Comprehensive manual test of all user flows
- Performance test with 100+ cards
- Data integrity test (export/import round-trip)
- Accessibility test (keyboard-only navigation)
- Cross-browser testing

### Optional (Later)
- Unit tests for hooks (Jest)
- Component tests (React Testing Library)
- E2E tests (Playwright)

---

## Success Criteria

**MVP Complete When:**
- ✅ Can manage 50+ card project comfortably
- ✅ Zero data loss over 1 week of use
- ✅ All core actions in <3 clicks
- ✅ Keyboard users can do everything
- ✅ Export/import preserves all data
- ✅ Feels fast and responsive

**Each Phase Complete When:**
- ✅ All acceptance criteria met
- ✅ No regressions from previous phases
- ✅ Definition of done checklist complete
- ✅ Tested in all target browsers

---

## Risk Management

**Potential Blockers:**
- LocalStorage size limits → Solution: Monitor size, warn user, offer IndexedDB migration
- Drag & drop library issues → Solution: Have backup plan (custom implementation)
- Complex state updates → Solution: Unit test actions thoroughly

**Mitigation:**
- Test continuously, don't accumulate bugs
- Keep phases small and shippable
- Have rollback plan (git branches per phase)

---

**End of Implementation Phases Document**

Follow this roadmap step-by-step. Each phase should produce a working, testable application.
