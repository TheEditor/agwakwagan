# Agwakwagan UI Implementation Files - Part 2

## Hooks and Utilities

### 5. Drag and Drop Hook

**File: `app/hooks/useDragAndDrop.ts`**

```typescript
import { useState, useCallback, useRef } from 'react';

interface DragState {
  draggedCardId: string | null;
  draggedFromColumn: string | null;
  dragOverColumn: string | null;
  dragOverIndex: number | null;
  dropIndicatorIndex: number | null;
}

export function useDragAndDrop(
  onCardMove: (cardId: string, targetColumnId: string, targetIndex: number) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    draggedCardId: null,
    draggedFromColumn: null,
    dragOverColumn: null,
    dragOverIndex: null,
    dropIndicatorIndex: null,
  });

  const dragImageRef = useRef<HTMLDivElement | null>(null);
  const lastDragOverTime = useRef<number>(0);

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string, columnId: string) => {
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceColumn', columnId);
    
    setDragState({
      draggedCardId: cardId,
      draggedFromColumn: columnId,
      dragOverColumn: null,
      dragOverIndex: null,
      dropIndicatorIndex: null,
    });
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState.draggedCardId) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverColumn: columnId,
    }));
  }, [dragState.draggedCardId]);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string, totalCards: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Throttle drag over events for performance
    const now = Date.now();
    if (now - lastDragOverTime.current < 50) return;
    lastDragOverTime.current = now;
    
    if (!dragState.draggedCardId) return;
    
    e.dataTransfer.dropEffect = 'move';
    
    // Calculate drop position based on mouse position
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Find all card elements in this column
    const cards = container.querySelectorAll('.card');
    let dropIndex = totalCards; // Default to end
    
    // Find insertion point between cards
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const cardRect = card.getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2;
      
      if (e.clientY < cardMiddle) {
        dropIndex = i;
        break;
      }
    }
    
    setDragState(prev => ({
      ...prev,
      dragOverColumn: columnId,
      dragOverIndex: dropIndex,
      dropIndicatorIndex: dropIndex,
    }));
  }, [dragState.draggedCardId]);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    
    if (!cardId || !columnId) return;
    
    const dropIndex = dragState.dropIndicatorIndex ?? 0;
    
    // Don't do anything if dropping in same position
    if (sourceColumn === columnId && dragState.dragOverIndex === dropIndex) {
      handleDragEnd();
      return;
    }
    
    // Execute the move
    onCardMove(cardId, columnId, dropIndex);
    
    // Reset state
    handleDragEnd();
  }, [dragState.dropIndicatorIndex, dragState.dragOverIndex, onCardMove]);

  const handleDragEnd = useCallback(() => {
    // Cleanup
    if (dragImageRef.current && document.body.contains(dragImageRef.current)) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }
    
    setDragState({
      draggedCardId: null,
      draggedFromColumn: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dropIndicatorIndex: null,
    });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, columnId: string) => {
    // Only reset if truly leaving the column
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragState(prev => ({
        ...prev,
        dragOverColumn: prev.dragOverColumn === columnId ? null : prev.dragOverColumn,
        dropIndicatorIndex: prev.dragOverColumn === columnId ? null : prev.dropIndicatorIndex,
      }));
    }
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleDragLeave,
  };
}
```

### 6. Board State Hook

**File: `app/hooks/useBoard.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Board, Card } from '@/types/board';
import { LocalStorageDataSource } from '@/lib/datasources/localStorage';
import { generateId } from '@/utils/ids';

const dataSource = new LocalStorageDataSource();

export function useBoard(boardId: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load board
  const loadBoard = useCallback(async () => {
    try {
      setLoading(true);
      const loadedBoard = await dataSource.loadBoard(boardId);
      setBoard(loadedBoard);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
      console.error('Failed to load board:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Save board
  const saveBoard = useCallback(async (updatedBoard: Board) => {
    try {
      await dataSource.saveBoard(updatedBoard);
      setBoard(updatedBoard);
    } catch (err) {
      console.error('Failed to save board:', err);
      throw err;
    }
  }, []);

  // Move card
  const moveCard = useCallback(async (
    cardId: string,
    targetColumnId: string,
    targetIndex: number
  ) => {
    if (!board) return;

    const newBoard = { ...board };
    const card = newBoard.cards[cardId];
    
    if (!card) {
      console.error('Card not found:', cardId);
      return;
    }

    // Get cards in target column
    const targetCards = Object.values(newBoard.cards)
      .filter(c => c.columnId === targetColumnId && c.id !== cardId)
      .sort((a, b) => a.order - b.order);

    // Update card's column
    card.columnId = targetColumnId;
    card.updatedAt = new Date();

    // Reorder cards in target column
    targetCards.splice(targetIndex, 0, card);
    targetCards.forEach((c, index) => {
      c.order = index;
    });

    newBoard.metadata.updatedAt = new Date();
    
    await saveBoard(newBoard);
  }, [board, saveBoard]);

  // Add card
  const addCard = useCallback(async (
    columnId: string,
    title: string,
    description?: string
  ) => {
    if (!board) return;

    const newBoard = { ...board };
    
    // Get cards in column to determine order
    const cardsInColumn = Object.values(newBoard.cards)
      .filter(c => c.columnId === columnId);
    const maxOrder = Math.max(0, ...cardsInColumn.map(c => c.order));

    const now = new Date();
    const newCard: Card = {
      id: generateId('card'),
      title,
      description,
      columnId,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
      notes: [],
    };

    newBoard.cards[newCard.id] = newCard;
    newBoard.metadata.updatedAt = now;

    await saveBoard(newBoard);
  }, [board, saveBoard]);

  // Update card
  const updateCard = useCallback(async (
    cardId: string,
    updates: Partial<Card>
  ) => {
    if (!board) return;

    const newBoard = { ...board };
    const card = newBoard.cards[cardId];
    
    if (!card) {
      console.error('Card not found:', cardId);
      return;
    }

    Object.assign(card, updates, { updatedAt: new Date() });
    newBoard.metadata.updatedAt = new Date();

    await saveBoard(newBoard);
  }, [board, saveBoard]);

  // Delete card
  const deleteCard = useCallback(async (cardId: string) => {
    if (!board) return;

    const newBoard = { ...board };
    delete newBoard.cards[cardId];
    newBoard.metadata.updatedAt = new Date();

    await saveBoard(newBoard);
  }, [board, saveBoard]);

  return {
    board,
    loading,
    error,
    moveCard,
    addCard,
    updateCard,
    deleteCard,
    reload: loadBoard,
  };
}
```

### 7. Global Styles

**File: `app/styles/globals.css`**

```css
/* Ozhiaki Brand Design System */

:root {
  /* Brand Colors */
  --maroon: #6D2E42;
  --forest: #0A3622;
  --earth: #3E2723;
  --cedar: #8B3A3A;
  --sky: #4A6FA5;
  --sage: #7A8B7F;
  --birch: #F5E6D3;
  --snow: #FAFAFA;
  
  /* Functional Colors */
  --bg-primary: #FAFAFA;
  --bg-secondary: #F5E6D3;
  --bg-card: #FFFFFF;
  --bg-hover: rgba(245, 230, 211, 0.5);
  
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  --text-muted: #787878;
  
  --border-default: #E8E8E8;
  --border-focus: #6D2E42;
  
  /* Typography */
  --font-display: 'Crimson Pro', 'Iowan Old Style', 'Palatino', serif;
  --font-body: 'Fira Code', 'Cascadia Code', 'SF Mono', monospace;
  --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  
  /* Animation */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A1A;
    --bg-secondary: #2D2D2D;
    --bg-card: #2D2D2D;
    --bg-hover: rgba(62, 39, 35, 0.5);
    
    --text-primary: #FAFAFA;
    --text-secondary: #E8E8E8;
    --text-muted: #787878;
    
    --border-default: #4A4A4A;
    --border-focus: #8B3A3A;
  }
}

/* Font Imports */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Fira+Code:wght@400;500;600&display=swap');

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: 1.5;
  overflow: hidden;
}

/* Focus Styles */
:focus-visible {
  outline: 2px solid var(--maroon);
  outline-offset: 2px;
}

/* Selection */
::selection {
  background: rgba(109, 46, 66, 0.2);
  color: var(--text-primary);
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--sage);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--maroon);
}

/* Utility Classes */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

/* Drag Ghost Styling */
.drag-ghost {
  background: var(--bg-card) !important;
  border-radius: 8px !important;
  box-shadow: var(--shadow-xl) !important;
  transform: rotate(5deg) !important;
  opacity: 0.9 !important;
}
```

### 8. Layout Wrapper

**File: `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'Agwakwagan - Kanban Board',
  description: 'Professional kanban board with Ozhiaki identity',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6D2E42" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 9. Main Page

**File: `app/page.tsx`**

```tsx
'use client';

import { KanbanBoard } from '@/components/Board/KanbanBoard';

export default function Home() {
  // Use default board for now
  const boardId = 'board-default';
  
  return <KanbanBoard boardId={boardId} />;
}
```

### 10. Package Updates

**File: `package.json` (additions)**

```json
{
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "date-fns": "^2.30.0",
    "react-window": "^1.8.10"
  }
}
```

## Testing Guide

### Manual Testing Checklist

#### Drag & Drop
- [ ] Cards drag smoothly with visual feedback
- [ ] Drop indicator shows correct insertion point
- [ ] Cards can move between columns
- [ ] Cards can reorder within column
- [ ] Dragging outside cancels properly
- [ ] Custom drag ghost appears

#### Visual Design
- [ ] Ozhiaki colors display correctly
- [ ] Fonts load (Crimson Pro + Fira Code)
- [ ] Animations play smoothly
- [ ] Hover effects work
- [ ] Dark mode switches properly
- [ ] External cards show lightning icon

#### Interactions
- [ ] Add card form appears/dismisses
- [ ] ESC key cancels operations
- [ ] Tab navigation works
- [ ] Focus states visible
- [ ] Cards are keyboard accessible

#### Performance
- [ ] No lag when dragging
- [ ] Smooth scrolling
- [ ] Quick card operations
- [ ] Responsive to input

### Browser Testing
- Chrome/Edge (primary)
- Firefox
- Safari
- Test at 1440px, 1024px, 768px widths

### Accessibility Audit
- Run axe DevTools
- Test with NVDA/JAWS
- Check color contrast
- Verify keyboard navigation
- Test with reduced motion

## Deployment Notes

1. **Install dependencies:**
```bash
npm install @emotion/react @emotion/styled date-fns react-window
```

2. **Clear old UI code** that conflicts with new design

3. **Update TypeScript config** if needed for Emotion

4. **Test build:**
```bash
npm run build
npm run start
```

5. **Verify all fonts load** from Google Fonts

6. **Check API compatibility** with new card structure

## Future Enhancements

- Card detail modal with full editing
- Bulk operations (select multiple cards)
- Search/filter functionality
- Board templates
- Export to JSON/CSV
- Real-time collaboration indicators
- Activity feed
- Customizable columns
- Tags and labels system
- Time tracking per card
