# Phase 0 - Task 3: Utility Functions

**Task ID:** P0-T3  
**Estimated Time:** 10 minutes  
**Dependencies:** P0-T2 (Types defined)

---

## Context

Create utility functions for ID generation and define constants including the default board state. The ID generation strategy uses a pattern that's both human-readable and sortable.

---

## Objectives

1. Create ID generation functions
2. Define default board constant (with Board ID ⭐)
3. Define storage key constant

---

## Tasks

### 3.1 Create `utils/ids.ts`

Create file at: `utils/ids.ts`

**Complete file contents:**

```typescript
/**
 * ID Generation Utilities
 * 
 * Pattern: {type}-{timestamp}-{random}
 * Example: card-1730867234567-a3b4c5d
 * 
 * Benefits:
 * - Type prefix aids debugging
 * - Timestamp provides rough chronological sorting
 * - Random suffix prevents collisions
 * - Human-readable in exports
 */

/**
 * Generate a unique ID for a given entity type
 * 
 * @param type - Type of entity (card, column, note, or board)
 * @returns Unique ID string
 * 
 * @example
 * generateId('card') // => 'card-1730867234567-a3b4c5d'
 */
export function generateId(type: 'card' | 'column' | 'note' | 'board'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${type}-${timestamp}-${random}`;
}

/**
 * Generate a unique board ID
 * Convenience wrapper for generateId('board')
 * 
 * @returns Unique board ID string
 * 
 * @example
 * generateBoardId() // => 'board-1730867234567-a3b4c5d'
 */
export function generateBoardId(): string {
  return generateId('board');
}

/**
 * Extract timestamp from an ID
 * Useful for debugging and sorting
 * 
 * @param id - ID string
 * @returns Timestamp in milliseconds, or null if invalid format
 * 
 * @example
 * getTimestampFromId('card-1730867234567-a3b4c5d') // => 1730867234567
 */
export function getTimestampFromId(id: string): number | null {
  const parts = id.split('-');
  if (parts.length < 2) return null;
  
  const timestamp = parseInt(parts[1], 10);
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Extract type from an ID
 * 
 * @param id - ID string
 * @returns Entity type, or null if invalid format
 * 
 * @example
 * getTypeFromId('card-1730867234567-a3b4c5d') // => 'card'
 */
export function getTypeFromId(id: string): string | null {
  const parts = id.split('-');
  return parts.length > 0 ? parts[0] : null;
}
```

### 3.2 Create `utils/constants.ts`

Create file at: `utils/constants.ts`

**Complete file contents:**

```typescript
import { Board } from '@/types/board';

/**
 * Default board configuration
 * 
 * This is the initial state when a user first opens the app
 * or when no saved board exists.
 * 
 * ⭐ Note: Includes board ID for future API/agent integration
 */
export const DEFAULT_BOARD: Board = {
  id: 'board-default',  // ⭐ CRITICAL: Required for Phase 7-8 agent integration
  
  cards: {},  // Start with no cards
  
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

/**
 * LocalStorage key for board data
 * 
 * Format includes board ID for future multi-board support
 */
export const STORAGE_KEY = 'agwakwagan-board';

/**
 * Application version
 * Used for data migration and compatibility checks
 */
export const APP_VERSION = '1.0.0';

/**
 * Default column titles
 * Used when creating new boards
 */
export const DEFAULT_COLUMN_TITLES = [
  'TODO',
  'In Progress',
  'Done'
] as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  CARD_TITLE_MIN_LENGTH: 1,
  CARD_TITLE_MAX_LENGTH: 500,
  CARD_DESCRIPTION_MAX_LENGTH: 5000,
  NOTE_MIN_LENGTH: 1,
  NOTE_MAX_LENGTH: 2000,
  COLUMN_TITLE_MIN_LENGTH: 1,
  COLUMN_TITLE_MAX_LENGTH: 100
} as const;

/**
 * Performance thresholds
 * When to show warnings or enable optimizations
 */
export const PERFORMANCE = {
  CARD_COUNT_WARNING: 200,      // Warn user at this many cards
  CARD_COUNT_VIRTUALIZE: 300,   // Enable virtualization at this count
  AUTO_SAVE_DEBOUNCE_MS: 500    // Wait time before saving after change
} as const;
```

---

## Acceptance Criteria

- [ ] `utils/ids.ts` created with all functions
- [ ] `utils/constants.ts` created with DEFAULT_BOARD
- [ ] DEFAULT_BOARD includes `id: 'board-default'` ⭐
- [ ] All functions have JSDoc comments
- [ ] Files compile without TypeScript errors
- [ ] generateId() produces expected format
- [ ] DEFAULT_BOARD matches Board interface

---

## Verification

Test ID generation:
```typescript
import { generateId, generateBoardId } from '@/utils/ids';

console.log(generateId('card'));  // Should output: card-{timestamp}-{random}
console.log(generateBoardId());   // Should output: board-{timestamp}-{random}
```

Test constants:
```typescript
import { DEFAULT_BOARD } from '@/utils/constants';

console.log(DEFAULT_BOARD.id);  // Should output: 'board-default'
console.log(Object.keys(DEFAULT_BOARD.columns).length);  // Should output: 3
```

---

## Notes

**Why this ID format?**
- Type prefix (card-, board-) makes debugging easier
- Timestamp allows rough chronological sorting
- Random suffix prevents collisions even if multiple IDs created in same millisecond
- Fully deterministic (no server needed)

**Why board ID in constants?**
- Phase 7-8 will need board IDs for API routing
- Setting it now prevents migration later
- Uses friendly 'board-default' instead of generated ID for default board

---

## Next Task

After completion, proceed to **Phase-0-Task-4-Theme-Setup.md**
