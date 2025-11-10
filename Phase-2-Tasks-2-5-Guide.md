# Phase 2 - Tasks 2-5 Implementation Guide

**Quick reference for remaining Phase 2 tasks**

---

## Task 2: Setup DnD Context (45-60 min)

**File:** `components/KanbanBoard.tsx`

### Add imports:
```typescript
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
```

### Add onDragEnd handler:
```typescript
const handleDragEnd = (result: DropResult) => {
  const { destination, source, draggableId } = result;

  // Dropped outside valid area
  if (!destination) return;

  // Dropped in same position
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return;
  }

  // Move the card
  moveCard(draggableId, destination.droppableId, destination.index);
};
```

### Wrap component:
```typescript
return (
  <DragDropContext onDragEnd={handleDragEnd}>
    <div className="h-screen bg-[var(--color-bg)]">
      {/* existing content */}
    </div>
  </DragDropContext>
);
```

---

## Task 3: Make Column Droppable (30-45 min)

**File:** `components/Column.tsx`

### Add import:
```typescript
import { Droppable } from '@hello-pangea/dnd';
```

### Wrap card list:
```typescript
<Droppable droppableId={column.id}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`flex-1 space-y-2 mb-4 min-h-[100px] transition-colors ${
        snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      {column.cards.map((card, index) => (
        <Card key={card.id} card={card} index={index} />
      ))}
      {provided.placeholder}
    </div>
  )}
</Droppable>
```

**Key points:**
- `droppableId` must be column.id
- Must use `provided.innerRef` and spread props
- Must include `provided.placeholder`
- `isDraggingOver` provides visual feedback

---

## Task 4: Make Card Draggable (45-60 min)

**File:** `components/Card.tsx`

### Add import:
```typescript
import { Draggable } from '@hello-pangea/dnd';
```

### Update Card component:
```typescript
interface CardProps {
  card: Card;
  index: number;  // Required for Draggable
}

export function Card({ card, index }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white dark:bg-[var(--color-surface)]
            border border-[var(--color-border)]
            rounded-lg p-3 mb-2
            shadow-sm hover:shadow-md
            transition-all
            cursor-grab active:cursor-grabbing
            ${snapshot.isDragging ? 'opacity-50 rotate-2 shadow-xl' : ''}
          `}
        >
          <h3 className="text-sm font-medium text-[var(--color-text)]">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {card.description}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
```

**Key points:**
- `draggableId` must be card.id
- `index` must be position in list
- Must use `provided.innerRef` and spread all props
- `isDragging` provides visual feedback
- `dragHandleProps` makes entire card draggable

---

## Task 5: Testing & Polish (60-90 min)

### Test Matrix

| Scenario | Steps | Expected |
|----------|-------|----------|
| Reorder same column | Drag card up/down | Order updates, persists |
| Move to empty column | Drag to column with 0 cards | Card moves, appears |
| Move to column start | Drag to top of column | Card becomes first |
| Move to column end | Drag to bottom of column | Card becomes last |
| Move to column middle | Drag between two cards | Cards shift correctly |
| Keyboard drag | Space, arrows, space | Same as mouse drag |
| Cancel drag | Escape during drag | Returns to original position |

### Visual Polish

**Add these styles for better UX:**

1. **Drop zone indicator:**
```typescript
// In Droppable
className={`
  min-h-[100px]
  ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
`}
```

2. **Dragging card:**
```typescript
// In Draggable
className={`
  ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-1' : ''}
`}
```

3. **Empty state:**
```typescript
{column.cards.length === 0 && !snapshot.isDraggingOver && (
  <p className="text-center text-sm text-[var(--color-text-tertiary)] py-8">
    Drag cards here
  </p>
)}
```

### Bug Fixes

**Common issues to fix:**

1. **Cards jump on drag start**
   - Ensure no margin on Card component
   - Use padding in parent instead

2. **Placeholder wrong size**
   - Check `provided.placeholder` included
   - Verify Droppable has min-height

3. **Drop zones not registering**
   - Check `droppableId` is string
   - Verify `provided.innerRef` on correct element

4. **Performance lag**
   - Add `React.memo` to Card component
   - Check no expensive computations on drag

---

## Final Verification

### Functionality Checklist
- [ ] Can drag card within column
- [ ] Can drag card to different column
- [ ] Order updates correctly
- [ ] Changes persist after reload
- [ ] Keyboard drag works (Space + arrows)
- [ ] Cancel drag works (Escape)
- [ ] No console errors

### Visual Checklist
- [ ] Smooth drag animation
- [ ] Visual feedback on drag (opacity, rotation)
- [ ] Drop zones highlight on hover
- [ ] Placeholder shows correct size
- [ ] No layout jumps or jank
- [ ] Cursor changes appropriately

### Edge Cases Checklist
- [ ] Drag to empty column works
- [ ] Drag only card in column works
- [ ] Drag to same position (no-op) works
- [ ] Rapid consecutive drags work
- [ ] Multiple users scenario (reload between drags)

---

## Git Commit

```bash
git add .
git commit -m "Phase 2 complete: Drag and drop functionality

- Implemented moveCard with order recalculation
- Added DragDropContext to KanbanBoard
- Made columns droppable with visual feedback
- Made cards draggable with smooth animations
- Keyboard drag support (Space + arrows)
- All drag scenarios tested and working
- Order updates persist correctly"

git push origin main
```

---

## Performance Tips

**If drag feels laggy:**

1. Memoize Card component:
```typescript
export const Card = React.memo(function Card({ card, index }) {
  // ...
});
```

2. Check selectors memoization in Phase 1

3. Use React DevTools Profiler to find slow renders

4. Consider virtualization if >100 cards

---

## Next Phase

**Phase 3: Data Persistence & Management**
- Edit cards
- Delete cards
- Export/import functionality
- Add notes to cards
