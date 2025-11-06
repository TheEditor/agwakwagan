# Phase 1 - Task 1: Implement AddCard Action

**Task ID:** P1-T1  
**Estimated Time:** 45-60 minutes  
**Dependencies:** Phase 0 complete  
**Focus:** Business logic for creating cards

---

## Context

Currently `useBoardActions` has placeholder functions. We need to implement the real `addCard` action that:
1. Generates a unique card ID
2. Calculates correct order in column
3. Creates card object with all required fields
4. Updates board state immutably
5. Triggers automatic save via storage adapter

This is the foundation of the kanban board - without this, users can't add tasks.

---

## Objectives

1. Implement `addCard` function with full logic
2. Handle edge cases (empty columns, validation)
3. Use immutable update patterns
4. Ensure automatic persistence works

---

## Tasks

### 1.1 Update `hooks/useBoardActions.ts`

**Replace the entire file contents:**

```typescript
'use client';

import { useCallback } from 'react';
import { Board, Card, Note } from '@/types/board';
import { generateId } from '@/utils/ids';

/**
 * Board Actions Hook
 * 
 * Contains all business logic for board mutations.
 * All functions return void and update board via setBoard.
 */
export function useBoardActions(
  board: Board | null,
  setBoard: (board: Board) => void
) {
  /**
   * Add a new card to a column
   * 
   * @param columnId - Target column ID
   * @param title - Card title (required, 1-500 chars)
   * @param description - Optional card description
   */
  const addCard = useCallback((
    columnId: string,
    title: string,
    description?: string
  ) => {
    if (!board) {
      console.error('Cannot add card: board not loaded');
      return;
    }

    // Validate column exists
    if (!board.columns[columnId]) {
      console.error(`Cannot add card: column ${columnId} does not exist`);
      return;
    }

    // Validate title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      console.error('Cannot add card: title is required');
      return;
    }

    if (trimmedTitle.length > 500) {
      console.error('Cannot add card: title exceeds 500 characters');
      return;
    }

    // Calculate next order number in this column
    const cardsInColumn = Object.values(board.cards).filter(
      card => card.columnId === columnId
    );
    
    const maxOrder = cardsInColumn.length > 0
      ? Math.max(...cardsInColumn.map(c => c.order))
      : -1;
    
    const nextOrder = maxOrder + 1;

    // Create new card
    const newCard: Card = {
      id: generateId('card'),
      title: trimmedTitle,
      description: description?.trim() || undefined,
      columnId,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: []
    };

    // Update board state immutably
    const updatedBoard: Board = {
      ...board,
      cards: {
        ...board.cards,
        [newCard.id]: newCard
      },
      metadata: {
        ...board.metadata,
        updatedAt: new Date()
      }
    };

    setBoard(updatedBoard);
  }, [board, setBoard]);

  /**
   * Move a card to a different column or position
   * Placeholder - will implement in Phase 2
   */
  const moveCard = useCallback((
    cardId: string,
    toColumnId: string,
    newOrder: number
  ) => {
    console.log('moveCard will be implemented in Phase 2');
  }, [board, setBoard]);

  /**
   * Update card properties
   * Placeholder - will implement in Phase 3
   */
  const updateCard = useCallback((
    cardId: string,
    updates: Partial<Card>
  ) => {
    console.log('updateCard will be implemented in Phase 3');
  }, [board, setBoard]);

  /**
   * Delete a card
   * Placeholder - will implement in Phase 3
   */
  const deleteCard = useCallback((cardId: string) => {
    console.log('deleteCard will be implemented in Phase 3');
  }, [board, setBoard]);

  /**
   * Add a note to a card
   * Placeholder - will implement in Phase 3
   */
  const addNote = useCallback((cardId: string, noteText: string) => {
    console.log('addNote will be implemented in Phase 3');
  }, [board, setBoard]);

  /**
   * Delete a note from a card
   * Placeholder - will implement in Phase 3
   */
  const deleteNote = useCallback((cardId: string, noteId: string) => {
    console.log('deleteNote will be implemented in Phase 3');
  }, [board, setBoard]);

  /**
   * Add a new column
   * Placeholder - will implement in Phase 3
   */
  const addColumn = useCallback((title: string) => {
    console.log('addColumn will be implemented in Phase 3');
  }, [board, setBoard]);

  /**
   * Delete a column and all its cards
   * Placeholder - will implement in Phase 3
   */
  const deleteColumn = useCallback((columnId: string) => {
    console.log('deleteColumn will be implemented in Phase 3');
  }, [board, setBoard]);

  return {
    addCard,
    moveCard,
    updateCard,
    deleteCard,
    addNote,
    deleteNote,
    addColumn,
    deleteColumn
  };
}
```

---

## Key Implementation Details

### 1. Validation

**Three validation checks:**
```typescript
// 1. Board loaded
if (!board) return;

// 2. Column exists
if (!board.columns[columnId]) return;

// 3. Title valid (non-empty, not too long)
const trimmedTitle = title.trim();
if (!trimmedTitle || trimmedTitle.length > 500) return;
```

### 2. Order Calculation

**Find highest order number in column, add 1:**
```typescript
const cardsInColumn = Object.values(board.cards).filter(
  card => card.columnId === columnId
);

const maxOrder = cardsInColumn.length > 0
  ? Math.max(...cardsInColumn.map(c => c.order))
  : -1;

const nextOrder = maxOrder + 1;
```

**Why -1 default?** First card becomes order 0.

### 3. Immutable Update Pattern

**Never mutate - always create new objects:**
```typescript
const updatedBoard: Board = {
  ...board,                    // Spread existing board
  cards: {
    ...board.cards,            // Spread existing cards
    [newCard.id]: newCard      // Add new card
  },
  metadata: {
    ...board.metadata,         // Spread metadata
    updatedAt: new Date()      // Update timestamp
  }
};
```

**Why immutable?**
- React detects changes correctly
- Enables undo/redo (future)
- Prevents bugs from shared references

### 4. Automatic Persistence

**No explicit save needed!**
```typescript
setBoard(updatedBoard);  // This triggers useStorageAdapter.saveBoard()
```

The storage adapter in `useBoardState` automatically saves when `setBoard` is called.

---

## Testing

### Manual Test in Browser Console

```javascript
// After implementing, test in console:

// 1. Add card to TODO column
const addBtn = document.querySelector('button');
addBtn.click();

// 2. Type in input
const input = document.querySelector('input');
input.value = 'Test Card';
input.dispatchEvent(new Event('change', { bubbles: true }));

// 3. Submit
// Press Enter or click Add button

// 4. Check LocalStorage
console.log(JSON.parse(localStorage.getItem('agwakwagan-board-default')));
// Should see new card in cards object
```

### Unit Test Pattern (Optional)

```typescript
// Example unit test structure
import { renderHook, act } from '@testing-library/react';
import { useBoardActions } from './useBoardActions';

test('addCard creates card with correct properties', () => {
  const mockBoard = {
    id: 'test-board',
    cards: {},
    columns: { 'col-1': { id: 'col-1', title: 'Test', order: 0 } },
    columnOrder: ['col-1'],
    metadata: { version: '1.0', createdAt: new Date(), updatedAt: new Date() }
  };
  
  const mockSetBoard = jest.fn();
  
  const { result } = renderHook(() => 
    useBoardActions(mockBoard, mockSetBoard)
  );
  
  act(() => {
    result.current.addCard('col-1', 'Test Card');
  });
  
  expect(mockSetBoard).toHaveBeenCalled();
  const updatedBoard = mockSetBoard.mock.calls[0][0];
  
  const newCard = Object.values(updatedBoard.cards)[0];
  expect(newCard.title).toBe('Test Card');
  expect(newCard.columnId).toBe('col-1');
  expect(newCard.order).toBe(0);
});
```

---

## Acceptance Criteria

- [ ] File updated with full addCard implementation
- [ ] TypeScript compiles without errors
- [ ] Validation works (empty title rejected, long title rejected)
- [ ] Order calculation correct (first card = 0, second = 1, etc.)
- [ ] Immutable updates (no mutations)
- [ ] Board metadata.updatedAt updates
- [ ] Console errors logged appropriately
- [ ] useCallback dependencies correct

---

## Verification Steps

1. **TypeScript Check:**
   ```bash
   npx tsc --noEmit
   ```
   Should have 0 errors.

2. **Import Test:**
   Add to `app/page.tsx` temporarily:
   ```typescript
   import { useBoardActions } from '@/hooks/useBoardActions';
   ```
   Should import without errors.

3. **Build Check:**
   ```bash
   npm run build
   ```
   Should succeed.

---

## Common Issues

### Issue: "Cannot read property 'cards' of null"
**Fix:** Check `if (!board) return;` at start of addCard

### Issue: Order numbers wrong
**Fix:** Verify filter by columnId before calculating max order

### Issue: Cards not persisting
**Fix:** Check setBoard actually called with updated board

### Issue: TypeScript errors on Card object
**Fix:** Ensure all required Card fields present (id, title, columnId, order, dates, notes)

---

## Next Task

After completion, proceed to **Phase-1-Task-2-Implement-Selectors.md**

The addCard action is now ready, but we need selectors to query and display the cards efficiently.
