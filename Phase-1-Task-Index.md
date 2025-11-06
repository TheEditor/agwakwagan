# Phase 1 - Task Specifications Index

**Project:** Agwakwagan Kanban Board  
**Phase:** 1 - Static Rendering  
**Total Estimated Time:** 3-4 hours  
**Status:** Ready to Execute  
**Prerequisites:** Phase 0 complete

---

## Overview

Phase 1 implements the core kanban board functionality without drag & drop. Users will be able to:
- View all columns with their cards
- Add new cards to any column
- See cards rendered with proper styling
- Have data persist automatically to localStorage

**Key Focus:** Get the board functional with manual card creation. Drag & drop comes in Phase 2.

---

## What You'll Build

```
Working Kanban Board:
┌─────────────────────────────────────────────────┐
│  Agwakwagan                                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  TODO    │  │ PROGRESS │  │   DONE   │     │
│  ├──────────┤  ├──────────┤  ├──────────┤     │
│  │ Task 1   │  │ Task 3   │  │ Task 5   │     │
│  │ Task 2   │  │          │  │          │     │
│  │          │  │          │  │          │     │
│  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

---

## Task Files (Execute in Order)

### 1. [Phase-1-Task-1-Implement-AddCard.md](./Phase-1-Task-1-Implement-AddCard.md)
**Duration:** 45-60 minutes  
**What:** Implement useBoardActions.addCard with full logic  
**Output:** Working card creation functionality  
**Key:** ID generation, order calculation, immutable updates

### 2. [Phase-1-Task-2-Implement-Selectors.md](./Phase-1-Task-2-Implement-Selectors.md)
**Duration:** 30-45 minutes  
**What:** Implement useBoardSelectors with memoization  
**Output:** Optimized card queries and derived data  
**Key:** Performance, sorting, filtering

### 3. [Phase-1-Task-3-Build-Card-Component.md](./Phase-1-Task-3-Build-Card-Component.md)
**Duration:** 30-45 minutes  
**What:** Complete Card component with styling  
**Output:** Beautiful, interactive cards  
**Key:** Ozhiaki theme, hover states, typography

### 4. [Phase-1-Task-4-Build-Column-Component.md](./Phase-1-Task-4-Build-Column-Component.md)
**Duration:** 45-60 minutes  
**What:** Complete Column component with add card UI  
**Output:** Functional columns with inline card creation  
**Key:** Form handling, validation, UX

### 5. [Phase-1-Task-5-Update-KanbanBoard.md](./Phase-1-Task-5-Update-KanbanBoard.md)
**Duration:** 30 minutes  
**What:** Connect all pieces in KanbanBoard component  
**Output:** Fully integrated board  
**Key:** Data flow, prop passing

### 6. [Phase-1-Task-6-Testing-And-Polish.md](./Phase-1-Task-6-Testing-And-Polish.md)
**Duration:** 30-45 minutes  
**What:** Test all functionality, fix bugs, add polish  
**Output:** Production-ready Phase 1  
**Key:** Edge cases, error handling, UX improvements

---

## Learning Objectives

By the end of Phase 1, you'll understand:
- **Normalized state updates** - Immutable patterns for flat data structures
- **React memoization** - useMemo, useCallback for performance
- **Form handling** - Controlled inputs, validation, submission
- **Component composition** - Props, callbacks, data flow
- **LocalStorage persistence** - Automatic saving via storage adapter

---

## Success Criteria

**Phase 1 is complete when:**
- ✅ Can add cards to any column
- ✅ Cards display with correct styling
- ✅ Cards sorted by order within columns
- ✅ Adding card clears input and focuses back
- ✅ Empty columns show helpful message
- ✅ All data persists after page reload
- ✅ No console errors
- ✅ Smooth, responsive UI
- ✅ Escapes cancel add card operation
- ✅ Enter key submits card

---

## Technical Highlights

### Immutable State Updates
```typescript
// Adding a card (immutable pattern)
const newBoard = {
  ...board,
  cards: {
    ...board.cards,
    [newCard.id]: newCard
  }
};
```

### Memoized Selectors
```typescript
// Expensive computation cached
const getAllColumnsWithCards = useMemo(() => {
  return board.columnOrder.map(colId => ({
    ...board.columns[colId],
    cards: getColumnCards(colId)
  }));
}, [board.columnOrder, board.columns, board.cards]);
```

### Controlled Form Input
```typescript
const [newCardTitle, setNewCardTitle] = useState('');
<input 
  value={newCardTitle}
  onChange={e => setNewCardTitle(e.target.value)}
  onKeyDown={e => e.key === 'Enter' && handleAdd()}
/>
```

---

## Common Patterns You'll Use

### 1. Order Calculation
```typescript
// Get next order number in column
const maxOrder = Math.max(
  -1, 
  ...Object.values(board.cards)
    .filter(c => c.columnId === columnId)
    .map(c => c.order)
);
const nextOrder = maxOrder + 1;
```

### 2. Immutable Updates
```typescript
// Never mutate - always create new objects
setBoard({
  ...board,
  cards: { ...board.cards, [id]: updatedCard }
});
```

### 3. Memoization
```typescript
// Cache expensive computations
const result = useMemo(() => expensiveOperation(), [dependencies]);
```

### 4. Callback Stability
```typescript
// Prevent unnecessary re-renders
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

---

## Phase 1 Architecture

```
User Action (Click "+ Add Card")
    ↓
Column Component (captures input)
    ↓
onAddCard callback
    ↓
useBoardActions.addCard()
    ↓
Calculates order, generates ID, creates card object
    ↓
Updates board state (immutable)
    ↓
useBoardState.setBoard()
    ↓
useStorageAdapter.saveBoard() (automatic)
    ↓
LocalStorage updated
    ↓
React re-render
    ↓
useBoardSelectors.getAllColumnsWithCards()
    ↓
Columns re-render with new card
```

---

## Testing Checklist

After completing all Phase 1 tasks:

### Functionality
- [ ] Can add card to TODO column
- [ ] Can add card to In Progress column
- [ ] Can add card to Done column
- [ ] Cards appear immediately after adding
- [ ] Cards sorted by creation order
- [ ] Input clears after adding card
- [ ] Empty title shows error or prevents submission
- [ ] Very long titles handled gracefully
- [ ] Can add 10+ cards without issues
- [ ] Page reload preserves all cards

### UX
- [ ] Enter key adds card
- [ ] Escape key cancels
- [ ] Tab navigation works
- [ ] Focus management correct
- [ ] Loading state shows on first load
- [ ] Smooth transitions
- [ ] No layout shifts
- [ ] Responsive to window size

### Technical
- [ ] No console errors
- [ ] No console warnings
- [ ] TypeScript compiles (0 errors)
- [ ] Build succeeds
- [ ] LocalStorage updates correctly
- [ ] Performance smooth with 20+ cards

---

## Performance Targets

**Phase 1 should feel instant:**
- Add card: <50ms perceived latency
- Render 50 cards: <100ms
- No jank on interactions
- Smooth scrolling

**If slow:** Check for missing memoization or unnecessary re-renders.

---

## Troubleshooting Guide

### Issue: Cards not appearing
- Check addCard actually updates state
- Verify getAllColumnsWithCards includes new card
- Check order calculation correct

### Issue: Cards in wrong order
- Verify order field set correctly
- Check sort in getColumnCards: `.sort((a, b) => a.order - b.order)`

### Issue: State not persisting
- Check setBoard in useBoardState calls adapter.saveBoard
- Verify localStorage has data after adding card

### Issue: Input not clearing
- Check setNewCardTitle('') after successful add
- Verify controlled input pattern: value={newCardTitle}

### Issue: Multiple cards with same ID
- Check generateId called for each card
- Verify not reusing ID

---

## Code Quality Standards

### TypeScript
- No `any` types (use proper interfaces)
- All functions typed
- Inference where clear

### React
- Functional components only
- Hooks at top level
- Proper dependency arrays

### Naming
- Descriptive variable names
- Consistent patterns
- Clear intent

### Comments
- JSDoc for functions
- Explain "why" not "what"
- Document complex logic

---

## Git Strategy

**Commits per task:**
```bash
git commit -m "Phase 1 Task 1: Implement addCard action"
git commit -m "Phase 1 Task 2: Implement board selectors"
git commit -m "Phase 1 Task 3: Complete Card component"
git commit -m "Phase 1 Task 4: Complete Column component"
git commit -m "Phase 1 Task 5: Integrate KanbanBoard"
git commit -m "Phase 1 Task 6: Testing and polish"

# Final commit
git commit -m "Phase 1 complete: Static rendering with card creation"
```

---

## Time Tracking

| Task | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| Task 1 | 45-60 min | | |
| Task 2 | 30-45 min | | |
| Task 3 | 30-45 min | | |
| Task 4 | 45-60 min | | |
| Task 5 | 30 min | | |
| Task 6 | 30-45 min | | |
| **Total** | **3-4 hours** | | |

---

## What Phase 1 Does NOT Include

- ❌ Drag and drop (Phase 2)
- ❌ Edit cards (Phase 3)
- ❌ Delete cards (Phase 3)
- ❌ Export/import (Phase 3)
- ❌ Theme toggle (Phase 4)
- ❌ Card expansion/details (Phase 4)
- ❌ Undo/redo (Phase 5)
- ❌ Tags (Phase 6)

**Focus:** Just get cards rendering and adding working perfectly.

---

## Next Steps After Phase 1

Once complete:
1. ✅ Test thoroughly with many cards
2. ✅ Verify persistence across reloads
3. ✅ Commit all changes
4. ✅ Take a break
5. ➡️ Move to Phase 2: Drag & Drop

---

## Support Documents

- [Agwakwagan-Implementation-Phases.md](../Agwakwagan-Implementation-Phases.md) - Full Phase 1 details
- [Agwakwagan-Architecture-Design.md](../Agwakwagan-Architecture-Design.md) - Architecture reference
- [DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) - All documentation

---

**Ready to start? Begin with Task 1: Implement AddCard!**

Execute these tasks in Claude Code VS Code extension for best results.
