# Phase 6: Polish & Performance

**Prerequisites:** Phases 2-5 Complete
**Estimated Time:** 2-3 hours
**Priority:** MEDIUM (Nice-to-have for production launch)

---

## Overview

Phase 6 adds the **final layer of production quality** through performance optimization, accessibility improvements, and robust error handling. This phase transforms a good application into a **great** one.

**Focus Areas:**
1. Performance optimization (React.memo, lazy loading)
2. Accessibility (ARIA, keyboard navigation)
3. Error handling (boundaries, user-friendly messages)

**Why This Matters:**
- **Performance:** Smooth experience with 100+ cards
- **Accessibility:** Usable by everyone (keyboard users, screen readers)
- **Reliability:** Graceful degradation when things go wrong

---

## Task 6.1: Performance Optimization (1 hour)

### Current Performance State

After Phase 2, the app has:
- ✅ Framer Motion animations
- ✅ Card memoization (added in Phase 1)
- ❌ No lazy loading
- ❌ No render optimization for large boards
- ❌ No performance monitoring

### Optimization Strategy

**1. Component Memoization**

Prevent unnecessary re-renders when board state changes:

**File: `components/Column.tsx`**

```typescript
import { memo } from 'react';

export const Column = memo(function Column({
  column,
  onAddCard,
}: ColumnProps) {
  // ... component logic
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if column data changes
  return (
    prevProps.column.id === nextProps.column.id &&
    prevProps.column.cards.length === nextProps.column.cards.length &&
    prevProps.column.title === nextProps.column.title
  );
});
```

**File: `components/BoardHeader.tsx`**

```typescript
import { memo } from 'react';

export const BoardHeader = memo(function BoardHeader({
  board,
  storageStatus,
  onImport,
}: BoardHeaderProps) {
  // ... component logic
}, (prevProps, nextProps) => {
  // Only re-render if storage status or board ID changes
  return (
    prevProps.board.id === nextProps.board.id &&
    prevProps.storageStatus?.saving === nextProps.storageStatus?.saving &&
    prevProps.storageStatus?.lastSaved === nextProps.storageStatus?.lastSaved
  );
});
```

**2. Lazy Loading**

Split code to reduce initial bundle size:

**File: `app/page.tsx` or main component**

```typescript
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const KanbanBoard = dynamic(() => import('@/components/KanbanBoard'), {
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <p>Loading board...</p>
    </div>
  ),
  ssr: false, // Disable SSR if using localStorage
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KanbanBoard />
    </Suspense>
  );
}
```

**3. Virtual Scrolling (Optional - for 100+ cards)**

If you expect very large boards, consider virtualization:

```bash
npm install react-window
```

**File: `components/Column.tsx`**

```typescript
import { FixedSizeList as List } from 'react-window';

// In Column component, wrap card list:
<List
  height={600}
  itemCount={column.cards.length}
  itemSize={120} // Average card height
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <Card card={column.cards[index]} index={index} />
    </div>
  )}
</List>
```

**4. Debounce Expensive Operations**

Already implemented for storage saves. Consider for search/filter (Phase 6+):

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    // Expensive search operation
  }, 300),
  []
);
```

**5. Performance Monitoring**

Add performance tracking:

**New File: `lib/performance.ts`**

```typescript
export function measurePerformance(name: string, fn: () => void): void {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    console.warn(`Performance: ${name} took ${duration.toFixed(2)}ms`);
  }
}

export function logRender(componentName: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Render: ${componentName}`);
  }
}
```

Use in components:

```typescript
useEffect(() => {
  logRender('KanbanBoard');
});
```

### Testing Performance

Create a large board for testing:

```typescript
// utils/dev.ts
export function generateLargeBoard(cardCount: number = 100): Board {
  const cards: Record<string, Card> = {};

  for (let i = 0; i < cardCount; i++) {
    const columnId = ['col-todo', 'col-in-progress', 'col-done'][i % 3];
    cards[`card-${i}`] = {
      id: `card-${i}`,
      title: `Card ${i}`,
      description: `Description for card ${i}`,
      columnId,
      order: Math.floor(i / 3),
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: [],
    };
  }

  return {
    ...DEFAULT_BOARD,
    cards,
  };
}
```

### Acceptance Criteria
- [ ] Column and Card components memoized
- [ ] Heavy components lazy loaded
- [ ] No visible lag with 50+ cards
- [ ] Drag & drop feels smooth
- [ ] Bundle size < 500KB (check with `npm run build`)

---

## Task 6.2: Accessibility Improvements (1 hour)

### Current Accessibility State

- ✅ Semantic HTML (mostly)
- ✅ Basic ARIA labels on buttons
- ❌ Incomplete keyboard navigation
- ❌ No screen reader announcements
- ❌ Poor focus management

### Accessibility Requirements (WCAG 2.1 Level AA)

**1. Keyboard Navigation**

All interactive elements must be keyboard accessible:

**File: `components/Card.tsx`**

```typescript
export const Card = memo(function Card({ card, index }: CardProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Space or Enter to "grab" card
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      // Activate drag mode (implementation depends on dnd library)
    }

    // Arrow keys to navigate between cards
    if (e.key === 'ArrowUp') {
      // Focus previous card
    }
    if (e.key === 'ArrowDown') {
      // Focus next card
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Card: ${card.title}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      className={`
        ${isFocused ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Card content */}
    </div>
  );
});
```

**2. ARIA Attributes**

Add semantic information for screen readers:

**File: `components/Column.tsx`**

```typescript
<div
  role="region"
  aria-label={`${column.title} column with ${column.cards.length} cards`}
>
  <h2 id={`column-${column.id}`}>{column.title}</h2>

  <div
    role="list"
    aria-labelledby={`column-${column.id}`}
  >
    {column.cards.map((card) => (
      <div key={card.id} role="listitem">
        <Card card={card} index={card.order} />
      </div>
    ))}
  </div>
</div>
```

**3. Focus Management**

Manage focus after actions:

**File: `components/Column.tsx`**

```typescript
const addCardInputRef = useRef<HTMLInputElement>(null);

const handleAddCard = () => {
  const trimmedTitle = newCardTitle.trim();
  if (!trimmedTitle) return;

  if (onAddCard) {
    onAddCard(column.id, trimmedTitle);
  }

  setNewCardTitle('');
  setIsAdding(false);

  // Return focus to "Add Card" button
  setTimeout(() => {
    document.querySelector(`button[aria-label="Add card to ${column.title}"]`)?.focus();
  }, 0);
};
```

**4. Screen Reader Announcements**

Use ARIA live regions for dynamic updates:

**New File: `components/Announcer.tsx`**

```typescript
"use client";

import { useEffect, useState } from 'react';

interface AnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function Announcer({ message, priority = 'polite' }: AnnouncerProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

Use after actions:

```typescript
const [announcement, setAnnouncement] = useState('');

const handleMoveCard = (cardId: string, toColumnId: string) => {
  moveCard(cardId, toColumnId, 0);
  setAnnouncement(`Card moved to ${getColumnTitle(toColumnId)}`);
};

return (
  <>
    <KanbanBoard />
    <Announcer message={announcement} />
  </>
);
```

**5. Skip Links**

Add skip navigation for keyboard users:

**File: `components/BoardHeader.tsx`**

```typescript
<>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0
               focus:z-50 focus:p-4 focus:bg-blue-500 focus:text-white"
  >
    Skip to board content
  </a>

  <header>
    {/* Header content */}
  </header>
</>
```

**File: `components/KanbanBoard.tsx`**

```typescript
<main id="main-content" tabIndex={-1}>
  {/* Board content */}
</main>
```

### Testing Accessibility

**Automated:**
```bash
npm install -D @axe-core/react
```

**Manual Testing Checklist:**
- [ ] Tab through all interactive elements (logical order)
- [ ] All buttons/links have visible focus indicator
- [ ] Screen reader announces card moves
- [ ] Keyboard shortcuts work (Ctrl+E for export)
- [ ] Color contrast meets WCAG AA (use browser tools)
- [ ] Works with Windows Narrator / macOS VoiceOver

### Acceptance Criteria
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels on all components
- [ ] Focus management after actions
- [ ] Screen reader announcements for state changes
- [ ] Skip link for keyboard navigation
- [ ] Passes axe accessibility audit

---

## Task 6.3: Error Handling & Resilience (30 min - 1 hour)

### Current Error Handling State

- ✅ Try-catch in storage functions
- ✅ Console.error for debugging
- ❌ No error boundaries
- ❌ No user-friendly error messages
- ❌ No error recovery

### Error Handling Strategy

**1. React Error Boundary**

Catch React errors gracefully:

**New File: `components/ErrorBoundary.tsx`**

```typescript
"use client";

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Send to error reporting service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-700 mb-4">
              The application encountered an error. Your data is safe.
            </p>
            <details className="text-sm text-gray-600 mb-4">
              <summary className="cursor-pointer font-medium">
                Error details
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded
                         hover:bg-blue-600 transition-colors"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap app in ErrorBoundary:**

```typescript
// app/layout.tsx or page.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**2. User-Friendly Error Messages**

Replace console.error with user notifications:

**File: `hooks/useBoardState.ts`**

```typescript
import { useToast } from '@/hooks/useToast';

export function useBoardState(boardId: string) {
  const { error: showError } = useToast();

  const setBoard = useCallback((newBoard: Board) => {
    try {
      // ... save logic
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message.includes('QuotaExceeded')) {
        showError('Storage full. Please export and clear old boards.');
      } else {
        showError(`Failed to save: ${message}`);
      }

      console.error('Save error:', error);
    }
  }, [storageKey, showError]);

  return { board, setBoard, isLoaded, storageStatus };
}
```

**3. Graceful Degradation**

Handle missing features gracefully:

```typescript
// Feature detection
const hasLocalStorage = typeof localStorage !== 'undefined';

if (!hasLocalStorage) {
  console.warn('localStorage not available, using in-memory storage');
  // Fall back to in-memory Map
}
```

**4. Data Validation**

Validate data from external sources:

**New File: `utils/validation.ts`**

```typescript
import { Board, Card, Column } from '@/types/board';

export function isValidBoard(obj: any): obj is Board {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.cards === 'object' &&
    typeof obj.columns === 'object' &&
    Array.isArray(obj.columnOrder) &&
    obj.metadata
  );
}

export function isValidCard(obj: any): obj is Card {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.columnId === 'string' &&
    typeof obj.order === 'number'
  );
}

export function sanitizeBoard(board: any): Board {
  if (!isValidBoard(board)) {
    throw new Error('Invalid board data');
  }

  // Ensure all cards are valid
  const cards: Record<string, Card> = {};
  for (const [id, card] of Object.entries(board.cards)) {
    if (isValidCard(card)) {
      cards[id] = card;
    } else {
      console.warn(`Invalid card data, skipping: ${id}`);
    }
  }

  return {
    ...board,
    cards,
  };
}
```

Use in load functions:

```typescript
const loadBoard = async (boardId: string): Promise<Board> => {
  try {
    const data = localStorage.getItem(key);
    const parsed = JSON.parse(data);
    return sanitizeBoard(parsed); // Validate before returning
  } catch (error) {
    console.error('Failed to load board:', error);
    return { ...DEFAULT_BOARD, id: boardId };
  }
};
```

### Acceptance Criteria
- [ ] ErrorBoundary catches React errors
- [ ] User-friendly error messages (no console.error shown to users)
- [ ] Data validation prevents corrupt boards
- [ ] Graceful degradation when features unavailable
- [ ] Export still works even if board has errors
- [ ] App doesn't crash on invalid data

---

## Testing Plan

### Performance Testing

**Checklist:**
- [ ] Create board with 100 cards
- [ ] Drag cards (smooth, no lag)
- [ ] Scroll columns (smooth)
- [ ] Add/delete cards (instant)
- [ ] Switch between boards (fast)
- [ ] Open DevTools Performance tab (no long tasks > 50ms)

**Lighthouse Audit:**
```bash
npm run build
npm start
# Run Lighthouse in Chrome DevTools
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90

### Accessibility Testing

**Automated:**
```typescript
// tests/accessibility.test.ts
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<KanbanBoard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual Testing:**
- [ ] Navigate with keyboard only (Tab, Shift+Tab, Enter, Esc)
- [ ] Use screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test with Windows High Contrast mode
- [ ] Test with 200% zoom
- [ ] Test with keyboard shortcuts disabled

### Error Handling Testing

**Scenarios:**
- [ ] Fill localStorage to quota (should show error)
- [ ] Corrupt board data in localStorage (should recover)
- [ ] Throw error in component (should show error boundary)
- [ ] Network error during API call (Phase 7+)
- [ ] Invalid JSON in exported file (import should fail gracefully)

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `components/Column.tsx` | MODIFY | Add memoization, ARIA labels |
| `components/Card.tsx` | MODIFY | Add keyboard navigation, focus states |
| `components/BoardHeader.tsx` | MODIFY | Add skip link, memoization |
| `components/ErrorBoundary.tsx` | CREATE | React error boundary |
| `components/Announcer.tsx` | CREATE | Screen reader announcements |
| `lib/performance.ts` | CREATE | Performance monitoring utils |
| `utils/validation.ts` | CREATE | Data validation functions |
| `utils/dev.ts` | CREATE | Development utilities (large board generator) |

---

## Success Criteria

Phase 6 is complete when:
- ✅ Components properly memoized (no unnecessary re-renders)
- ✅ Lazy loading reduces initial bundle size
- ✅ Smooth performance with 100+ cards
- ✅ All interactive elements keyboard accessible
- ✅ ARIA labels on all components
- ✅ Screen reader announces state changes
- ✅ Error boundary catches React errors
- ✅ User-friendly error messages
- ✅ Data validation prevents corruption
- ✅ Lighthouse scores > 90 across all categories
- ✅ Passes axe accessibility audit

---

## Production Readiness Checklist

After completing Phase 6, verify:

### Functionality
- [ ] All features work as expected
- [ ] Drag & drop is reliable
- [ ] Data persists correctly
- [ ] Export/import work
- [ ] Theme toggle works

### Performance
- [ ] No lag with 50+ cards
- [ ] Bundle size < 500KB
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### Accessibility
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] WCAG 2.1 AA compliant
- [ ] High contrast mode works

### Reliability
- [ ] Error boundary catches crashes
- [ ] Graceful degradation
- [ ] Data validation
- [ ] No console errors in production

### Documentation
- [ ] README complete
- [ ] All phases documented
- [ ] Code comments current
- [ ] Architecture explained

---

## Next Steps

After Phase 6, the application is **production-ready** for local use. Future phases:

- **Phase 7:** API backend integration
- **Phase 8:** Agent collaboration and Beads integration
- **Beyond:** Real-time sync, collaborative editing, advanced features

The polish applied in Phase 6 ensures users have a **professional, reliable, accessible experience** from day one.
