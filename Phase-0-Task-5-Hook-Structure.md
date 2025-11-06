# Phase 0 - Task 5: Hook Structure (with Storage Adapter)

**Task ID:** P0-T5  
**Estimated Time:** 15 minutes  
**Dependencies:** P0-T2 (Types), P0-T3 (Utils)

---

## Context

Create the hook architecture for state management. This follows a separated concerns pattern:
- **useBoardState** - Storage and raw state
- **useBoardActions** - Business logic (mutations)
- **useBoardSelectors** - Derived data (queries)
- **useBoard** - Composition layer
- **useStorageAdapter** - ⭐ Abstraction for storage backend (agent-ready)

This separation makes testing easier and Phase 7 API integration straightforward.

---

## Objectives

1. Create storage adapter interface (swappable backends)
2. Create localStorage hook
3. Create state management hooks (placeholders for now)
4. Set up hook composition pattern

---

## Tasks

### 5.1 Create `hooks/useStorageAdapter.ts` ⭐

**This is agent-ready architecture - makes Phase 7 much easier**

Create file at: `hooks/useStorageAdapter.ts`

```typescript
import { Board } from '@/types/board';
import { DEFAULT_BOARD } from '@/utils/constants';

/**
 * Storage Adapter Interface
 * 
 * This abstraction allows swapping storage backends without
 * changing business logic. Phase 0-6 use localStorage,
 * Phase 7+ can use API backend.
 */
export interface StorageAdapter {
  /**
   * Load board data by ID
   * @param boardId - Board identifier
   * @returns Promise resolving to Board data
   */
  loadBoard(boardId: string): Promise<Board>;
  
  /**
   * Save board data
   * @param board - Complete board state
   */
  saveBoard(board: Board): Promise<void>;
  
  /**
   * Subscribe to external changes (optional)
   * Useful for real-time sync in Phase 7+
   */
  subscribeToChanges?(callback: (board: Board) => void): () => void;
}

/**
 * LocalStorage implementation of StorageAdapter
 * Used for Phase 0-6 (client-side only)
 */
export function useLocalStorageAdapter(): StorageAdapter {
  return {
    loadBoard: async (boardId: string): Promise<Board> => {
      try {
        const key = `agwakwagan-${boardId}`;
        const data = localStorage.getItem(key);
        
        if (!data) {
          // No saved board, return default with correct ID
          return { ...DEFAULT_BOARD, id: boardId };
        }
        
        // Parse and hydrate dates
        const board = JSON.parse(data) as Board;
        
        // Convert date strings back to Date objects
        board.metadata.createdAt = new Date(board.metadata.createdAt);
        board.metadata.updatedAt = new Date(board.metadata.updatedAt);
        
        Object.values(board.cards).forEach(card => {
          card.createdAt = new Date(card.createdAt);
          card.updatedAt = new Date(card.updatedAt);
          card.notes.forEach(note => {
            note.createdAt = new Date(note.createdAt);
          });
        });
        
        return board;
      } catch (error) {
        console.error('Error loading board from localStorage:', error);
        // Return default board on error
        return { ...DEFAULT_BOARD, id: boardId };
      }
    },
    
    saveBoard: async (board: Board): Promise<void> => {
      try {
        const key = `agwakwagan-${board.id}`;
        const serialized = JSON.stringify(board);
        localStorage.setItem(key, serialized);
      } catch (error) {
        console.error('Error saving board to localStorage:', error);
        // Check if quota exceeded
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('LocalStorage quota exceeded. Consider export/import or IndexedDB migration.');
        }
        throw error;
      }
    }
  };
}

/**
 * API implementation of StorageAdapter
 * To be implemented in Phase 7
 * 
 * Example usage:
 * export function useApiStorageAdapter(apiKey: string): StorageAdapter {
 *   return {
 *     loadBoard: async (boardId) => {
 *       const response = await fetch(`/api/boards/${boardId}`, {
 *         headers: { 'Authorization': `Bearer ${apiKey}` }
 *       });
 *       return response.json();
 *     },
 *     saveBoard: async (board) => {
 *       await fetch(`/api/boards/${board.id}`, {
 *         method: 'PUT',
 *         headers: {
 *           'Authorization': `Bearer ${apiKey}`,
 *           'Content-Type': 'application/json'
 *         },
 *         body: JSON.stringify(board)
 *       });
 *     },
 *     subscribeToChanges: (callback) => {
 *       // WebSocket or SSE implementation
 *     }
 *   };
 * }
 */
```

### 5.2 Create `hooks/useBoardState.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Board } from '@/types/board';
import { useLocalStorageAdapter } from './useStorageAdapter';

/**
 * Board State Hook
 * 
 * Manages board data and persistence via storage adapter.
 * No business logic here - just state and storage.
 */
export function useBoardState(boardId: string = 'board-default') {
  const adapter = useLocalStorageAdapter();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load board on mount
  useEffect(() => {
    adapter.loadBoard(boardId).then(loadedBoard => {
      setBoard(loadedBoard);
      setIsLoaded(true);
    });
  }, [boardId]);

  // Save board whenever it changes
  const saveBoardToStorage = useCallback((newBoard: Board) => {
    setBoard(newBoard);
    adapter.saveBoard(newBoard).catch(error => {
      console.error('Failed to save board:', error);
    });
  }, [adapter]);

  return {
    board,
    setBoard: saveBoardToStorage,
    isLoaded
  };
}
```

### 5.3 Create `hooks/useBoardActions.ts`

```typescript
'use client';

import { useCallback } from 'react';
import { Board } from '@/types/board';

/**
 * Board Actions Hook
 * 
 * Contains all business logic for mutations.
 * Placeholder for now - will be implemented in Phase 1.
 */
export function useBoardActions(board: Board | null, setBoard: (board: Board) => void) {
  // Placeholder actions - will implement in Phase 1
  const addCard = useCallback((columnId: string, title: string) => {
    console.log('addCard will be implemented in Phase 1');
  }, [board, setBoard]);

  const moveCard = useCallback((cardId: string, toColumnId: string, newOrder: number) => {
    console.log('moveCard will be implemented in Phase 2');
  }, [board, setBoard]);

  const updateCard = useCallback((cardId: string, updates: Partial<any>) => {
    console.log('updateCard will be implemented in Phase 3');
  }, [board, setBoard]);

  const deleteCard = useCallback((cardId: string) => {
    console.log('deleteCard will be implemented in Phase 3');
  }, [board, setBoard]);

  return {
    addCard,
    moveCard,
    updateCard,
    deleteCard
  };
}
```

### 5.4 Create `hooks/useBoardSelectors.ts`

```typescript
'use client';

import { useCallback, useMemo } from 'react';
import { Board, Card, ColumnWithCards } from '@/types/board';

/**
 * Board Selectors Hook
 * 
 * Contains derived data and queries.
 * Memoized for performance.
 * Placeholder for now - will be implemented in Phase 1.
 */
export function useBoardSelectors(board: Board | null) {
  // Placeholder selectors - will implement in Phase 1
  const getColumnCards = useCallback((columnId: string): Card[] => {
    if (!board) return [];
    return Object.values(board.cards)
      .filter(card => card.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }, [board]);

  const getAllColumnsWithCards = useMemo((): ColumnWithCards[] => {
    if (!board) return [];
    
    return board.columnOrder.map(colId => {
      const column = board.columns[colId];
      if (!column) return null;
      
      return {
        ...column,
        cards: getColumnCards(colId)
      };
    }).filter((col): col is ColumnWithCards => col !== null);
  }, [board, getColumnCards]);

  return {
    getColumnCards,
    getAllColumnsWithCards
  };
}
```

### 5.5 Create `hooks/useBoard.ts`

```typescript
'use client';

import { useBoardState } from './useBoardState';
import { useBoardActions } from './useBoardActions';
import { useBoardSelectors } from './useBoardSelectors';

/**
 * Board Hook (Composition)
 * 
 * Combines all board-related hooks into single API.
 * This is the main hook components will use.
 */
export function useBoard(boardId?: string) {
  const { board, setBoard, isLoaded } = useBoardState(boardId);
  const actions = useBoardActions(board, setBoard);
  const selectors = useBoardSelectors(board);

  return {
    // State
    board,
    setBoard,
    isLoaded,
    
    // Actions
    ...actions,
    
    // Selectors
    ...selectors
  };
}
```

---

## Acceptance Criteria

- [ ] All 5 hook files created
- [ ] useStorageAdapter interface defined ⭐
- [ ] useLocalStorageAdapter implemented
- [ ] useBoardState uses adapter pattern
- [ ] All hooks have 'use client' directive
- [ ] TypeScript compiles without errors
- [ ] JSDoc comments included

---

## Verification

Create temporary test file `test-hooks.ts`:
```typescript
import { useBoard } from '@/hooks/useBoard';

// In a React component:
const { board, isLoaded, getAllColumnsWithCards } = useBoard();

console.log('Board loaded:', isLoaded);
console.log('Board ID:', board?.id);  // Should be 'board-default'
console.log('Columns:', getAllColumnsWithCards().length);  // Should be 3
```

---

## Notes

**Why Storage Adapter Pattern?**
- Phase 0-6: Use localStorage (simple, works offline)
- Phase 7+: Swap to API adapter (just change one line)
- No changes needed to components or business logic
- Easy to test (mock adapter in tests)

**Hook Separation Benefits:**
- `useBoardState`: Pure storage, no logic
- `useBoardActions`: Testable mutations
- `useBoardSelectors`: Memoized queries
- `useBoard`: Clean API for components

**'use client' Directive:**
- Required for hooks using React features
- Next.js App Router requirement
- Separates client/server code

---

## Next Task

After completion, proceed to **Phase-0-Task-6-Component-Structure.md**
