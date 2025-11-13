# Phase 4: External Command API - Part 1: Implementation

**Prerequisites:** Phase 3 (API Prep) Complete
**Estimated Time:** 2.5 hours (Tasks 4.1-4.2)
**Priority:** HIGH (Required for external process control)

---

## Overview

Phase 4 transforms Agwakwagan into a **general-purpose process monitor** that can be controlled by external actors (AI agents, build systems, issue trackers, custom automation). This phase focuses on:

1. **Hash-based card/column identity** - Kanban assigns stable hashes on creation
2. **Command API endpoints** - REST API for external control
3. **API authentication** - Securing external access
4. **Event notifications** - Informing external actors of changes

**Key Principle:** Agwakwagan is the **source of truth for identity**. External actors create resources and receive kanban-assigned hashes to reference them. They do NOT provide their own IDs.

**Use Cases:**
- Beads issue tracker creating/updating cards (receives cardHash, stores it)
- CI/CD pipeline moving build status cards
- AI agents claiming and updating work items
- Custom automation scripts managing task flow

---

## Hash Format Specification

**Card Hash Format:** `card-{xxxx}`
- Prefix: `card-` (5 characters including hyphen)
- Hash: 4-character base36 (0-9, a-z)
- Total length: 9 characters
- Examples: `card-a3f2`, `card-7b2k`, `card-9qq0`
- Uniqueness: 36^4 = 1,679,616 possible combinations

**Column Hash Format:** `col-{xxxx}`
- Prefix: `col-` (4 characters including hyphen)
- Hash: 4-character base36 (0-9, a-z)
- Total length: 8 characters
- Examples: `col-x9k2`, `col-m4n7`, `col-iic8`
- Uniqueness: 36^4 = 1,679,616 possible combinations

**Prefix Rules** (following Beads conventions):
- Max length: 8 characters (including trailing hyphen)
- Allowed characters: lowercase letters, numbers, hyphens
- Must start with: a letter
- Must end with: a hyphen
- Cannot be: empty or just a hyphen

---

## Architecture: Kanban-Assigned Identity Model

### How External Actors Work

```
┌──────────────────┐
│  External Actor │  (Beads, CI/CD, Agent, Custom Script)
│ (Stores hashes) │
└────────┬─────────┘
         │
         │ POST /api/cards { title: "..." }
         │
         ▼
┌──────────────────┐  Returns { cardHash: "abc123" }
│   API Layer     │  Actor stores "abc123" for future reference
│  (Auth, Valid)  │
└────────┬─────────┘
         │
         │ PUT /api/cards/abc123 { column: "in-progress" }
         │
         ▼
┌──────────────────┐
│  Kanban Board   │  Card { id: "card-1699...", cardHash: "abc123" }
│  (Source of ID) │  Columns, Order, Notes
└──────────────────┘
```

### Key Design Decisions

1. **Kanban-Assigned Hashes**: Agwakwagan generates stable hashes on resource creation
2. **Single Source of Truth**: External actors receive hashes, don't generate them
3. **Hash-Based Addressing**: All API operations use kanban-assigned hashes
4. **Column Names + Hashes**: Columns have both human names ("todo") and stable hashes
5. **Idempotent Creation**: Duplicate requests safe (can return existing hash)

**Why This Approach?**
- **Simpler coordination**: Actor doesn't manage ID generation
- **Stable references**: Hash never changes, even if card moves/updates
- **Like GitHub issues**: Create → receive #42 → reference #42 forever
- **Retry-safe**: POST same card twice → get same hash back

---

## Task 4.1: Hash-Based Card Extension (30 min)

### Problem

External actors need to:
- Create cards and receive stable identifiers
- Update/delete cards using those identifiers
- Not generate/manage IDs themselves

### Solution: Add `cardHash` to Card

**File: `types/board.ts`**

Add ONE field to Card interface:

```typescript
export interface Card {
  id: string; // Internal: 'card-{timestamp}-{random}'
  title: string;
  description?: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];

  // NEW: Kanban-assigned stable hash
  /**
   * Stable hash identifier assigned by kanban on creation
   * Used by external actors to reference this card
   * Format: card-{xxxx} where xxxx is 4-char base36 (0-9, a-z)
   * Generated once, never changes
   * Example: card-a3f2, card-7b2k, card-9qq0
   */
  cardHash?: string;
}
```

### Add to Column Interface

**File: `types/board.ts`**

```typescript
export interface Column {
  id: string; // Internal: 'column-{timestamp}-{random}'
  title: string;
  order: number;

  // NEW: Kanban-assigned stable hash
  /**
   * Stable hash identifier assigned by kanban on creation
   * Used by external actors to reference this column
   * Format: col-{xxxx} where xxxx is 4-char base36 (0-9, a-z)
   * Generated once, never changes
   * Example: col-x9k2, col-m4n7, col-iic8
   */
  columnHash?: string;
}
```

### Add Hash Generation Utility

**File: `utils/hash.ts`** (NEW)

```typescript
/**
 * Generate 4-character base36 hash (0-9, a-z)
 * Base36 gives us 36^4 = 1,679,616 unique combinations
 */
function generateBase36Hash(): string {
  // Generate random number between 0 and 1679615 (36^4 - 1)
  const max = Math.pow(36, 4);
  const random = Math.floor(Math.random() * max);
  
  // Convert to base36 and pad to 4 characters
  return random.toString(36).padStart(4, '0');
}

/**
 * Generate card hash with format: card-{xxxx}
 * Example: card-a3f2, card-7b2k, card-9qq0
 */
export function generateCardHash(): string {
  return `card-${generateBase36Hash()}`;
}

/**
 * Generate column hash with format: col-{xxxx}
 * Example: col-x9k2, col-m4n7, col-iic8
 */
export function generateColumnHash(): string {
  return `col-${generateBase36Hash()}`;
}

/**
 * Validate hash format (prefix rules from Beads)
 * - Max prefix length: 8 characters (including trailing hyphen)
 * - Allowed characters: lowercase letters, numbers, hyphens
 * - Must start with a letter
 * - Must end with a hyphen
 * - Hash portion: exactly 4 base36 characters
 */
export function isValidHash(hash: string, prefix: 'card-' | 'col-'): boolean {
  const regex = new RegExp(`^${prefix}[0-9a-z]{4}$`);
  return regex.test(hash);
}
```

### Add Helper Functions

**File: `utils/cardLookup.ts`** (NEW)

```typescript
import { Board } from '@/types/board';

/**
 * Find card by kanban-assigned hash
 * Used by API to map hashes to internal cards
 */
export function findCardByHash(
  board: Board,
  cardHash: string
): string | undefined {
  const entry = Object.entries(board.cards).find(
    ([_, card]) => card.cardHash === cardHash
  );
  return entry?.[0]; // Return internal card ID
}

/**
 * Find column by kanban-assigned hash
 */
export function findColumnByHash(
  board: Board,
  columnHash: string
): string | undefined {
  const entry = Object.entries(board.columns).find(
    ([_, column]) => column.columnHash === columnHash
  );
  return entry?.[0]; // Return internal column ID
}
```

### Acceptance Criteria
- [ ] Card interface includes `cardHash?: string`
- [ ] Column interface includes `columnHash?: string`
- [ ] Hash generation utilities exist
- [ ] Helper functions `findCardByHash()` and `findColumnByHash()` exist
- [ ] Existing cards load without errors (cardHash is optional)
- [ ] Build passes TypeScript checks

---

## Task 4.2: Command API Endpoints (2 hours)

### Problem

External actors need REST API endpoints to:
- Create cards (receive cardHash)
- Update card content and position
- Move cards between columns
- Delete cards
- Query card status
- Create/list columns

### Solution: Next.js API Routes

**Directory Structure:**
```
app/api/
├── boards/
│   └── [boardId]/
│       ├── cards/
│       │   ├── route.ts          # GET (list), POST (create → returns hash)
│       │   └── [cardHash]/
│       │       └── route.ts      # GET, PUT, DELETE (by cardHash)
│       └── columns/
│           ├── route.ts          # GET (list), POST (create → returns hash)
│           └── [columnHash]/
│               └── route.ts      # DELETE (empty column only)
└── middleware.ts                 # Auth & validation
```

### API Specification

#### 1. List Cards
```
GET /api/boards/:boardId/cards

Response 200:
{
  "cards": [
    {
      "cardHash": "card-a3f2",
      "title": "Task 1",
      "description": "...",
      "columnHash": "col-b8d3",
      "columnName": "todo",
      "createdAt": "2024-11-11T00:00:00Z",
      "updatedAt": "2024-11-11T00:00:00Z"
    }
  ]
}
```

#### 2. Create Card
```
POST /api/boards/:boardId/cards
Content-Type: application/json

{
  "title": "Implement auth",        // Required
  "description": "Add OAuth flow",  // Optional
  "columnHash": "col-b8d3"         // Optional (can use columnName instead)
  // OR
  "columnName": "todo"              // Optional, defaults to first column
}

Response 201:
{
  "cardHash": "card-a3f2",      // ← Kanban-assigned hash
  "title": "Implement auth",
  "description": "Add OAuth flow",
  "columnHash": "col-b8d3",
  "columnName": "todo",
  "createdAt": "2024-11-11T00:00:00Z"
}

Response 400:
{
  "error": "title is required"
}
```

**Idempotency Note:** Optionally support `idempotencyKey` in request. If provided, return existing card if already created with that key.

#### 3. Get Card
```
GET /api/boards/:boardId/cards/:cardHash

Response 200:
{
  "cardHash": "card-a3f2",
  "title": "Implement auth",
  "description": "Add OAuth flow",
  "columnHash": "col-b8d3",
  "columnName": "in-progress",
  "createdAt": "2024-11-11T00:00:00Z",
  "updatedAt": "2024-11-11T12:30:00Z"
}

Response 404:
{
  "error": "Card not found"
}
```

#### 4. Update Card
```
PUT /api/boards/:boardId/cards/:cardHash
Content-Type: application/json

{
  "title": "Implement OAuth 2.0",      // Optional
  "description": "...",                 // Optional
  "columnHash": "col-c9e4"             // Optional (can use columnName)
  // OR
  "columnName": "in-progress"          // Optional
}

Response 200:
{
  "cardHash": "card-a3f2",
  "title": "Implement OAuth 2.0",
  "columnHash": "col-c9e4",
  "columnName": "in-progress",
  "updatedAt": "2024-11-11T13:00:00Z"
}
```

#### 5. Delete Card
```
DELETE /api/boards/:boardId/cards/:cardHash

Response 204: (no content)

Response 404:
{
  "error": "Card not found"
}
```

#### 6. List Columns
```
GET /api/boards/:boardId/columns

Response 200:
{
  "columns": [
    {
      "columnHash": "col-b8d3",
      "name": "todo",
      "title": "To Do",
      "order": 0
    },
    {
      "columnHash": "col-c9e4",
      "name": "in-progress",
      "title": "In Progress",
      "order": 1
    },
    {
      "columnHash": "col-d1f5",
      "name": "done",
      "title": "Done",
      "order": 2
    }
  ]
}
```

#### 7. Create Column
```
POST /api/boards/:boardId/columns
Content-Type: application/json

{
  "title": "Review",               // Required
  "insertAfter": "col-c9e4"        // Optional: columnHash to insert after
}

Response 201:
{
  "columnHash": "col-e2g6",   // ← Kanban-assigned hash
  "name": "review",
  "title": "Review",
  "order": 2
}
```

#### 8. Delete Column (NEW)
```
DELETE /api/boards/:boardId/columns/:columnHash

Response 204: (no content)

Response 400 (if column contains cards):
{
  "error": "Cannot delete column with cards. Column contains 3 card(s)."
}

Response 404:
{
  "error": "Column not found"
}
```

### Implementation: Create Card Endpoint

**File: `app/api/boards/[boardId]/cards/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageDataSource } from '@/lib/datasources/localStorage';
import { Card } from '@/types/board';
import { generateId } from '@/utils/ids';
import { generateCardHash } from '@/utils/hash';
import { findCardByHash, findColumnByHash } from '@/utils/cardLookup';

const dataSource = new LocalStorageDataSource();

/**
 * GET /api/boards/:boardId/cards
 * List all cards (external view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const board = await dataSource.loadBoard(params.boardId);

    // Convert internal cards to external view
    const externalCards = Object.values(board.cards)
      .filter(card => card.cardHash) // Only return cards with hashes
      .map(card => {
        const column = board.columns[card.columnId];
        return {
          cardHash: card.cardHash,
          title: card.title,
          description: card.description,
          columnHash: column?.columnHash,
          columnName: getColumnName(column),
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        };
      });

    return NextResponse.json({ cards: externalCards });
  } catch (error) {
    console.error('Failed to list cards:', error);
    return NextResponse.json(
      { error: 'Failed to load board' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/boards/:boardId/cards
 * Create new card → returns kanban-assigned cardHash
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const board = await dataSource.loadBoard(params.boardId);

    // Determine column
    let columnId: string | undefined;

    if (body.columnHash) {
      columnId = findColumnByHash(board, body.columnHash);
      if (!columnId) {
        return NextResponse.json(
          { error: `Column with hash '${body.columnHash}' not found` },
          { status: 400 }
        );
      }
    } else if (body.columnName) {
      columnId = findColumnByName(board, body.columnName);
      if (!columnId) {
        return NextResponse.json(
          { error: `Column '${body.columnName}' not found` },
          { status: 400 }
        );
      }
    } else {
      // Default to first column
      columnId = board.columnOrder[0];
    }

    if (!columnId) {
      return NextResponse.json(
        { error: 'No columns available' },
        { status: 500 }
      );
    }

    // Calculate order (append to end of column)
    const cardsInColumn = Object.values(board.cards)
      .filter(c => c.columnId === columnId);
    const maxOrder = Math.max(0, ...cardsInColumn.map(c => c.order));

    // Generate kanban-assigned hash (format: card-xxxx)
    const cardHash = generateCardHash();

    // Create new card
    const now = new Date();
    const newCard: Card = {
      id: generateId('card'),
      title: body.title,
      description: body.description,
      columnId,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
      notes: [],
      cardHash, // ← Kanban-assigned
    };

    // Add to board
    board.cards[newCard.id] = newCard;
    board.metadata.updatedAt = now;

    await dataSource.saveBoard(board);

    const column = board.columns[columnId];

    // Return external view with kanban-assigned hash
    return NextResponse.json(
      {
        cardHash: newCard.cardHash,
        title: newCard.title,
        description: newCard.description,
        columnHash: column.columnHash,
        columnName: getColumnName(column),
        createdAt: newCard.createdAt.toISOString(),
        updatedAt: newCard.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}

// Helper functions
function getColumnName(column: any): string {
  return column?.title.toLowerCase().replace(/\s+/g, '-') || '';
}

function findColumnByName(board: any, name: string): string | undefined {
  const entry = Object.entries(board.columns).find(([_, col]: [string, any]) =>
    col.title.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  );
  return entry?.[0];
}
```

### Implementation: Card Operations by Hash

**File: `app/api/boards/[boardId]/cards/[cardHash]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageDataSource } from '@/lib/datasources/localStorage';
import { findCardByHash, findColumnByHash } from '@/utils/cardLookup';

const dataSource = new LocalStorageDataSource();

/**
 * GET /api/boards/:boardId/cards/:cardHash
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string; cardHash: string } }
) {
  try {
    const board = await dataSource.loadBoard(params.boardId);
    const cardId = findCardByHash(board, params.cardHash);

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const card = board.cards[cardId];
    const column = board.columns[card.columnId];

    return NextResponse.json({
      cardHash: card.cardHash,
      title: card.title,
      description: card.description,
      columnHash: column?.columnHash,
      columnName: getColumnName(column),
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to get card:', error);
    return NextResponse.json(
      { error: 'Failed to load card' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/boards/:boardId/cards/:cardHash
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { boardId: string; cardHash: string } }
) {
  try {
    const body = await request.json();
    const board = await dataSource.loadBoard(params.boardId);
    const cardId = findCardByHash(board, params.cardHash);

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const card = board.cards[cardId];

    // Update fields
    if (body.title !== undefined) card.title = body.title;
    if (body.description !== undefined) card.description = body.description;

    // Handle column change (by hash or name)
    let newColumnId: string | undefined;

    if (body.columnHash !== undefined) {
      newColumnId = findColumnByHash(board, body.columnHash);
      if (!newColumnId) {
        return NextResponse.json(
          { error: `Column with hash '${body.columnHash}' not found` },
          { status: 400 }
        );
      }
    } else if (body.columnName !== undefined) {
      newColumnId = findColumnByName(board, body.columnName);
      if (!newColumnId) {
        return NextResponse.json(
          { error: `Column '${body.columnName}' not found` },
          { status: 400 }
        );
      }
    }

    // If column changed, move to end of new column
    if (newColumnId && newColumnId !== card.columnId) {
      card.columnId = newColumnId;

      const cardsInNewColumn = Object.values(board.cards)
        .filter(c => c.columnId === newColumnId && c.id !== cardId);
      const maxOrder = Math.max(0, ...cardsInNewColumn.map(c => c.order));
      card.order = maxOrder + 1;
    }

    card.updatedAt = new Date();
    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    const column = board.columns[card.columnId];

    return NextResponse.json({
      cardHash: card.cardHash,
      title: card.title,
      description: card.description,
      columnHash: column?.columnHash,
      columnName: getColumnName(column),
      updatedAt: card.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to update card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/boards/:boardId/cards/:cardHash
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { boardId: string; cardHash: string } }
) {
  try {
    const board = await dataSource.loadBoard(params.boardId);
    const cardId = findCardByHash(board, params.cardHash);

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    delete board.cards[cardId];
    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}

// Helper functions
function getColumnName(column: any): string {
  return column?.title.toLowerCase().replace(/\s+/g, '-') || '';
}

function findColumnByName(board: any, name: string): string | undefined {
  const entry = Object.entries(board.columns).find(([_, col]: [string, any]) =>
    col.title.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  );
  return entry?.[0];
}
```

### Implementation: List/Create Columns

**File: `app/api/boards/[boardId]/columns/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageDataSource } from '@/lib/datasources/localStorage';
import { Column } from '@/types/board';
import { generateId } from '@/utils/ids';
import { generateColumnHash } from '@/utils/hash';
import { findColumnByHash } from '@/utils/cardLookup';

const dataSource = new LocalStorageDataSource();

/**
 * GET /api/boards/:boardId/columns
 * List all columns with hashes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const board = await dataSource.loadBoard(params.boardId);

    const columns = board.columnOrder
      .map(colId => board.columns[colId])
      .filter(col => col !== undefined)
      .map(col => ({
        columnHash: col.columnHash,
        name: col.title.toLowerCase().replace(/\s+/g, '-'),
        title: col.title,
        order: col.order,
      }));

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Failed to list columns:', error);
    return NextResponse.json(
      { error: 'Failed to load board' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/boards/:boardId/columns
 * Create new column → returns kanban-assigned columnHash
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const board = await dataSource.loadBoard(params.boardId);

    // Determine insertion order
    let order: number;
    if (body.insertAfter) {
      const afterColumnId = findColumnByHash(board, body.insertAfter);
      if (!afterColumnId) {
        return NextResponse.json(
          { error: `Column with hash '${body.insertAfter}' not found` },
          { status: 400 }
        );
      }

      const afterColumn = board.columns[afterColumnId];
      order = afterColumn.order + 1;

      // Shift subsequent columns
      Object.values(board.columns).forEach(col => {
        if (col.order > afterColumn.order) {
          col.order++;
        }
      });
    } else {
      // Append to end
      const maxOrder = Math.max(0, ...Object.values(board.columns).map(c => c.order));
      order = maxOrder + 1;
    }

    // Generate kanban-assigned hash (format: col-xxxx)
    const columnHash = generateColumnHash();

    // Create new column
    const newColumn: Column = {
      id: generateId('column'),
      title: body.title,
      order,
      columnHash, // ← Kanban-assigned
    };

    // Add to board
    board.columns[newColumn.id] = newColumn;
    
    // Update column order
    if (body.insertAfter) {
      const afterColumnId = findColumnByHash(board, body.insertAfter);
      const insertIndex = board.columnOrder.indexOf(afterColumnId!) + 1;
      board.columnOrder.splice(insertIndex, 0, newColumn.id);
    } else {
      board.columnOrder.push(newColumn.id);
    }

    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    // Return external view with kanban-assigned hash
    return NextResponse.json(
      {
        columnHash: newColumn.columnHash,
        name: newColumn.title.toLowerCase().replace(/\s+/g, '-'),
        title: newColumn.title,
        order: newColumn.order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create column:', error);
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    );
  }
}
```

### Implementation: Delete Column

**File: `app/api/boards/[boardId]/columns/[columnHash]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageDataSource } from '@/lib/datasources/localStorage';
import { findColumnByHash } from '@/utils/cardLookup';

const dataSource = new LocalStorageDataSource();

/**
 * DELETE /api/boards/:boardId/columns/:columnHash
 * Delete column only if empty
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { boardId: string; columnHash: string } }
) {
  try {
    const board = await dataSource.loadBoard(params.boardId);
    const columnId = findColumnByHash(board, params.columnHash);

    if (!columnId) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      );
    }

    // Check if column contains any cards
    const cardsInColumn = Object.values(board.cards)
      .filter(card => card.columnId === columnId);

    if (cardsInColumn.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete column with cards. Column contains ${cardsInColumn.length} card(s).` },
        { status: 400 }
      );
    }

    // Remove column from board
    delete board.columns[columnId];

    // Remove from column order
    const orderIndex = board.columnOrder.indexOf(columnId);
    if (orderIndex > -1) {
      board.columnOrder.splice(orderIndex, 1);
    }

    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete column:', error);
    return NextResponse.json(
      { error: 'Failed to delete column' },
      { status: 500 }
    );
  }
}
```

### Acceptance Criteria
- [ ] All 8 API endpoints implemented (cards: list, create, get, update, delete; columns: list, create, delete)
- [ ] Hashes assigned by kanban on creation
- [ ] POST /cards returns `cardHash` in response
- [ ] POST /columns returns `columnHash` in response
- [ ] DELETE /columns/:columnHash only works if column is empty
- [ ] DELETE /columns/:columnHash returns 400 if column contains cards
- [ ] Can reference cards/columns by hash in subsequent requests
- [ ] Column names AND hashes both work for addressing
- [ ] Proper HTTP status codes (200, 201, 204, 400, 404, 500)
- [ ] Error messages are clear and actionable

---

## Beads Issues Breakdown

When converting this spec to Beads issues, create the following **10 issues** to ensure proper task granularity:

### Core Implementation Issues (5 issues)

**Issue 1: Task 4.1 - Hash-Based Card Extension**
- **Estimated Time:** 30 minutes
- **Dependencies:** None
- **Scope:** 
  - Add `cardHash?: string` to Card interface
  - Add `columnHash?: string` to Column interface
  - Create `utils/hash.ts` with `generateCardHash()`, `generateColumnHash()`, `isValidHash()`
  - Create `utils/cardLookup.ts` with `findCardByHash()`, `findColumnByHash()`
- **Acceptance Criteria:** See Task 4.1 acceptance criteria above

**Issue 2: Task 4.2a - Card API Endpoints**
- **Estimated Time:** 1.5 hours
- **Dependencies:** Issue 1 (hash utilities must exist)
- **Scope:**
  - Implement `app/api/boards/[boardId]/cards/route.ts` (GET list, POST create)
  - Implement `app/api/boards/[boardId]/cards/[cardHash]/route.ts` (GET, PUT, DELETE)
  - 5 endpoints total for card operations
- **Acceptance Criteria:** All card endpoints work, return proper status codes, handle errors

**Issue 3: Task 4.2b - Column API Endpoints**
- **Estimated Time:** 1 hour
- **Dependencies:** Issue 1 (hash utilities must exist)
- **Scope:**
  - Implement `app/api/boards/[boardId]/columns/route.ts` (GET list, POST create)
  - Implement `app/api/boards/[boardId]/columns/[columnHash]/route.ts` (DELETE)
  - 3 endpoints total for column operations
- **Acceptance Criteria:** All column endpoints work, DELETE validates empty column, proper status codes

**Issue 4: Task 4.3 - Authentication Provider Pattern**
- **Estimated Time:** 1 hour
- **Dependencies:** Issues 2 & 3 (API routes must exist to wrap)
- **Scope:**
  - Create `app/api/auth/provider.ts` (AuthProvider interface)
  - Create `app/api/auth/apiKeyProvider.ts` (implementation)
  - Create `app/api/auth/jwtProvider.ts` (skeleton)
  - Create `app/api/middleware.ts` (withAuth wrapper)
  - Update all route files to use `withAuth()`
- **Acceptance Criteria:** See Task 4.3 acceptance criteria in Part 2

**Issue 5: Task 4.5 - Migration Script**
- **Estimated Time:** 30 minutes
- **Dependencies:** Issue 1 (hash utilities must exist)
- **Scope:**
  - Create `scripts/migrate-add-hashes.ts`
  - Script adds hashes to existing cards/columns
  - Idempotent (safe to run multiple times)
- **Acceptance Criteria:** See Task 4.5 acceptance criteria in Part 2

### Optional/Polish Issues (2 issues)

**Issue 6: Task 4.4 - Event Notifications (Optional)**
- **Estimated Time:** 30 minutes
- **Dependencies:** Issues 2 & 3 (card/column routes must exist)
- **Scope:**
  - Create `app/api/boards/[boardId]/webhooks/route.ts`
  - Implement webhook registration
  - Add webhook calls to card/column operations
- **Acceptance Criteria:** See Task 4.4 acceptance criteria in Part 2

**Issue 7: Phase 4 - Manual Testing & Validation**
- **Estimated Time:** 30 minutes
- **Dependencies:** Issues 1-5 complete
- **Scope:**
  - Run all curl tests from Part 2
  - Verify all acceptance criteria
  - Test auth failures (401)
  - Test validation errors (400, 404)
- **Acceptance Criteria:** All manual testing checklist items pass

### Documentation Issues (3 issues)

**Issue 8: Phase 4 - API Documentation**
- **Estimated Time:** 30 minutes
- **Dependencies:** Issues 2 & 3 complete
- **Scope:**
  - Document all 8 API endpoints
  - Add request/response examples
  - Document authentication requirements
- **Deliverable:** Markdown file with complete API reference

**Issue 9: Phase 4 - Setup Environment Variables**
- **Estimated Time:** 15 minutes
- **Dependencies:** Issue 4 (auth provider must exist)
- **Scope:**
  - Create `.env.local` template
  - Document required environment variables
  - Generate secure API keys
- **Deliverable:** `.env.local.example` file

**Issue 10: Phase 4 - Update README**
- **Estimated Time:** 15 minutes
- **Dependencies:** Issues 8 & 9 complete
- **Scope:**
  - Add "External Command API" section to README
  - Link to API documentation
  - Explain authentication setup
  - Provide quick start examples
- **Deliverable:** Updated README.md

---

## Implementation Order

**Critical path:**
1. Issue 1 (hash utilities) - **Required for everything else**
2. Issues 2 & 3 in parallel (card & column APIs) - **Core functionality**
3. Issue 4 (auth) - **Secures the APIs**
4. Issue 5 (migration) - **Enables existing boards**
5. Issue 7 (testing) - **Validates implementation**

**Documentation path (can be done in parallel):**
6. Issues 8, 9, 10 - **Document as you build**

**Optional:**
7. Issue 6 (webhooks) - **Only if needed**

---

## Total Effort

- **Core Implementation:** ~5 hours (Issues 1-5)
- **Optional Features:** ~30 minutes (Issue 6)
- **Testing:** ~30 minutes (Issue 7)
- **Documentation:** ~1 hour (Issues 8-10)
- **Total:** ~6-7 hours

---

## Next Steps

Continue to **Part 2** for:
- Task 4.3: API Authentication
- Task 4.4: Event Notifications (Optional)
- Task 4.5: Migration for Existing Boards
- Testing Plan
- Success Criteria
