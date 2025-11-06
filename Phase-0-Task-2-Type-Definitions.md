# Phase 0 - Task 2: Type Definitions (Agent-Ready)

**Task ID:** P0-T2  
**Estimated Time:** 5 minutes  
**Dependencies:** P0-T1 (Project initialized)

---

## Context

Create TypeScript type definitions for the Agwakwagan data model. These types use a **normalized (flat) structure** rather than nested, which provides O(1) lookups and easier state management.

**CRITICAL:** This includes agent-ready modifications (Board ID, reserved field names) to prevent breaking changes in Phase 7-8.

---

## Objectives

1. Create complete type definitions in `types/board.ts`
2. Include Board ID field (required for future API/agent integration)
3. Reserve field names for future agent features
4. Export all types for use throughout the application

---

## Tasks

### 2.1 Create `types/board.ts`

Create file at: `types/board.ts`

**Complete file contents:**

```typescript
// Agwakwagan Type Definitions
// Version: 1.0 (Agent-Ready)

/**
 * Card represents a single task/item in the kanban board
 */
export interface Card {
  id: string;                    // Format: 'card-{timestamp}-{random}'
  title: string;                 // Required, 1-500 characters
  description?: string;          // Optional, longer description
  columnId: string;              // Foreign key to Column.id
  order: number;                 // Position within column (0-indexed)
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];                 // List of notes/comments on this card
  
  // ⭐ RESERVED FOR FUTURE AGENT INTEGRATION (Phase 8)
  // Do not use these field names for other purposes:
  // 
  // assignedTo?: string;           // "human:dave" or "agent:gpt-researcher"
  // claimedBy?: string;            // Who's currently working on it
  // claimedAt?: Date;              // When claimed (for timeout detection)
  // status?: TaskStatus;           // 'available' | 'claimed' | 'in_progress' | 'blocked' | 'completed'
  // progress?: number;             // 0-1 for agent progress updates
  // agentMetadata?: Record<string, any>; // Agent-specific data
}

/**
 * Note represents a comment or sub-item within a card
 */
export interface Note {
  id: string;                    // Format: 'note-{timestamp}-{random}'
  text: string;                  // Required, 1-2000 characters
  createdAt: Date;
}

/**
 * Column represents a stage/status in the kanban workflow
 */
export interface Column {
  id: string;                    // Format: 'col-{timestamp}-{random}' or 'col-{name}'
  title: string;                 // Required, 1-100 characters
  order: number;                 // Position in board (0-indexed)
  color?: string;                // Future: custom column colors
  cardLimit?: number;            // Future: WIP (Work In Progress) limits
}

/**
 * BoardMetadata contains board-level metadata
 */
export interface BoardMetadata {
  version: string;               // Data schema version (e.g., '1.0')
  createdAt: Date;
  updatedAt: Date;
  title?: string;                // Future: named boards
}

/**
 * Board represents the complete kanban board state
 * 
 * This uses a NORMALIZED structure (flat, not nested) for:
 * - O(1) lookups by ID
 * - Easy updates (change one field vs rebuild arrays)
 * - Simpler undo/redo (store diffs, not full state)
 * - Better performance at scale
 */
export interface Board {
  id: string;                    // ⭐ CRITICAL: Required for API/agent integration (Phase 7-8)
  cards: Record<string, Card>;   // Dictionary/map of cards by ID
  columns: Record<string, Column>; // Dictionary/map of columns by ID
  columnOrder: string[];         // Array of column IDs for render order
  metadata: BoardMetadata;
}

/**
 * ColumnWithCards is a derived type used for rendering
 * Combines column data with its sorted cards
 */
export interface ColumnWithCards extends Column {
  cards: Card[];                 // Cards for this column, sorted by order
}

/**
 * Future type for agent integration (Phase 8)
 * Reserved for future use - DO NOT implement yet
 */
// export type TaskStatus = 
//   | 'available'
//   | 'claimed'
//   | 'in_progress'
//   | 'blocked'
//   | 'completed';
```

---

## Acceptance Criteria

- [ ] File created at `types/board.ts`
- [ ] All interfaces defined with correct fields
- [ ] Board interface includes `id: string` field ⭐
- [ ] Card interface includes comment block with reserved field names ⭐
- [ ] All types exported
- [ ] File compiles without TypeScript errors
- [ ] JSDoc comments included for clarity

---

## Verification

Run TypeScript check:
```bash
npx tsc --noEmit
```

Should compile with no errors.

---

## Notes

**Why normalized structure?**
- Moving a card = change 2 fields (columnId, order) instead of array splice operations
- Finding a card = O(1) lookup instead of searching through nested arrays
- Easier to add features like search, filter, undo/redo

**Why Board ID now?**
- Required for Phase 7-8 (API/agent integration)
- Enables multi-board support in future
- Adding later would require migration and breaking changes

**Reserved field names:**
- Don't implement agent fields yet
- Just reserve the names to avoid conflicts later
- Phase 8 will uncomment and implement them

---

## Next Task

After completion, proceed to **Phase-0-Task-3-Utility-Functions.md**
