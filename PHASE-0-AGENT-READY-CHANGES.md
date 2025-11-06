# Phase 0 Agent-Ready Changes

**CRITICAL:** Add these modifications to Phase 0 before starting development.

---

## Changes to Task 0.3: Setup Type Definitions

**Replace** the Board interface definition with this version that includes `id`:

```typescript
export interface Board {
  id: string;  // ⭐ ADD THIS - Required for future agent integration
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
  metadata: BoardMetadata;
}
```

**Add** this comment block after the Card interface:

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
  
  // ⭐ RESERVED FOR FUTURE AGENT INTEGRATION (Phase 8)
  // Do not use these field names for other purposes:
  // assignedTo?: string;      // "human:dave" or "agent:gpt-researcher"
  // claimedBy?: string;        // Who's currently working on it
  // claimedAt?: Date;          // When claimed (for timeout detection)
  // status?: TaskStatus;       // 'available' | 'claimed' | 'in_progress' | 'blocked' | 'completed'
  // progress?: number;         // 0-1 for agent progress updates
  // agentMetadata?: Record<string, any>; // Agent-specific data
}
```

---

## Changes to Task 0.4: Setup Utility Functions

**Update** `utils/constants.ts` - Add `id` field to DEFAULT_BOARD:

```typescript
export const DEFAULT_BOARD: Board = {
  id: 'board-default',  // ⭐ ADD THIS
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
```

**Add** to `utils/ids.ts`:

```typescript
export function generateBoardId(): string {
  return generateId('board');
}
```

---

## NEW Task 0.8: Create Storage Adapter (Optional but Recommended)

Create `hooks/useStorageAdapter.ts`:

```typescript
import { Board } from '@/types/board';

export interface StorageAdapter {
  loadBoard(boardId: string): Promise<Board>;
  saveBoard(board: Board): Promise<void>;
}

export function useLocalStorageAdapter(): StorageAdapter {
  return {
    loadBoard: async (boardId: string) => {
      try {
        const key = `agwakwagan-${boardId}`;
        const data = localStorage.getItem(key);
        if (!data) {
          return { ...DEFAULT_BOARD, id: boardId };
        }
        
        const board = JSON.parse(data);
        // Convert date strings back to Date objects
        board.metadata.createdAt = new Date(board.metadata.createdAt);
        board.metadata.updatedAt = new Date(board.metadata.updatedAt);
        // ... convert dates in cards/notes too
        
        return board;
      } catch (error) {
        console.error('Error loading board:', error);
        return { ...DEFAULT_BOARD, id: boardId };
      }
    },
    
    saveBoard: async (board: Board) => {
      try {
        const key = `agwakwagan-${board.id}`;
        localStorage.setItem(key, JSON.stringify(board));
      } catch (error) {
        console.error('Error saving board:', error);
        throw error;
      }
    }
  };
}
```

Then update `hooks/useBoardState.ts` to use the adapter:

```typescript
export function useBoardState(boardId: string = 'board-default') {
  const adapter = useLocalStorageAdapter();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    adapter.loadBoard(boardId).then(b => {
      setBoard(b);
      setIsLoaded(true);
    });
  }, [boardId]);

  const saveBoard = useCallback((newBoard: Board) => {
    setBoard(newBoard);
    adapter.saveBoard(newBoard);
  }, [adapter]);

  return { board, setBoard: saveBoard, isLoaded };
}
```

**Why?** This makes Phase 7 (API integration) much easier - just swap the adapter implementation.

---

## Summary

**3 Critical Changes:**
1. ✅ Add `id: string` to Board interface
2. ✅ Add `id` to DEFAULT_BOARD constant
3. ✅ Reserve agent field names (comment block)

**1 Recommended Change:**
4. ✅ Create storage adapter interface (easier Phase 7 later)

**Impact:** +15 minutes to Phase 0, prevents major refactor in Phase 7

---

**After making these changes, proceed with Phase 0 as documented.**
