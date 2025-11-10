# Phase 2 - Task 1: Implement MoveCard Action

**Task ID:** P2-T1  
**Estimated Time:** 60-90 minutes  
**Dependencies:** Phase 1 complete  
**Focus:** Complex order recalculation logic

---

## Context

The `moveCard` action is the most complex mutation in Phase 2. It must:
1. Handle moving within same column (reorder)
2. Handle moving to different column
3. Recalculate order numbers for affected cards
4. Update state immutably
5. Handle edge cases (empty columns, boundaries)

---

## Objectives

1. Implement moveCard with full logic
2. Handle both same-column and cross-column moves
3. Recalculate order for all affected cards
4. Maintain immutable updates

---

## Tasks

### 1.1 Update `hooks/useBoardActions.ts`

Replace the `moveCard` placeholder with this implementation:

```typescript
/**
 * Move a card to a different column or position
 * 
 * Handles both:
 * - Reordering within same column
 * - Moving to different column
 * 
 * @param cardId - Card to move
 * @param toColumnId - Destination column
 * @param newOrder - New position (0-indexed)
 */
const moveCard = useCallback((
  cardId: string,
  toColumnId: string,
  newOrder: number
) => {
  if (!board) {
    console.error('Cannot move card: board not loaded');
    return;
  }

  const card = board.cards[cardId];
  if (!card) {
    console.error(`Cannot move card: card ${cardId} not found`);
    return;
  }

  if (!board.columns[toColumnId]) {
    console.error(`Cannot move card: column ${toColumnId} not found`);
    return;
  }

  const fromColumnId = card.columnId;
  const isSameColumn = fromColumnId === toColumnId;

  // Get all cards in destination column (excluding the moved card if same column)
  const destCards = Object.values(board.cards)
    .filter(c => 
      c.columnId === toColumnId && 
      c.id !== cardId
    )
    .sort((a, b) => a.order - b.order);

  // Start with current cards
  const updatedCards = { ...board.cards };

  // Update the moved card
  updatedCards[cardId] = {
    ...card,
    columnId: toColumnId,
    order: newOrder,
    updatedAt: new Date()
  };

  // Reorder cards in destination column
  destCards.forEach((c, index) => {
    // If this card is at or after the drop position, shift it down
    const adjustedOrder = index >= newOrder ? index + 1 : index;
    
    if (c.order !== adjustedOrder) {
      updatedCards[c.id] = {
        ...c,
        order: adjustedOrder,
        updatedAt: new Date()
      };
    }
  });

  // If moving to different column, reorder source column
  if (!isSameColumn) {
    const sourceCards = Object.values(board.cards)
      .filter(c => 
        c.columnId === fromColumnId && 
        c.id !== cardId
      )
      .sort((a, b) => a.order - b.order);

    sourceCards.forEach((c, index) => {
      if (c.order !== index) {
        updatedCards[c.id] = {
          ...c,
          order: index,
          updatedAt: new Date()
        };
      }
    });
  }

  // Update board
  const updatedBoard: Board = {
    ...board,
    cards: updatedCards,
    metadata: {
      ...board.metadata,
      updatedAt: new Date()
    }
  };

  setBoard(updatedBoard);
}, [board, setBoard]);
```

---

## Key Implementation Details

### 1. Same Column vs Different Column

```typescript
const isSameColumn = fromColumnId === toColumnId;

// Same column: Just reorder
// Different column: Reorder both source and destination
```

### 2. Order Recalculation Logic

**Destination column:**
```typescript
// Cards at or after drop position shift down by 1
const adjustedOrder = index >= newOrder ? index + 1 : index;
```

**Source column (if different):**
```typescript
// Fill gaps - cards just get sequential order 0, 1, 2...
sourceCards.forEach((c, index) => {
  c.order = index;
});
```

### 3. Filtering the Moved Card

```typescript
// Exclude moved card when getting destination cards
.filter(c => c.columnId === toColumnId && c.id !== cardId)
```

**Why?** Prevents double-counting if moving within same column.

### 4. Immutable Updates

```typescript
const updatedCards = { ...board.cards };

// Update cards individually
updatedCards[cardId] = { ...card, order: newOrder };
```

---

## Example Scenarios

### Scenario 1: Reorder within column
```
Before: [A(0), B(1), C(2)]
Move B to position 0
After:  [B(0), A(1), C(2)]
```

### Scenario 2: Move to different column
```
TODO: [A(0), B(1)]
DONE: [C(0), D(1)]

Move B from TODO to DONE at position 1

TODO: [A(0)]          // Reordered to fill gap
DONE: [C(0), B(1), D(2)]  // B inserted, D shifted
```

### Scenario 3: Move to end
```
Before: [A(0), B(1), C(2)]
Move A to position 3 (end)
After:  [B(0), C(1), A(2)]
```

---

## Testing

### Console Tests

```javascript
// Test in browser console
const { moveCard } = useBoard();

// Scenario 1: Reorder within column
moveCard('card-123', 'col-todo', 0);

// Scenario 2: Move to different column
moveCard('card-123', 'col-done', 1);

// Check localStorage
const board = JSON.parse(localStorage.getItem('agwakwagan-board-default'));
console.log(board.cards);
// Verify order numbers correct
```

### Edge Cases to Test

```typescript
// 1. Move to empty column
moveCard(cardId, emptyColumnId, 0);

// 2. Move to position beyond length
moveCard(cardId, columnId, 999); // Should work (clamped)

// 3. Move card to same position
moveCard(cardId, sameColumnId, currentOrder); // Should work (no-op)

// 4. Move only card in column
// Should still work correctly
```

---

## Acceptance Criteria

- [ ] moveCard function fully implemented
- [ ] Handles same-column reordering
- [ ] Handles cross-column moves
- [ ] Order recalculation correct
- [ ] Source column reordered after move
- [ ] Destination column reordered correctly
- [ ] Immutable updates
- [ ] TypeScript compiles
- [ ] No console errors

---

## Verification Steps

1. **TypeScript Check:**
   ```bash
   npx tsc --noEmit
   ```

2. **Build Check:**
   ```bash
   npm run build
   ```

3. **Logic Test (add to component temporarily):**
   ```typescript
   // Test moveCard logic
   useEffect(() => {
     if (board && Object.keys(board.cards).length >= 2) {
       const cardIds = Object.keys(board.cards);
       console.log('Before:', board.cards);
       
       // Test move
       moveCard(cardIds[0], 'col-done', 0);
       
       setTimeout(() => {
         console.log('After:', board.cards);
       }, 100);
     }
   }, []);
   ```

---

## Common Issues

### Issue: Cards have duplicate order numbers
**Fix:** Check filter excludes moved card: `c.id !== cardId`

### Issue: Gaps in order numbers
**Fix:** Verify source column reordering fills gaps sequentially

### Issue: Card disappears after move
**Fix:** Check `toColumnId` is valid column ID

### Issue: Order becomes negative
**Fix:** Ensure `newOrder >= 0`

---

## Performance Note

**This function is O(n) where n = cards in affected columns**
- Acceptable for hundreds of cards
- For thousands, would need optimization
- Current implementation prioritizes clarity

---

## Next Task

After completion, proceed to **Phase-2-Task-2-Setup-DnD-Context.md**

The moveCard logic is ready. Next: integrate @hello-pangea/dnd library.
