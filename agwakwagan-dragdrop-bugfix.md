# Bug Fix: Within-Column Drag & Drop

## Issue
Cards can be dragged between columns successfully, but dragging within the same column doesn't reorder them. Visual feedback works (drop indicator shows) but cards snap back to original position on drop.

## Root Causes

### 1. **useDragAndDrop Hook** - Incorrect Same-Position Check
```typescript
// BROKEN CODE (line 114-118):
if (sourceColumn === columnId && dragState.dragOverIndex === dropIndex) {
  handleDragEnd();
  return;
}
```

The check is too simplistic. When dragging within column, the indices get confused because:
- Original card position affects index calculation
- Drop index doesn't account for the gap left by dragged card

### 2. **moveCard Function** - Doesn't Handle Same-Column Properly
```typescript
// BROKEN CODE (line 230-243):
const targetCards = Object.values(newBoard.cards)
  .filter(c => c.columnId === targetColumnId && c.id !== cardId)
  .sort((a, b) => a.order - b.order);

// This excludes the dragged card, then adds it back
targetCards.splice(targetIndex, 0, card);
targetCards.forEach((c, index) => {
  c.order = index;
});
```

This logic works for cross-column moves but fails for same-column because it doesn't properly handle the card's original position.

## Solution

### Fix 1: Update useDragAndDrop Hook

**File: `app/hooks/useDragAndDrop.ts`**

Replace the `handleDrop` function:

```typescript
const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
  e.preventDefault();
  e.stopPropagation();
  
  const cardId = e.dataTransfer.getData('cardId');
  const sourceColumn = e.dataTransfer.getData('sourceColumn');
  
  if (!cardId || !columnId) return;
  
  const dropIndex = dragState.dropIndicatorIndex ?? 0;
  
  // For same-column moves, we need to check if the card actually moved
  // Don't just compare indices - check if a reorder is needed
  if (sourceColumn === columnId) {
    // Get the original card position
    const originalIndex = dragState.draggedCardOriginalIndex;
    
    // Adjust drop index if dropping after original position
    const adjustedDropIndex = dropIndex > originalIndex ? dropIndex - 1 : dropIndex;
    
    // Only skip if truly same position
    if (originalIndex === adjustedDropIndex) {
      handleDragEnd();
      return;
    }
  }
  
  // Execute the move
  onCardMove(cardId, columnId, dropIndex);
  
  // Reset state
  handleDragEnd();
}, [dragState.dropIndicatorIndex, dragState.draggedCardOriginalIndex, onCardMove]);
```

And update `handleDragStart` to track original index:

```typescript
const handleDragStart = useCallback((e: React.DragEvent, cardId: string, columnId: string, cardIndex: number) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('cardId', cardId);
  e.dataTransfer.setData('sourceColumn', columnId);
  
  setDragState({
    draggedCardId: cardId,
    draggedFromColumn: columnId,
    draggedCardOriginalIndex: cardIndex, // NEW: Track original position
    dragOverColumn: null,
    dragOverIndex: null,
    dropIndicatorIndex: null,
  });
}, []);
```

### Fix 2: Update moveCard Function

**File: `app/hooks/useBoard.ts`**

Replace the `moveCard` function:

```typescript
const moveCard = useCallback(async (
  cardId: string,
  targetColumnId: string,
  targetIndex: number
) => {
  if (!board) return;

  const newBoard = { ...board };
  const card = newBoard.cards[cardId];
  
  if (!card) {
    console.error('Card not found:', cardId);
    return;
  }

  const sourceColumnId = card.columnId;
  const isSameColumn = sourceColumnId === targetColumnId;

  // Get all cards in source and target columns
  const sourceCards = Object.values(newBoard.cards)
    .filter(c => c.columnId === sourceColumnId)
    .sort((a, b) => a.order - b.order);
    
  const targetCards = isSameColumn ? sourceCards : Object.values(newBoard.cards)
    .filter(c => c.columnId === targetColumnId)
    .sort((a, b) => a.order - b.order);

  if (isSameColumn) {
    // SAME COLUMN: Reorder within column
    const currentIndex = sourceCards.findIndex(c => c.id === cardId);
    
    if (currentIndex === -1) return;
    
    // Remove from current position
    sourceCards.splice(currentIndex, 1);
    
    // Adjust target index if moving down (account for removal)
    const adjustedIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
    
    // Insert at new position
    sourceCards.splice(adjustedIndex, 0, card);
    
    // Update order for all cards
    sourceCards.forEach((c, index) => {
      c.order = index;
      if (c.id === cardId) {
        c.updatedAt = new Date();
      }
    });
  } else {
    // DIFFERENT COLUMN: Move between columns
    
    // Remove from source column
    const sourceIndex = sourceCards.findIndex(c => c.id === cardId);
    if (sourceIndex !== -1) {
      sourceCards.splice(sourceIndex, 1);
      // Reorder remaining cards in source column
      sourceCards.forEach((c, index) => {
        c.order = index;
      });
    }
    
    // Update card's column
    card.columnId = targetColumnId;
    card.updatedAt = new Date();
    
    // Insert into target column
    targetCards.splice(targetIndex, 0, card);
    
    // Reorder all cards in target column
    targetCards.forEach((c, index) => {
      c.order = index;
    });
  }

  newBoard.metadata.updatedAt = new Date();
  
  await saveBoard(newBoard);
}, [board, saveBoard]);
```

### Fix 3: Update Component Props

**File: `app/components/Board/KanbanBoard.tsx`**

When calling `onCardDragStart`, pass the card's current index:

```tsx
onCardDragStart={(cardId) => {
  const cardIndex = cards.findIndex(c => c.id === cardId);
  handleDragStart({} as React.DragEvent, cardId, columnId, cardIndex);
}}
```

## Testing Checklist

After applying fixes, test:

- [ ] Drag card up within same column
- [ ] Drag card down within same column
- [ ] Drag first card to last position
- [ ] Drag last card to first position
- [ ] Drag card to same position (should not trigger save)
- [ ] Drag between columns still works
- [ ] Multiple rapid reorders work
- [ ] Order persists after page reload

## Quick Fix Alternative

If the full fix is too complex, here's a simpler workaround that forces all moves to process:

```typescript
// In handleDrop - just remove the same-position check entirely:
const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
  e.preventDefault();
  e.stopPropagation();
  
  const cardId = e.dataTransfer.getData('cardId');
  
  if (!cardId || !columnId) return;
  
  const dropIndex = dragState.dropIndicatorIndex ?? 0;
  
  // Always execute the move - let moveCard handle deduplication
  onCardMove(cardId, columnId, dropIndex);
  
  handleDragEnd();
}, [dragState.dropIndicatorIndex, onCardMove]);
```

This is less efficient but ensures moves always process.
