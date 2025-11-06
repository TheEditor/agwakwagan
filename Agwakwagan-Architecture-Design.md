# Agwakwagan - Architecture Design Document

**Project:** Agwakwagan Kanban Board (Complete Rebuild)  
**Document Type:** Architecture Design  
**Version:** 1.0  
**Created:** November 4, 2025  
**Status:** Planning Phase

---

## Document Purpose

This document defines the architectural foundation for rebuilding Agwakwagan from scratch. It establishes:
- Data structures and modeling approach
- State management patterns
- Component hierarchy and responsibilities
- Key technical decisions and rationale
- Performance considerations
- Extension points for future features

This is the **blueprint** - the foundational design that all implementation flows from.

---

## 1. System Overview

### 1.1 Goals

**Primary Goal:** Create a robust, performant kanban board for desktop power users managing complex projects.

**Key Principles:**
1. **Performance First** - Smooth with 100+ cards
2. **Desktop-Centric** - Keyboard shortcuts, bulk operations, multi-select
3. **Data Safety** - Never lose user work
4. **Extensible** - Easy to add features (undo, tags, multi-board)
5. **Simple Initially** - Start with core, layer features progressively

### 1.2 Core Capabilities (MVP)

- Multiple columns (TODO, In Progress, Done, custom)
- Cards with title, description, notes
- Drag & drop cards between columns
- Add/edit/delete cards and columns
- Persistent storage (LocalStorage)
- Export/import board data
- Dark/light theme
- Auto-save with indicator

### 1.3 Constraints

- **Desktop-only** - No mobile optimization needed
- **Single user** - No collaboration features initially
- **Client-side only** - No backend/API required
- **Modern browsers** - Chrome, Firefox, Safari (latest 2 versions)

---

## 2. Data Model

### 2.1 Design Philosophy: Normalized State

**Decision:** Use normalized (flat) data structure instead of nested.

**Why Normalized?**

**Nested (Current/Bad):**
```typescript
{
  columns: [
    {
      id: 'col-1',
      title: 'TODO',
      cards: [
        { id: 'card-1', title: 'Task 1' },
        { id: 'card-2', title: 'Task 2' }
      ]
    }
  ]
}
```

**Problems:**
- Moving card = splice from array, splice into array (O(n) operations)
- Updating card = search through columns, find card
- Undo/redo = store entire nested structure
- Performance degrades with scale

**Normalized (Better):**
```typescript
{
  cards: {
    'card-1': { id: 'card-1', title: 'Task 1', columnId: 'col-1', order: 0 },
    'card-2': { id: 'card-2', title: 'Task 2', columnId: 'col-1', order: 1 }
  },
  columns: {
    'col-1': { id: 'col-1', title: 'TODO', order: 0 },
    'col-2': { id: 'col-2', title: 'Done', order: 1 }
  },
  columnOrder: ['col-1', 'col-2']
}
```

**Benefits:**
- Moving card = change one field (`columnId` + `order`)
- Find card = O(1) lookup by ID
- Undo/redo = store minimal diffs
- Updates don't require deep traversal
- Easier to add indexes, filters, search

**Analogy:** Database with foreign keys vs. nested JSON documents

### 2.2 Type Definitions

```typescript
// Core Types
export interface Card {
  id: string;                    // 'card-{timestamp}-{random}'
  title: string;                 // Required, 1-500 chars
  description?: string;          // Optional, rich text later
  columnId: string;              // Foreign key to Column
  order: number;                 // Position within column (0-indexed)
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];               // Future: ['urgent', 'bug']
  dueDate?: Date;                // Future
  notes: Note[];                 // Sub-items
}

export interface Note {
  id: string;                    // 'note-{timestamp}-{random}'
  text: string;                  // Required, 1-2000 chars
  createdAt: Date;
}

export interface Column {
  id: string;                    // 'col-{timestamp}-{random}'
  title: string;                 // Required, 1-100 chars
  order: number;                 // Position in board (0-indexed)
  color?: string;                // Future: custom column colors
  cardLimit?: number;            // Future: WIP limits
}

export interface Board {
  cards: Record<string, Card>;   // Dictionary/map by card ID
  columns: Record<string, Column>; // Dictionary/map by column ID
  columnOrder: string[];         // Array of column IDs for render order
  metadata: BoardMetadata;
}

export interface BoardMetadata {
  version: string;               // Data schema version (e.g., '1.0')
  createdAt: Date;
  updatedAt: Date;
  title?: string;                // Future: named boards
}

// Derived/Computed Types
export interface ColumnWithCards extends Column {
  cards: Card[];                 // Cards for this column, sorted by order
}
```

### 2.3 ID Generation Strategy

**Pattern:** `{type}-{timestamp}-{random}`

```typescript
function generateId(type: 'card' | 'column' | 'note'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${type}-${timestamp}-${random}`;
}
```

**Why this pattern?**
- Type prefix aids debugging
- Timestamp provides rough chronological sorting
- Random suffix prevents collisions
- Sortable (mostly) without extra logic
- Human-readable in export files

### 2.4 Default Board State

```typescript
const DEFAULT_BOARD: Board = {
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

---

## 3. State Management

### 3.1 Hook Architecture

**Separation of Concerns:** Split state management into focused hooks.

```
┌─────────────────────────────────────┐
│         Component Layer             │
│  (KanbanBoard, Column, Card, etc.)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Composition Hook Layer         │
│                                     │
│  useBoard()                         │
│  ├─ useBoardState()                 │
│  ├─ useBoardActions()               │
│  ├─ useBoardSelectors()             │
│  └─ useBoardUndo()                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Persistence Layer              │
│  useLocalStorage()                  │
└─────────────────────────────────────┘
```

### 3.2 Hook Responsibilities

#### `useBoardState()`
**Purpose:** Manage board data, no business logic

```typescript
export function useBoardState() {
  const [board, setBoard, isLoaded] = useLocalStorage<Board>(
    'agwakwagan-board',
    DEFAULT_BOARD
  );
  
  return { board, setBoard, isLoaded };
}
```

**Returns:**
- `board` - Current board state
- `setBoard` - Raw setter (used by actions)
- `isLoaded` - Loading status

#### `useBoardActions()`
**Purpose:** Business logic for mutations

```typescript
export function useBoardActions(board: Board, setBoard: (b: Board) => void) {
  const addCard = useCallback((columnId: string, title: string, description?: string) => {
    const newCard: Card = {
      id: generateId('card'),
      title,
      description,
      columnId,
      order: getNextOrderInColumn(board, columnId),
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
  
  const moveCard = useCallback((cardId: string, toColumnId: string, newOrder: number) => {
    const card = board.cards[cardId];
    if (!card) return;
    
    setBoard({
      ...board,
      cards: {
        ...board.cards,
        [cardId]: {
          ...card,
          columnId: toColumnId,
          order: newOrder,
          updatedAt: new Date()
        }
      },
      metadata: {
        ...board.metadata,
        updatedAt: new Date()
      }
    });
  }, [board, setBoard]);
  
  // ... more actions: deleteCard, updateCard, addColumn, etc.
  
  return {
    addCard,
    moveCard,
    deleteCard,
    updateCard,
    addColumn,
    deleteColumn,
    addNote,
    deleteNote
  };
}
```

**Why separate?** 
- Actions hook has complex logic, testable in isolation
- State hook is simple, just storage wrapper
- Easy to add middleware (logging, undo tracking)

#### `useBoardSelectors()`
**Purpose:** Derived data, memoized queries

```typescript
export function useBoardSelectors(board: Board) {
  // Get all cards for a column, sorted by order
  const getColumnCards = useCallback((columnId: string): Card[] => {
    return Object.values(board.cards)
      .filter(card => card.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }, [board.cards]);
  
  // Get column with its cards
  const getColumnWithCards = useCallback((columnId: string): ColumnWithCards | null => {
    const column = board.columns[columnId];
    if (!column) return null;
    
    return {
      ...column,
      cards: getColumnCards(columnId)
    };
  }, [board.columns, getColumnCards]);
  
  // Get all columns with cards, in order
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

**Why separate?**
- Expensive computations memoized
- Reusable across components
- Easy to optimize later (add caching, indexes)

#### `useBoardUndo()`
**Purpose:** Undo/redo functionality (future)

```typescript
export function useBoardUndo() {
  const [history, setHistory] = useState<Board[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const pushHistory = (board: Board) => {
    // Truncate future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(board);
    
    // Keep last 50 states only
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const undo = (): Board | null => {
    if (historyIndex <= 0) return null;
    setHistoryIndex(historyIndex - 1);
    return history[historyIndex - 1];
  };
  
  const redo = (): Board | null => {
    if (historyIndex >= history.length - 1) return null;
    setHistoryIndex(historyIndex + 1);
    return history[historyIndex + 1];
  };
  
  return { pushHistory, undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1 };
}
```

#### `useBoard()` (Composition)
**Purpose:** Combine all hooks, expose unified API

```typescript
export function useBoard() {
  const { board, setBoard, isLoaded } = useBoardState();
  const actions = useBoardActions(board, setBoard);
  const selectors = useBoardSelectors(board);
  const undo = useBoardUndo();
  
  // Wrap setBoard to push to history
  const setBoardWithHistory = useCallback((newBoard: Board) => {
    undo.pushHistory(board);
    setBoard(newBoard);
  }, [board, setBoard, undo]);
  
  return {
    // State
    board,
    isLoaded,
    
    // Actions
    ...actions,
    
    // Selectors
    ...selectors,
    
    // Undo
    undo: undo.undo,
    redo: undo.redo,
    canUndo: undo.canUndo,
    canRedo: undo.canRedo
  };
}
```

### 3.3 Benefits of This Architecture

**Testability:**
```typescript
// Test actions in isolation
const mockBoard = { /* ... */ };
const mockSetBoard = jest.fn();
const { addCard } = useBoardActions(mockBoard, mockSetBoard);
addCard('col-1', 'Test Card');
expect(mockSetBoard).toHaveBeenCalledWith(/* expected board */);
```

**Performance:**
- Selectors memoized - avoid recomputing derived data
- Components only re-render when their slice of state changes
- Easy to add React.memo() boundaries

**Extensibility:**
- Add new action? Just add to useBoardActions
- Need search? Add to useBoardSelectors
- Want autosave? Wrap setBoard in useBoard
- Multi-board? Replace useBoardState with useBoardsState

---

## 4. Component Architecture

### 4.1 Component Tree

```
App
└── KanbanBoard
    ├── BoardHeader
    │   ├── ThemeToggle
    │   ├── ExportButton
    │   ├── ImportButton
    │   └── AddColumnButton
    ├── ColumnList
    │   └── Column (multiple)
    │       ├── ColumnHeader
    │       │   ├── ColumnTitle (inline editable)
    │       │   └── ColumnActions (delete, etc.)
    │       ├── CardList
    │       │   └── Card (multiple)
    │       │       ├── CardContent (click to expand)
    │       │       └── CardActions (edit, delete)
    │       └── AddCardButton
    └── SaveStatus
```

### 4.2 Component Responsibilities

#### `KanbanBoard`
- Root component
- Consumes useBoard hook
- Manages DragDropContext
- Passes data down to children
- No direct DOM rendering (composition only)

#### `ColumnList`
- Renders all columns in order
- Handles horizontal layout (flex)
- No business logic

#### `Column`
- Renders single column
- Contains Droppable from dnd library
- Manages "add card" state
- Receives: column data, action callbacks

#### `Card`
- Renders single card
- Contains Draggable from dnd library
- Inline expansion (no modal)
- Receives: card data, action callbacks

#### `CardContent`
- Displays card details (title, description, notes)
- Toggles between collapsed/expanded views
- Inline editing for title/description

### 4.3 Data Flow

**Unidirectional:** Data flows down, actions flow up

```
useBoard() [top]
    │
    ├──> board.columns ──────────> ColumnList ──> Column
    │                                               │
    ├──> selectors.getColumnCards(id) ─────────────┤
    │                                               │
    │                                               ├──> CardList ──> Card
    │
    └──> actions.moveCard() <──────────────────────┘
         actions.updateCard() <─────────────────────┘
```

**No prop drilling:** Use composition, not deep passing

**Example:**
```tsx
// Good: Compose at top level
<KanbanBoard>
  {columnsWithCards.map(column => (
    <Column 
      key={column.id}
      column={column}
      onMoveCard={actions.moveCard}
      onUpdateCard={actions.updateCard}
    />
  ))}
</KanbanBoard>

// Bad: Pass everything through 3 levels
<KanbanBoard board={board} actions={actions}>
  <ColumnList board={board} actions={actions}>
    <Column board={board} actions={actions} />
  </ColumnList>
</KanbanBoard>
```

---

## 5. Key Technical Decisions

### 5.1 Drag and Drop Library

**Decision:** Use `@hello-pangea/dnd`

**Why:**
- Maintained fork of react-beautiful-dnd
- Excellent accessibility
- Smooth animations
- Keyboard support built-in
- Proven at scale

**Alternatives Considered:**
- `dnd-kit` - More flexible but more complex
- `react-dnd` - Older, less polished UX
- Custom implementation - Reinventing wheel

### 5.2 Persistence Layer

**Decision:** LocalStorage with structured validation

**Why:**
- Zero setup, works immediately
- 5-10MB sufficient for typical use
- Synchronous API (simpler than IndexedDB)
- Easy export/import (JSON)

**Migration Path:**
- If hitting size limits → IndexedDB
- If collaboration needed → Backend + sync
- But defer until proven need (YAGNI)

### 5.3 Styling Approach

**Decision:** Tailwind CSS + CSS Variables for theming

**Why:**
- Utility-first is fast for iteration
- CSS variables enable dynamic theming
- Ozhiaki brand colors centralized
- No CSS-in-JS runtime cost

**Structure:**
```css
/* globals.css */
:root {
  --color-primary: #6a0032;
  /* ... */
}

.dark {
  --color-primary: #8b0041;
  /* ... */
}
```

```tsx
// Component
<div className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
```

### 5.4 Animation Strategy

**Decision:** Framer Motion for complex animations, CSS for simple transitions

**Why:**
- Framer Motion: Drag previews, page transitions, complex sequences
- CSS: Hover states, color changes (less overhead)

**Guidelines:**
- Use CSS `transition` for <200ms effects
- Use Framer Motion for layout animations, entrance/exit
- Prefer `layoutId` for position transitions

### 5.5 TypeScript Configuration

**Decision:** Strict mode enabled

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

**Why:**
- Catch bugs at compile time
- Better autocomplete
- Self-documenting code
- Worth the initial friction

---

## 6. Performance Strategy

### 6.1 Current Scale (No Optimization Needed)

**Target:** 0-200 cards across 3-10 columns

**Rendering:** All cards render, no virtualization
- Modern browsers handle this easily
- Simpler code, fewer bugs
- Premature optimization is evil

### 6.2 Future Scale (If Needed)

**Trigger:** >200 cards OR noticeable lag

**Solution:** Virtual scrolling with `react-window`

```tsx
// Future implementation
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={column.cards.length}
  itemSize={100}
>
  {({ index, style }) => (
    <Card card={column.cards[index]} style={style} />
  )}
</FixedSizeList>
```

**Only implement when proven necessary.**

### 6.3 Optimization Checklist

Optimize in this order (only if needed):

1. **Memoization** - React.memo() on Card component
2. **Selector optimization** - Cache derived data
3. **Virtualization** - Render visible cards only
4. **Web Workers** - Offload search/filter
5. **IndexedDB** - If storage size issue

**Rule:** Measure before optimizing. No premature optimization.

---

## 7. Extension Points

### 7.1 Adding Undo/Redo

**Already designed in:** `useBoardUndo()` hook exists

**Implementation:**
1. Uncomment undo hook in useBoard()
2. Add keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
3. Add UI buttons in BoardHeader

**Data structure supports:** Normalized state = easy diffing

### 7.2 Adding Tags/Labels

**Data change:**
```typescript
interface Card {
  // ... existing fields
  tags?: string[]; // Add this
}

interface Board {
  // ... existing
  tags: Record<string, Tag>; // Add this
}

interface Tag {
  id: string;
  label: string;
  color: string;
}
```

**UI change:**
- TagSelector component in Card
- Filter by tag in ColumnHeader
- Tag management in settings

### 7.3 Adding Multi-Board Support

**Data change:**
```typescript
interface AppState {
  boards: Record<string, Board>; // Multiple boards
  activeBoardId: string;          // Currently viewing
}
```

**State change:**
- Replace useBoardState with useBoardsState
- Add board switcher in header
- Export/import per board

### 7.4 Adding Search/Filter

**No schema change needed!**

**Implementation:**
```typescript
// In useBoardSelectors
const searchCards = useCallback((query: string): Card[] => {
  return Object.values(board.cards).filter(card =>
    card.title.toLowerCase().includes(query.toLowerCase()) ||
    card.description?.toLowerCase().includes(query.toLowerCase())
  );
}, [board.cards]);
```

Add search bar in BoardHeader, filter rendered cards.

### 7.5 Adding Collaboration (Future)

**Major refactor required:**
- Backend API for board storage
- WebSocket for real-time updates
- Conflict resolution (CRDTs or operational transforms)
- User authentication

**But:** Normalized data model makes this easier
- Changes are small diffs (e.g., "card X moved to column Y")
- No need to sync entire nested structure

---

## 8. Migration Plan

### 8.1 From Old App

**Strategy:** Fresh start, no migration

**Why:**
- Old data structure incompatible
- Likely small amount of user data (development phase)
- Clean break allows best architecture

**If migration needed:**
1. Export from old app (JSON)
2. Write transformer script
3. Import to new app

### 8.2 Future Schema Versions

**Forward compatibility:**

```typescript
interface Board {
  metadata: {
    version: string; // '1.0', '1.1', '2.0'
    // ...
  }
}

function migrateBoard(board: any): Board {
  const version = board.metadata?.version || '1.0';
  
  if (version === '1.0') {
    return board; // Current version
  }
  
  if (version === '0.9') {
    // Upgrade from old schema
    return upgradeFrom0_9(board);
  }
  
  throw new Error(`Unsupported board version: ${version}`);
}
```

Always include version in exports for future-proofing.

---

## 9. Development Workflow

### 9.1 Build Phases

**Phase 1: Static Rendering (4-6 hours)**
- Render columns and cards (no drag)
- Add/delete cards/columns
- Basic styling with Ozhiaki theme
- **Goal:** Can create board visually

**Phase 2: Drag & Drop (4-6 hours)**
- Integrate @hello-pangea/dnd
- Implement moveCard action
- Smooth animations
- **Goal:** Functional kanban movement

**Phase 3: Persistence (2-3 hours)**
- LocalStorage hook
- Auto-save
- Data validation
- **Goal:** Data survives refresh

**Phase 4: Polish (3-4 hours)**
- Export/import
- Inline editing
- Keyboard shortcuts
- **Goal:** Production-ready MVP

**Total Estimate:** 13-19 hours for MVP

### 9.2 Testing Strategy

**Unit Tests:**
- useBoardActions (all mutations)
- useBoardSelectors (derived data)
- Data validation functions

**Integration Tests:**
- Full user flows (create card → move → delete)
- Export/import round-trip
- LocalStorage persistence

**Manual Testing:**
- Keyboard navigation
- Theme switching
- Browser compatibility

**Tools:**
- Jest for unit tests
- React Testing Library for components
- Playwright for E2E (optional, later)

---

## 10. Open Questions / Decisions Needed

### 10.1 Card Display Mode

**Question:** Inline expansion vs. modal for card details?

**Option A: Inline Expansion**
- Card grows in place when clicked
- Maintains context (see other cards)
- More complex layout shifts

**Option B: Modal/Sidebar**
- Overlay/panel for details
- Simpler layout (no shifts)
- Loses board context

**Recommendation:** Start with inline, can add modal later if needed

### 10.2 Column Width Strategy

**Question:** Fixed, flexible, or configurable?

**Option A: Fixed Width (e.g., 300px)**
- Simple, predictable
- Horizontal scroll with many columns

**Option B: Flexible (flex: 1)**
- Uses available space
- Columns shrink with many columns

**Option C: Configurable**
- User sets per column
- Most complex

**Recommendation:** Flexible with min/max (flex: 1 1 300px, max-width: 400px)

### 10.3 Bulk Operations UI

**Question:** How to select multiple cards?

**Options:**
- Checkbox mode (toggle, then select many)
- Shift+Click (select range)
- Cmd+Click (multi-select)

**Recommendation:** All three - checkbox mode for obvious discoverability, keyboard for power users

---

## 11. Success Criteria

### Architecture is successful if:

- ✅ Adding new features is straightforward
- ✅ No performance issues with 200 cards
- ✅ Data model supports planned extensions
- ✅ Components are testable in isolation
- ✅ State updates are predictable
- ✅ Code is maintainable by future developers

### Red flags to avoid:

- ❌ Deep prop drilling (>3 levels)
- ❌ Large components (>300 lines)
- ❌ Tight coupling between components
- ❌ Performance hacks (should be clean first)
- ❌ Magic numbers / hardcoded values

---

## 12. References & Inspiration

**State Management Patterns:**
- Redux (normalized state, actions/reducers pattern)
- Recoil (atom-based selectors)
- Zustand (simple stores)

**Kanban Implementations:**
- Trello (classic kanban UX)
- Linear (keyboard-first, fast)
- GitHub Projects (simple, effective)

**Data Modeling:**
- Database normalization principles
- Entity-relationship modeling
- DDD (Domain-Driven Design) patterns

---

## Appendix: Key Code Patterns

### Pattern 1: Immutable Updates

```typescript
// Adding a card
const newBoard = {
  ...board,
  cards: {
    ...board.cards,
    [newCard.id]: newCard
  }
};

// Updating a card
const newBoard = {
  ...board,
  cards: {
    ...board.cards,
    [cardId]: {
      ...board.cards[cardId],
      title: newTitle
    }
  }
};

// Deleting a card
const { [cardId]: removed, ...remainingCards } = board.cards;
const newBoard = {
  ...board,
  cards: remainingCards
};
```

### Pattern 2: Selector with Memoization

```typescript
const getAllColumnsWithCards = useMemo(() => {
  return board.columnOrder
    .map(colId => ({
      ...board.columns[colId],
      cards: Object.values(board.cards)
        .filter(card => card.columnId === colId)
        .sort((a, b) => a.order - b.order)
    }));
}, [board.columnOrder, board.columns, board.cards]);
```

### Pattern 3: Action with Validation

```typescript
const addCard = useCallback((columnId: string, title: string) => {
  // Validation
  if (!title.trim()) {
    throw new Error('Card title cannot be empty');
  }
  if (!board.columns[columnId]) {
    throw new Error(`Column ${columnId} does not exist`);
  }
  
  // Generate ID
  const cardId = generateId('card');
  
  // Create card
  const newCard: Card = {
    id: cardId,
    title: title.trim(),
    columnId,
    order: getMaxOrder(board.cards, columnId) + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: []
  };
  
  // Update state
  setBoard({
    ...board,
    cards: { ...board.cards, [cardId]: newCard },
    metadata: { ...board.metadata, updatedAt: new Date() }
  });
  
  return cardId; // Return for caller to use
}, [board, setBoard]);
```

---

**End of Architecture Design Document**

This document should be reviewed and approved before implementation begins. Updates to this document should be versioned and all changes discussed with the team.
