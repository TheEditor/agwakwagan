# Phase 1 - Task 2: Implement Board Selectors

**Task ID:** P1-T2  
**Estimated Time:** 30-45 minutes  
**Dependencies:** P1-T1 (addCard implemented)  
**Focus:** Optimized data queries with memoization

---

## Context

Selectors are functions that derive data from the board state. They:
- Query cards for a specific column
- Sort cards by order
- Combine columns with their cards
- Use memoization to avoid expensive recalculations

**Why important:** Without proper selectors, React re-renders unnecessarily, causing performance issues.

---

## Objectives

1. Implement `getColumnCards` - Get sorted cards for a column
2. Implement `getColumnWithCards` - Get column with its cards
3. Implement `getAllColumnsWithCards` - Get all columns for rendering
4. Use proper memoization (useMemo, useCallback)

---

## Tasks

### 2.1 Update `hooks/useBoardSelectors.ts`

**Replace the entire file contents:**

```typescript
'use client';

import { useCallback, useMemo } from 'react';
import { Board, Card, Column, ColumnWithCards } from '@/types/board';

/**
 * Board Selectors Hook
 * 
 * Provides derived data and queries from board state.
 * All selectors are memoized for performance.
 */
export function useBoardSelectors(board: Board | null) {
  /**
   * Get all cards for a specific column, sorted by order
   * 
   * @param columnId - Column to get cards from
   * @returns Array of cards, sorted by order (ascending)
   */
  const getColumnCards = useCallback((columnId: string): Card[] => {
    if (!board) return [];

    return Object.values(board.cards)
      .filter(card => card.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }, [board?.cards]); // Only depend on cards, not entire board

  /**
   * Get a single column with its cards
   * 
   * @param columnId - Column ID
   * @returns Column with cards array, or null if not found
   */
  const getColumnWithCards = useCallback((columnId: string): ColumnWithCards | null => {
    if (!board) return null;

    const column = board.columns[columnId];
    if (!column) return null;

    return {
      ...column,
      cards: getColumnCards(columnId)
    };
  }, [board?.columns, getColumnCards]);

  /**
   * Get all columns with their cards, in display order
   * 
   * This is the main selector used by KanbanBoard component.
   * Memoized to prevent unnecessary recalculations.
   * 
   * @returns Array of columns with cards, in columnOrder sequence
   */
  const getAllColumnsWithCards = useMemo((): ColumnWithCards[] => {
    if (!board) return [];

    return board.columnOrder
      .map(columnId => getColumnWithCards(columnId))
      .filter((column): column is ColumnWithCards => column !== null);
  }, [board?.columnOrder, getColumnWithCards]);

  /**
   * Get total number of cards across all columns
   * 
   * @returns Total card count
   */
  const getTotalCardCount = useMemo((): number => {
    if (!board) return 0;
    return Object.keys(board.cards).length;
  }, [board?.cards]);

  /**
   * Get number of cards in a specific column
   * 
   * @param columnId - Column ID
   * @returns Number of cards in that column
   */
  const getColumnCardCount = useCallback((columnId: string): number => {
    if (!board) return 0;
    
    return Object.values(board.cards)
      .filter(card => card.columnId === columnId)
      .length;
  }, [board?.cards]);

  /**
   * Get a single card by ID
   * 
   * @param cardId - Card ID
   * @returns Card object or null if not found
   */
  const getCardById = useCallback((cardId: string): Card | null => {
    if (!board) return null;
    return board.cards[cardId] || null;
  }, [board?.cards]);

  /**
   * Check if a column exists
   * 
   * @param columnId - Column ID
   * @returns True if column exists
   */
  const columnExists = useCallback((columnId: string): boolean => {
    if (!board) return false;
    return columnId in board.columns;
  }, [board?.columns]);

  /**
   * Get all column IDs in order
   * 
   * @returns Array of column IDs
   */
  const getColumnOrder = useMemo((): string[] => {
    if (!board) return [];
    return [...board.columnOrder]; // Return copy to prevent mutations
  }, [board?.columnOrder]);

  return {
    // Primary selectors
    getColumnCards,
    getColumnWithCards,
    getAllColumnsWithCards,
    
    // Utility selectors
    getTotalCardCount,
    getColumnCardCount,
    getCardById,
    columnExists,
    getColumnOrder
  };
}
```

---

## Key Implementation Details

### 1. Memoization Strategy

**useCallback vs useMemo:**

```typescript
// useCallback - memoize FUNCTION
const getColumnCards = useCallback((columnId: string) => {
  // Function body
}, [dependencies]);

// useMemo - memoize VALUE
const getAllColumnsWithCards = useMemo(() => {
  // Return computed value
}, [dependencies]);
```

**When to use each:**
- **useCallback:** Functions passed as props or used as dependencies
- **useMemo:** Expensive computations that return data

### 2. Dependency Optimization

**Depend on specific fields, not entire board:**

```typescript
// ❌ Bad - re-runs when anything in board changes
useCallback(() => {
  return board.cards;
}, [board]);

// ✅ Good - only re-runs when cards change
useCallback(() => {
  return board.cards;
}, [board?.cards]);
```

**Why?** If metadata updates, we don't need to recalculate cards.

### 3. Sorting Cards

**Always sort by order field:**
```typescript
.sort((a, b) => a.order - b.order);
```

This ensures cards appear in the order they were added (or manually reordered in Phase 2).

### 4. Filtering and Type Safety

**Filter out nulls properly:**
```typescript
.filter((column): column is ColumnWithCards => column !== null);
```

This TypeScript type predicate tells the compiler that nulls are removed.

---

## Performance Analysis

### Without Memoization (Bad):
```typescript
// Component re-renders
  ↓
getAllColumnsWithCards called
  ↓
Filters all cards (expensive)
  ↓
Sorts all cards (expensive)
  ↓
Maps to new array (expensive)
  ↓
React re-renders (even if data unchanged)
```

### With Memoization (Good):
```typescript
// Component re-renders
  ↓
getAllColumnsWithCards called
  ↓
Checks if dependencies changed
  ↓
No change? Return cached value (instant)
  ↓
React compares cached vs new (same reference)
  ↓
Skips re-render (optimized)
```

**Result:** 10-100x faster on re-renders with many cards.

---

## Testing

### Console Tests

```javascript
// In browser console after implementing:

// Get board hook (from React DevTools or global)
const { getAllColumnsWithCards, getTotalCardCount } = useBoard();

// Test 1: Get all columns
console.log(getAllColumnsWithCards());
// Should show 3 columns with empty cards arrays

// Add some cards via UI, then:

// Test 2: Total count
console.log(getTotalCardCount());
// Should match number of cards you added

// Test 3: Column card count
const { getColumnCardCount } = useBoard();
console.log(getColumnCardCount('col-todo'));
// Should match cards in TODO column

// Test 4: Sorting
const { getColumnCards } = useBoard();
const todoCards = getColumnCards('col-todo');
console.log(todoCards.map(c => c.order));
// Should be [0, 1, 2, ...] in order
```

### Performance Test

```typescript
// Add to component temporarily to test memoization
import { useEffect, useRef } from 'react';

function PerformanceTest() {
  const { getAllColumnsWithCards } = useBoard();
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    console.log('Render count:', renderCount.current);
  });
  
  // If this logs excessively on small changes, memoization broken
  return null;
}
```

---

## Acceptance Criteria

- [ ] File updated with all selector implementations
- [ ] TypeScript compiles without errors
- [ ] getColumnCards returns sorted array
- [ ] getAllColumnsWithCards returns columns in correct order
- [ ] Memoization dependencies correct
- [ ] Performance good (no excessive recalculations)
- [ ] Handles null board gracefully
- [ ] Returns empty arrays/null when appropriate

---

## Verification Steps

1. **TypeScript Check:**
   ```bash
   npx tsc --noEmit
   ```

2. **Import Test:**
   ```typescript
   import { useBoardSelectors } from '@/hooks/useBoardSelectors';
   ```

3. **Dependency Check:**
   - Verify useCallback uses `[board?.cards]` not `[board]`
   - Verify useMemo uses minimal dependencies
   - Check no circular dependencies

4. **Runtime Test:**
   - Add 5 cards to TODO
   - Check they appear in order
   - Reload page, verify still sorted

---

## Common Issues

### Issue: Cards not sorted
**Fix:** Check `.sort((a, b) => a.order - b.order)` in getColumnCards

### Issue: Excessive re-renders
**Fix:** Check dependencies - should be `board?.cards` not `board`

### Issue: "Cannot read property 'cards' of null"
**Fix:** Add `if (!board) return [];` at start of selectors

### Issue: TypeScript error on filter
**Fix:** Use type predicate: `filter((col): col is ColumnWithCards => col !== null)`

---

## Performance Tips

**Measure performance:**
```typescript
console.time('getAllColumnsWithCards');
const columns = getAllColumnsWithCards();
console.timeEnd('getAllColumnsWithCards');
// Should be <1ms with proper memoization
```

**Watch for:**
- Functions called on every render
- Expensive computations not memoized
- Dependencies too broad

---

## Next Task

After completion, proceed to **Phase-1-Task-3-Build-Card-Component.md**

Now we have actions (addCard) and selectors (query data). Next: build the Card component to display cards beautifully.
