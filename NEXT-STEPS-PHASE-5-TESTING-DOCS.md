# Phase 5: Testing & Documentation

**Prerequisites:** Phase 2 (UI/UX) Complete (minimum)
**Estimated Time:** 2-3 hours
**Priority:** HIGH (Critical for production confidence)

---

## Overview

Phase 5 adds **testing infrastructure and comprehensive documentation** to ensure stability and maintainability. This phase focuses on:

1. Adding Vitest framework for unit testing
2. Writing tests for core business logic (moveCard, addCard)
3. Creating comprehensive README
4. Documenting architecture for future contributors

**Why This Matters:**
- **Prevent regressions:** Tests catch bugs before they reach production
- **Enable refactoring:** Change code with confidence
- **Team collaboration:** Documentation helps onboarding
- **Agent integration:** Clear docs help AI agents understand the codebase

---

## Task 5.1: Add Vitest Testing Framework (30 min)

### Why Vitest?

Vitest is the recommended testing framework for Vite/Next.js projects:
- ✅ Native TypeScript support
- ✅ Fast (parallel execution)
- ✅ Compatible with Jest API (familiar)
- ✅ Works with Next.js out of the box
- ✅ Hot module replacement for tests

### Installation

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

### Configuration

**New File: `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**New File: `tests/setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

### Update package.json Scripts

**File: `package.json`**

Add test scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Acceptance Criteria
- [ ] Vitest installed and configured
- [ ] `npm test` runs test suite
- [ ] `npm run test:ui` opens interactive UI
- [ ] TypeScript paths (@/) resolve correctly

---

## Task 5.2: Write Core Logic Tests (1-1.5 hours)

### Test Priority

Focus on **core business logic** that's most likely to break:
1. **HIGH:** moveCard (complex, already had bugs)
2. **HIGH:** addCard (critical functionality)
3. **MEDIUM:** Board selectors
4. **LOW:** UI components (Phase 6)

### Test File Structure

```
tests/
├── setup.ts
├── hooks/
│   ├── useBoardActions.test.ts  (moveCard, addCard)
│   └── useBoardSelectors.test.ts
├── utils/
│   ├── ids.test.ts
│   └── export.test.ts
└── lib/
    └── datasources/
        └── localStorage.test.ts
```

### Test: moveCard Logic

**New File: `tests/hooks/useBoardActions.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardActions } from '@/hooks/useBoardActions';
import { Board, Card } from '@/types/board';
import { DEFAULT_BOARD } from '@/utils/constants';

describe('useBoardActions', () => {
  let testBoard: Board;
  let setBoard: (board: Board) => void;
  let capturedBoard: Board;

  beforeEach(() => {
    // Create test board with cards
    testBoard = {
      ...DEFAULT_BOARD,
      cards: {
        'card-1': {
          id: 'card-1',
          title: 'Card 1',
          columnId: 'col-todo',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: [],
        },
        'card-2': {
          id: 'card-2',
          title: 'Card 2',
          columnId: 'col-todo',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: [],
        },
        'card-3': {
          id: 'card-3',
          title: 'Card 3',
          columnId: 'col-in-progress',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: [],
        },
      },
    };

    // Capture board updates
    setBoard = (board: Board) => {
      capturedBoard = board;
    };
  });

  describe('moveCard', () => {
    it('should move card within same column', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      act(() => {
        result.current.moveCard('card-1', 'col-todo', 1);
      });

      // card-1 should now be at position 1
      expect(capturedBoard.cards['card-1'].order).toBe(1);
      // card-2 should now be at position 0
      expect(capturedBoard.cards['card-2'].order).toBe(0);
    });

    it('should move card to different column', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      act(() => {
        result.current.moveCard('card-1', 'col-in-progress', 1);
      });

      // card-1 should be in new column at position 1
      expect(capturedBoard.cards['card-1'].columnId).toBe('col-in-progress');
      expect(capturedBoard.cards['card-1'].order).toBe(1);

      // card-3 should be at position 0 (was there already)
      expect(capturedBoard.cards['card-3'].order).toBe(0);

      // card-2 should now be the only card in col-todo at position 0
      expect(capturedBoard.cards['card-2'].columnId).toBe('col-todo');
      expect(capturedBoard.cards['card-2'].order).toBe(0);
    });

    it('should handle moving to empty column', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      act(() => {
        result.current.moveCard('card-1', 'col-done', 0);
      });

      // card-1 should be in done column at position 0
      expect(capturedBoard.cards['card-1'].columnId).toBe('col-done');
      expect(capturedBoard.cards['card-1'].order).toBe(0);
    });

    it('should maintain sequential order numbers', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      act(() => {
        result.current.moveCard('card-1', 'col-in-progress', 0);
      });

      // Get all cards in col-in-progress, sorted by order
      const progressCards = Object.values(capturedBoard.cards)
        .filter((c) => c.columnId === 'col-in-progress')
        .sort((a, b) => a.order - b.order);

      // Orders should be 0, 1 (no gaps)
      expect(progressCards[0].order).toBe(0);
      expect(progressCards[1].order).toBe(1);
    });

    it('should do nothing when moving to same position', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      const originalBoard = { ...testBoard };

      act(() => {
        result.current.moveCard('card-1', 'col-todo', 0);
      });

      // Board should not change
      expect(capturedBoard).toBeUndefined(); // setBoard was not called
    });

    it('should update timestamps', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      const beforeMove = new Date();

      act(() => {
        result.current.moveCard('card-1', 'col-in-progress', 0);
      });

      // updatedAt should be recent
      expect(capturedBoard.cards['card-1'].updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeMove.getTime()
      );
      expect(capturedBoard.metadata.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeMove.getTime()
      );
    });
  });

  describe('addCard', () => {
    it('should add card to column', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      act(() => {
        result.current.addCard('col-todo', 'New Card', 'Description here');
      });

      // Should have 4 cards now
      expect(Object.keys(capturedBoard.cards).length).toBe(4);

      // Find the new card
      const newCard = Object.values(capturedBoard.cards).find(
        (c) => c.title === 'New Card'
      );

      expect(newCard).toBeDefined();
      expect(newCard?.columnId).toBe('col-todo');
      expect(newCard?.description).toBe('Description here');
      expect(newCard?.order).toBe(2); // After card-1 and card-2
    });

    it('should trim whitespace from title', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      act(() => {
        result.current.addCard('col-todo', '  Trimmed Card  ');
      });

      const newCard = Object.values(capturedBoard.cards).find(
        (c) => c.title === 'Trimmed Card'
      );

      expect(newCard).toBeDefined();
    });

    it('should reject empty title', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      act(() => {
        result.current.addCard('col-todo', '   ');
      });

      // Should not add card
      expect(capturedBoard).toBeUndefined();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should assign sequential order', () => {
      const { result } = renderHook(() =>
        useBoardActions(testBoard, setBoard)
      );

      act(() => {
        result.current.addCard('col-todo', 'Card A');
      });

      const cardA = Object.values(capturedBoard.cards).find(
        (c) => c.title === 'Card A'
      );
      expect(cardA?.order).toBe(2); // After existing 0 and 1

      act(() => {
        result.current.addCard('col-todo', 'Card B');
      });

      const cardB = Object.values(capturedBoard.cards).find(
        (c) => c.title === 'Card B'
      );
      expect(cardB?.order).toBe(3); // After Card A
    });
  });
});
```

### Test: Board Selectors

**New File: `tests/hooks/useBoardSelectors.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBoardSelectors } from '@/hooks/useBoardSelectors';
import { Board } from '@/types/board';
import { DEFAULT_BOARD } from '@/utils/constants';

describe('useBoardSelectors', () => {
  let testBoard: Board;

  beforeEach(() => {
    testBoard = {
      ...DEFAULT_BOARD,
      cards: {
        'card-1': {
          id: 'card-1',
          title: 'Card 1',
          columnId: 'col-todo',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: [],
        },
        'card-2': {
          id: 'card-2',
          title: 'Card 2',
          columnId: 'col-todo',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: [],
        },
        'card-3': {
          id: 'card-3',
          title: 'Card 3',
          columnId: 'col-in-progress',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: [],
        },
      },
    };
  });

  it('should get all columns with cards', () => {
    const { result } = renderHook(() => useBoardSelectors(testBoard));

    const columns = result.current.getAllColumnsWithCards;

    expect(columns).toHaveLength(3); // todo, in-progress, done
    expect(columns[0].cards).toHaveLength(2); // todo has 2 cards
    expect(columns[1].cards).toHaveLength(1); // in-progress has 1 card
    expect(columns[2].cards).toHaveLength(0); // done has 0 cards
  });

  it('should sort cards by order within column', () => {
    const { result } = renderHook(() => useBoardSelectors(testBoard));

    const todoColumn = result.current.getAllColumnsWithCards[0];

    expect(todoColumn.cards[0].id).toBe('card-1'); // order 0
    expect(todoColumn.cards[1].id).toBe('card-2'); // order 1
  });
});
```

### Acceptance Criteria
- [ ] moveCard tests cover: same column, different column, empty column
- [ ] moveCard tests verify sequential order maintenance
- [ ] addCard tests cover: valid input, trimming, empty title rejection
- [ ] Selector tests verify column/card retrieval
- [ ] All tests pass: `npm run test:run`
- [ ] Test coverage > 70% for core logic

---

## Task 5.3: Create Comprehensive README (1 hour)

### Purpose

The README is the **entry point for all contributors** (human and AI). It should:
- Explain what the project is
- Show how to get started
- Document architecture
- Guide extension and contribution

**New File: `README.md`**

```markdown
# Agwakwagan

**A production-ready kanban board with API integration and agent collaboration support.**

> **Agwakwagan** (Ojibwe): "To cast a shadow" - Your tasks and workflows, visualized.

---

## Overview

Agwakwagan is a flexible kanban board application designed for:
- **Production workflows:** Task tracking with auto-save and data persistence
- **Multi-source integration:** Connect to APIs, Beads issue tracker, or custom data sources
- **Agent collaboration:** Built-in support for AI agents working on tasks
- **General-purpose monitoring:** Use as a front-end for any process (schedules, issues, pipelines)

### Current Status

**✅ Phase 1 Complete:** Core functionality stable (drag & drop, persistence, export)
**🔄 In Progress:** UI polish, API preparation, Beads integration

---

## Features

### ✅ Implemented
- 🎯 Drag & drop cards between columns
- 💾 Auto-save to localStorage (debounced)
- 📤 Export boards to JSON
- 🌓 Light/dark theme toggle
- ⌨️ Keyboard shortcuts (Ctrl/Cmd+E for export)
- 📊 Real-time save status indicators
- 🎨 Responsive layout (desktop-first)

### 🔄 In Progress (Phases 2-6)
- 🎨 Professional UI polish (animations, spacing, colors)
- 🔌 Multi-data-source support (API, Beads, custom)
- 🔗 External system integration (Beads issues, GitHub, Jira)
- 🧪 Test coverage for core logic
- ♿ Accessibility improvements

### 🎯 Planned (Phases 7-8)
- 🤖 Agent collaboration (task claiming, progress updates)
- 🔄 Real-time sync with external systems
- 🔍 Filtering, search, and tags
- ↩️ Undo/redo functionality

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

\`\`\`bash
# Clone repository
git clone <repo-url>
cd agwakwagan

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

---

## Architecture

### Technology Stack

- **Framework:** Next.js 16 (React 19, TypeScript 5)
- **Drag & Drop:** @hello-pangea/dnd
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Testing:** Vitest + React Testing Library

### Data Model

Agwakwagan uses a **normalized data structure** for optimal performance:

\`\`\`typescript
interface Board {
  id: string;
  cards: Record<string, Card>;      // Dictionary (O(1) lookups)
  columns: Record<string, Column>;  // Dictionary
  columnOrder: string[];            // Render order
  metadata: BoardMetadata;
  dataSourceId?: string;            // For multi-source support
}
\`\`\`

**Why normalized?**
- Fast lookups (O(1) by ID)
- Easy updates (change one field, not entire array)
- Scalable (works with 100s of cards)
- Simpler undo/redo (store diffs, not full state)

### Hook Architecture

```
useBoard (composition)
├── useBoardState (data + persistence)
├── useBoardActions (mutations: addCard, moveCard)
└── useBoardSelectors (derived state: getAllColumnsWithCards)
```

**Separation of concerns:**
- State management in hooks, not components
- Components are pure/presentational
- Actions are memoized with useCallback
- Easy to test logic independently

### Storage Abstraction

\`\`\`typescript
interface DataSource {
  loadBoard(id: string): Promise<Board>;
  saveBoard(board: Board): Promise<void>;
}
\`\`\`

**Implementations:**
- `LocalStorageDataSource` (current)
- `ApiDataSource` (Phase 7)
- `BeadsDataSource` (Phase 8)

Swap backends without changing component code!

---

## Project Structure

\`\`\`
agwakwagan/
├── app/                  # Next.js app directory
│   ├── page.tsx         # Main kanban page
│   └── globals.css      # Global styles + theme variables
├── components/          # React components
│   ├── KanbanBoard.tsx  # Root board component
│   ├── Column.tsx       # Column with cards
│   ├── Card.tsx         # Individual card
│   ├── BoardHeader.tsx  # Header with controls
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useBoard.ts      # Composition hook
│   ├── useBoardState.ts # State management
│   ├── useBoardActions.ts # Mutations
│   └── useBoardSelectors.ts # Derived state
├── types/               # TypeScript type definitions
│   ├── board.ts         # Core types (Board, Card, Column)
│   └── datasource.ts    # Data source abstraction
├── utils/               # Utility functions
│   ├── ids.ts           # ID generation
│   ├── export.ts        # Board export
│   └── constants.ts     # Default values
├── lib/                 # Third-party integrations
│   └── datasources/     # Data source implementations
├── tests/               # Vitest tests
└── docs/                # Additional documentation
\`\`\`

---

## Development

### Running Tests

\`\`\`bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Open test UI
npm run test:ui

# Generate coverage report
npm run test:coverage
\`\`\`

### Code Quality

\`\`\`bash
# Type check
npm run build

# Lint
npm run lint
\`\`\`

### Hot Reloading

The dev server supports hot module replacement. Changes to components, hooks, and styles apply instantly without losing state.

---

## Extending Agwakwagan

### Adding a New Data Source

1. Implement the `DataSource` interface:

\`\`\`typescript
// lib/datasources/mySource.ts
import { DataSource } from '@/types/datasource';

export class MyDataSource implements DataSource {
  async loadBoard(id: string): Promise<Board> {
    // Fetch board data from your system
  }

  async saveBoard(board: Board): Promise<void> {
    // Save board data to your system
  }
}
\`\`\`

2. Use in `useBoardState`:

\`\`\`typescript
const mySource = new MyDataSource(config);
const { board, setBoard } = useBoardState('board-id', mySource);
\`\`\`

### Adding Custom Actions

1. Add action to `useBoardActions`:

\`\`\`typescript
const myCustomAction = useCallback((param: string) => {
  // Modify board immutably
  const updatedBoard = { ...board, /* changes */ };
  setBoard(updatedBoard);
}, [board, setBoard]);

return { addCard, moveCard, myCustomAction };
\`\`\`

2. Use in components:

\`\`\`typescript
const { myCustomAction } = useBoard();
\`\`\`

---

## Configuration

### Theme

Themes are defined in `app/globals.css` using CSS custom properties:

\`\`\`css
:root {
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-primary: #3b82f6;
  /* ... */
}

[data-theme='dark'] {
  --color-bg: #1f2937;
  --color-text: #f3f4f6;
  /* ... */
}
\`\`\`

Toggle with `useTheme()` hook.

### Storage

Default storage key: `agwakwagan-{boardId}`

Clear storage:
\`\`\`javascript
localStorage.removeItem('agwakwagan-board-default');
\`\`\`

---

## Roadmap

See project documentation for detailed plans:
- [`PROJECT-OVERVIEW.md`](./PROJECT-OVERVIEW.md) - Strategy & decisions
- [`NEXT-STEPS-PHASE-2-UI-UX.md`](./NEXT-STEPS-PHASE-2-UI-UX.md) - UI improvements
- [`NEXT-STEPS-PHASE-3-API-PREP.md`](./NEXT-STEPS-PHASE-3-API-PREP.md) - API integration
- [`NEXT-STEPS-PHASE-4-BEADS-INTEGRATION.md`](./NEXT-STEPS-PHASE-4-BEADS-INTEGRATION.md) - Beads support
- [`NEXT-STEPS-PHASE-5-TESTING-DOCS.md`](./NEXT-STEPS-PHASE-5-TESTING-DOCS.md) - Testing & docs
- [`NEXT-STEPS-PHASE-6-POLISH.md`](./NEXT-STEPS-PHASE-6-POLISH.md) - Final polish

---

## Contributing

Contributions welcome! Please:
1. Check existing issues and PRs
2. Write tests for new features
3. Follow TypeScript strict mode
4. Use conventional commit messages
5. Update documentation

---

## License

MIT

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Drag & drop by [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- Inspired by [Trello](https://trello.com), [Linear](https://linear.app), and [Beads](https://github.com/steveyegge/beads)

---

**Made with Claude Code** 🤖
\`\`\`

### Acceptance Criteria
- [ ] README exists at project root
- [ ] Covers: overview, quick start, architecture, extending
- [ ] Links to phase documentation
- [ ] Clear code examples
- [ ] Professional formatting

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `vitest.config.ts` | CREATE | Vitest configuration |
| `tests/setup.ts` | CREATE | Test environment setup |
| `tests/hooks/useBoardActions.test.ts` | CREATE | moveCard & addCard tests |
| `tests/hooks/useBoardSelectors.test.ts` | CREATE | Selector tests |
| `README.md` | CREATE | Project documentation |
| `package.json` | MODIFY | Add test scripts |

---

## Success Criteria

Phase 5 is complete when:
- ✅ Vitest framework installed and working
- ✅ Core logic tests written and passing
- ✅ Test coverage > 70% for hooks
- ✅ Comprehensive README created
- ✅ Documentation references all phase docs
- ✅ `npm test` runs successfully
- ✅ Build still passes

---

## Next Phase

After Phase 5, you have a **documented and tested** codebase ready for:
- **Phase 6:** Final polish (performance, accessibility, error handling)
- **Phase 7:** API backend integration
- **Phase 8:** Agent collaboration and Beads integration

The testing foundation ensures you can make changes with confidence.
