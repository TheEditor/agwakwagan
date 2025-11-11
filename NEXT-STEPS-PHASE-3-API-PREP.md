# Phase 3: Architecture for API Integration

**Prerequisites:** Phase 2 (UI/UX) Complete
**Estimated Time:** 3-4 hours
**Priority:** HIGH (Required for production API layer)

---

## Overview

Phase 3 prepares the codebase for **API integration and multi-data-source support**. This is critical for your goal of bolting on an API layer and using the kanban as a general-purpose process monitor.

**Current State:**
- ✅ Storage adapter interface exists (`hooks/useStorageAdapter.ts`)
- ✅ LocalStorage implementation works
- ❌ No abstraction for multiple data sources
- ❌ No multi-board management
- ❌ Board type doesn't track its data source

**Target State:**
- ✅ Data source abstraction (localStorage, API, Beads, custom)
- ✅ Multi-board support (football schedule board + Beads issues board)
- ✅ Board metadata tracks data source
- ✅ Easy to swap backends without changing components

---

## Task 3.1: Create Data Source Abstraction (2 hours)

### Problem
Currently, `useBoardState.ts` is hardcoded to localStorage. To support:
- API backends
- Beads issue tracker
- Custom data sources (football schedules, etc.)

You need a pluggable system.

### Solution: DataSource Interface

**New File: `types/datasource.ts`**

```typescript
import { Board } from './board';

/**
 * DataSource - Abstraction for board persistence
 *
 * Enables swapping between localStorage, API, Beads, or custom sources
 * without changing component code.
 */
export interface DataSource {
  /** Unique identifier for this data source */
  id: string;

  /** Human-readable name */
  name: string;

  /** Type of data source */
  type: 'local' | 'api' | 'beads' | 'custom';

  /**
   * Load a board by ID
   * @param boardId - Board identifier
   * @returns Promise resolving to Board data
   * @throws Error if board not found or load fails
   */
  loadBoard(boardId: string): Promise<Board>;

  /**
   * Save board data
   * @param board - Complete board state
   * @throws Error if save fails
   */
  saveBoard(board: Board): Promise<void>;

  /**
   * List all available boards from this source
   * @returns Promise resolving to array of board summaries
   */
  listBoards?(): Promise<BoardSummary[]>;

  /**
   * Subscribe to real-time changes (optional)
   * Used for collaborative editing or external updates
   * @param boardId - Board to watch
   * @param callback - Called when board changes
   * @returns Unsubscribe function
   */
  subscribeToChanges?(
    boardId: string,
    callback: (board: Board) => void
  ): () => void;

  /**
   * Delete a board (optional)
   * @param boardId - Board to delete
   */
  deleteBoard?(boardId: string): Promise<void>;
}

/**
 * BoardSummary - Minimal board info for list views
 */
export interface BoardSummary {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
  columnCount: number;
  dataSource: string; // DataSource.id
}
```

### Implementation: LocalStorage Data Source

**New File: `lib/datasources/localStorage.ts`**

```typescript
import { Board } from '@/types/board';
import { DataSource, BoardSummary } from '@/types/datasource';
import { DEFAULT_BOARD } from '@/utils/constants';

const STORAGE_KEY_PREFIX = 'agwakwagan';
const BOARDS_INDEX_KEY = 'agwakwagan-boards-index';

/**
 * LocalStorage implementation of DataSource
 *
 * Stores boards in browser localStorage with JSON serialization.
 * Maintains an index of all boards for listBoards() functionality.
 */
export class LocalStorageDataSource implements DataSource {
  id = 'local-storage';
  name = 'Local Storage';
  type = 'local' as const;

  async loadBoard(boardId: string): Promise<Board> {
    try {
      const key = `${STORAGE_KEY_PREFIX}-${boardId}`;
      const data = localStorage.getItem(key);

      if (!data) {
        // No saved board, return default with correct ID
        return { ...DEFAULT_BOARD, id: boardId };
      }

      // Parse and hydrate dates
      const board = JSON.parse(data) as Board;
      this.hydrateDates(board);

      return board;
    } catch (error) {
      console.error(`Error loading board ${boardId}:`, error);
      throw new Error(`Failed to load board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveBoard(board: Board): Promise<void> {
    try {
      const key = `${STORAGE_KEY_PREFIX}-${board.id}`;
      const serialized = JSON.stringify(board);
      localStorage.setItem(key, serialized);

      // Update boards index
      await this.updateBoardsIndex(board);
    } catch (error) {
      console.error(`Error saving board ${board.id}:`, error);

      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Consider exporting and clearing old boards.');
      }

      throw new Error(`Failed to save board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listBoards(): Promise<BoardSummary[]> {
    try {
      const indexData = localStorage.getItem(BOARDS_INDEX_KEY);
      if (!indexData) {
        return [];
      }

      const index = JSON.parse(indexData) as BoardSummary[];

      // Hydrate dates
      index.forEach(summary => {
        summary.createdAt = new Date(summary.createdAt);
        summary.updatedAt = new Date(summary.updatedAt);
      });

      return index.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Error listing boards:', error);
      return [];
    }
  }

  async deleteBoard(boardId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEY_PREFIX}-${boardId}`;
      localStorage.removeItem(key);

      // Update boards index
      const index = await this.listBoards();
      const updatedIndex = index.filter(b => b.id !== boardId);
      localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(updatedIndex));
    } catch (error) {
      console.error(`Error deleting board ${boardId}:`, error);
      throw new Error(`Failed to delete board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update the boards index with current board info
   */
  private async updateBoardsIndex(board: Board): Promise<void> {
    const index = await this.listBoards();

    const summary: BoardSummary = {
      id: board.id,
      title: board.metadata.title,
      createdAt: board.metadata.createdAt,
      updatedAt: board.metadata.updatedAt,
      cardCount: Object.keys(board.cards).length,
      columnCount: Object.keys(board.columns).length,
      dataSource: this.id,
    };

    // Update or add this board
    const existingIndex = index.findIndex(b => b.id === board.id);
    if (existingIndex >= 0) {
      index[existingIndex] = summary;
    } else {
      index.push(summary);
    }

    localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(index));
  }

  /**
   * Convert date strings to Date objects
   */
  private hydrateDates(board: Board): void {
    board.metadata.createdAt = new Date(board.metadata.createdAt);
    board.metadata.updatedAt = new Date(board.metadata.updatedAt);

    Object.values(board.cards).forEach((card) => {
      card.createdAt = new Date(card.createdAt);
      card.updatedAt = new Date(card.updatedAt);
      card.notes.forEach((note) => {
        note.createdAt = new Date(note.createdAt);
      });
    });
  }
}
```

### Implementation: API Data Source Skeleton

**New File: `lib/datasources/api.ts`**

```typescript
import { Board } from '@/types/board';
import { DataSource, BoardSummary } from '@/types/datasource';

/**
 * API implementation of DataSource
 *
 * To be implemented in Phase 7 when API backend is ready.
 * This skeleton shows the integration pattern.
 */
export class ApiDataSource implements DataSource {
  id: string;
  name: string;
  type = 'api' as const;

  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string, name?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.id = `api-${baseUrl}`;
    this.name = name || `API (${baseUrl})`;
  }

  async loadBoard(boardId: string): Promise<Board> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load board: ${response.statusText}`);
    }

    return response.json();
  }

  async saveBoard(board: Board): Promise<void> {
    const response = await fetch(`${this.baseUrl}/boards/${board.id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(board),
    });

    if (!response.ok) {
      throw new Error(`Failed to save board: ${response.statusText}`);
    }
  }

  async listBoards(): Promise<BoardSummary[]> {
    const response = await fetch(`${this.baseUrl}/boards`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to list boards: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteBoard(boardId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete board: ${response.statusText}`);
    }
  }

  subscribeToChanges(
    boardId: string,
    callback: (board: Board) => void
  ): () => void {
    // TODO: Implement WebSocket or SSE subscription
    console.log('Real-time sync not yet implemented');
    return () => {};
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}
```

### Update useBoardState to Use DataSource

**File: `hooks/useBoardState.ts`**

Modify to accept a DataSource parameter:

```typescript
import { DataSource } from '@/types/datasource';
import { LocalStorageDataSource } from '@/lib/datasources/localStorage';

export function useBoardState(
  boardId: string = "board-default",
  dataSource?: DataSource
) {
  // Use provided data source or default to localStorage
  const source = dataSource || new LocalStorageDataSource();

  // Replace direct localStorage calls with dataSource.loadBoard() and dataSource.saveBoard()
  // ... (implementation details)
}
```

### Acceptance Criteria
- [ ] DataSource interface defined in `types/datasource.ts`
- [ ] LocalStorageDataSource implements DataSource
- [ ] ApiDataSource skeleton exists for future use
- [ ] useBoardState accepts optional DataSource parameter
- [ ] Existing functionality still works (backward compatible)
- [ ] Build passes TypeScript checks

---

## Task 3.2: Add Board Metadata Support (1 hour)

### Problem
Boards need to know which data source they came from, especially when:
- Managing multiple boards from different sources
- Syncing with external systems
- Displaying board origin in UI

### Solution: Extend Board Type

**File: `types/board.ts`**

Add new fields to Board interface:

```typescript
export interface Board {
  id: string;
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
  metadata: BoardMetadata;

  // NEW FIELDS:

  /**
   * Data source this board is stored in
   * Enables multi-source board management
   */
  dataSourceId?: string; // e.g., "local-storage", "api-production", "beads-project-x"

  /**
   * External system reference
   * Used when board mirrors external data (e.g., Beads project, GitHub issues)
   */
  externalId?: string; // e.g., Beads project ID, GitHub repo ID

  /**
   * Last sync timestamp (for external systems)
   */
  lastSyncedAt?: Date;
}
```

### Update Constants

**File: `utils/constants.ts`**

Update DEFAULT_BOARD to include new fields:

```typescript
export const DEFAULT_BOARD: Board = {
  id: 'board-default',
  cards: {},
  columns: defaultColumns,
  columnOrder: ['col-todo', 'col-in-progress', 'col-done'],
  metadata: {
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  dataSourceId: 'local-storage', // NEW
  externalId: undefined,         // NEW
  lastSyncedAt: undefined,       // NEW
};
```

### Update Board Loading Logic

Ensure dataSourceId is set when loading boards:

```typescript
// When loading from LocalStorage
const board = await dataSource.loadBoard(boardId);
if (!board.dataSourceId) {
  board.dataSourceId = dataSource.id;
}
```

### Acceptance Criteria
- [ ] Board type includes dataSourceId, externalId, lastSyncedAt
- [ ] DEFAULT_BOARD has dataSourceId set to 'local-storage'
- [ ] Existing boards load without errors (fields are optional)
- [ ] Build passes TypeScript checks

---

## Task 3.3: Multi-Board Management (1 hour)

### Problem
Currently, the app always loads "board-default". For production use, you need:
- Multiple boards (e.g., "football-schedule", "beads-issues", "personal-tasks")
- UI to switch between boards
- Ability to create/delete boards

### Solution: Board Selector Component

**New File: `components/BoardSelector.tsx`**

```typescript
"use client";

import { useState, useEffect } from 'react';
import { BoardSummary } from '@/types/datasource';
import { DataSource } from '@/types/datasource';

interface BoardSelectorProps {
  dataSource: DataSource;
  currentBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard?: () => void;
  onDeleteBoard?: (boardId: string) => void;
}

export function BoardSelector({
  dataSource,
  currentBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
}: BoardSelectorProps) {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBoards();
  }, [dataSource]);

  const loadBoards = async () => {
    try {
      setIsLoading(true);
      if (dataSource.listBoards) {
        const boardList = await dataSource.listBoards();
        setBoards(boardList);
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBoard = (boardId: string) => {
    onSelectBoard(boardId);
    setIsOpen(false);
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board?')) {
      return;
    }

    try {
      if (dataSource.deleteBoard) {
        await dataSource.deleteBoard(boardId);
        await loadBoards();
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
      alert('Failed to delete board');
    }
  };

  const currentBoard = boards.find(b => b.id === currentBoardId);

  return (
    <div className="relative">
      {/* Current Board Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded
                   bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <span className="font-medium">
          {currentBoard?.title || currentBoardId}
        </span>
        <span className="text-gray-500">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-80 bg-white rounded-lg
                       shadow-lg border border-gray-200 z-50">
          {/* Board List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading boards...
              </div>
            ) : boards.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No boards found
              </div>
            ) : (
              boards.map(board => (
                <div
                  key={board.id}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50
                             border-b border-gray-100 cursor-pointer
                             ${board.id === currentBoardId ? 'bg-blue-50' : ''}`}
                >
                  <div
                    onClick={() => handleSelectBoard(board.id)}
                    className="flex-1"
                  >
                    <div className="font-medium">
                      {board.title || board.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {board.cardCount} cards • {board.columnCount} columns
                    </div>
                  </div>

                  {onDeleteBoard && board.id !== currentBoardId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(board.id);
                      }}
                      className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Create New Board Button */}
          {onCreateBoard && (
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={() => {
                  onCreateBoard();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium
                           bg-blue-500 text-white rounded
                           hover:bg-blue-600 transition-colors"
              >
                + Create New Board
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Update BoardHeader to Include Selector

**File: `components/BoardHeader.tsx`**

Add BoardSelector next to board title:

```typescript
import { BoardSelector } from './BoardSelector';

// In BoardHeader component:
<div className="flex items-center gap-4">
  <div>
    <h1 className="text-2xl font-bold text-[var(--color-text)]">
      Agwakwagan
    </h1>
    <p className="text-sm text-[var(--color-text-secondary)]">
      {board.id}
    </p>
  </div>

  {/* NEW: Board Selector */}
  <BoardSelector
    dataSource={dataSource} // Pass from parent
    currentBoardId={board.id}
    onSelectBoard={(id) => {
      // Trigger board switch
      window.location.search = `?board=${id}`;
    }}
    onCreateBoard={() => {
      const newId = prompt('Enter board ID:');
      if (newId) {
        window.location.search = `?board=${newId}`;
      }
    }}
  />
</div>
```

### Update App to Support Board Query Parameter

**File: `app/page.tsx` or main component**

Read `?board=...` from URL to determine which board to load:

```typescript
const searchParams = useSearchParams();
const boardId = searchParams.get('board') || 'board-default';
```

### Acceptance Criteria
- [ ] BoardSelector component displays list of boards
- [ ] Can switch between boards via selector
- [ ] Can create new board (prompts for ID)
- [ ] Can delete boards (with confirmation)
- [ ] URL parameter `?board=X` loads specific board
- [ ] Board list shows card/column counts
- [ ] UI updates after board operations

---

## Testing Plan

After completing all Phase 3 tasks:

### Unit Tests (Optional but Recommended)
```typescript
// tests/datasources/localStorage.test.ts
describe('LocalStorageDataSource', () => {
  it('should save and load boards', async () => {
    const source = new LocalStorageDataSource();
    const board = { ...DEFAULT_BOARD, id: 'test-board' };

    await source.saveBoard(board);
    const loaded = await source.loadBoard('test-board');

    expect(loaded.id).toBe('test-board');
  });

  it('should list all boards', async () => {
    const source = new LocalStorageDataSource();
    await source.saveBoard({ ...DEFAULT_BOARD, id: 'board-1' });
    await source.saveBoard({ ...DEFAULT_BOARD, id: 'board-2' });

    const boards = await source.listBoards();
    expect(boards.length).toBeGreaterThanOrEqual(2);
  });
});
```

### Manual Testing Checklist
- [ ] Create new board via selector
- [ ] Switch between boards (data persists)
- [ ] Delete a board (confirms, then removes)
- [ ] Reload page (selected board persists via URL)
- [ ] Add cards to different boards (no cross-contamination)
- [ ] Export works with multi-board setup
- [ ] Board list shows accurate counts

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `types/datasource.ts` | CREATE | DataSource interface definition |
| `lib/datasources/localStorage.ts` | CREATE | LocalStorage implementation |
| `lib/datasources/api.ts` | CREATE | API skeleton for future |
| `types/board.ts` | MODIFY | Add dataSourceId, externalId fields |
| `utils/constants.ts` | MODIFY | Update DEFAULT_BOARD |
| `hooks/useBoardState.ts` | MODIFY | Accept DataSource parameter |
| `components/BoardSelector.tsx` | CREATE | Multi-board UI |
| `components/BoardHeader.tsx` | MODIFY | Integrate BoardSelector |
| `app/page.tsx` | MODIFY | Read board ID from URL |

---

## Success Criteria

Phase 3 is complete when:
- ✅ DataSource abstraction is implemented
- ✅ LocalStorageDataSource works (backward compatible)
- ✅ Board type includes dataSourceId metadata
- ✅ Can create, list, switch, delete boards
- ✅ URL parameter determines active board
- ✅ Build passes TypeScript checks
- ✅ All existing functionality still works
- ✅ Ready for API backend integration (Phase 7)

---

## Next Steps

After Phase 3:
- **Phase 4:** Extend Card type for Beads integration
- **Phase 7 (Future):** Implement API backend and integrate
- **Phase 8 (Future):** Connect to Beads MCP server

This phase establishes the foundation for all future multi-source integrations.
