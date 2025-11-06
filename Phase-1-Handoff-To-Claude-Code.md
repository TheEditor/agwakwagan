# Phase 1 - Handoff to Claude Code

**Created:** November 6, 2025  
**For:** Claude Code VS Code Extension  
**Project:** Agwakwagan Kanban Board  
**Phase:** 1 - Static Rendering  
**Prerequisites:** Phase 0 complete ✅

---

## 📦 What's Included

**Phase 1 Task Specifications** (6 tasks + index):

1. **Phase-1-Task-Index.md** - Start here
2. **Phase-1-Task-1-Implement-AddCard.md** - Core business logic (45-60 min)
3. **Phase-1-Task-2-Implement-Selectors.md** - Data queries with memoization (30-45 min)
4. **Phase-1-Tasks-3-6-Summary.md** - Tasks 3-6 quick reference
5. Full detailed task files for Tasks 3-6 (create as needed)

---

## 🎯 Phase 1 Goal

**Transform this (Phase 0):**
```
Empty columns with "0 cards" text
```

**Into this (Phase 1):**
```
Working kanban with add card functionality:
┌────────────────────────────────────────┐
│ TODO        PROGRESS       DONE        │
│┌────────┐  ┌────────┐   ┌────────┐   │
││Task 1  │  │Task 3  │   │Task 5  │   │
││Task 2  │  │Task 4  │   │        │   │
││[+Add]  │  │[+Add]  │   │[+Add]  │   │
│└────────┘  └────────┘   └────────┘   │
└────────────────────────────────────────┘
```

**Working features:**
- ✅ Click "+ Add Card" button
- ✅ Type card title, press Enter
- ✅ Card appears immediately in correct column
- ✅ Reload page - all cards persist
- ✅ Can add cards to any column
- ✅ Cards stay in order (oldest to newest)

---

## ⚡ Quick Start

### For Claude Code (Recommended):

```
Execute Phase 1 tasks in order:

1. Read Phase-1-Task-Index.md for overview
2. Execute Phase-1-Task-1-Implement-AddCard.md
3. Execute Phase-1-Task-2-Implement-Selectors.md  
4. Execute Tasks 3-6 (use summary or create detailed specs)
5. Test thoroughly
6. Git commit

Total time: 3-4 hours
```

### Sequential vs Batch:

**Option A: One at a time (safer)**
- Execute Task 1, verify it works
- Execute Task 2, verify it works
- Continue sequentially

**Option B: Batch (faster if confident)**
- Give Claude Code all tasks at once
- It executes them in sequence
- Verify at the end

---

## 🔑 Critical Implementation Points

### 1. Immutable State Updates

**Always create new objects, never mutate:**
```typescript
// ✅ Correct
const updatedBoard = {
  ...board,
  cards: {
    ...board.cards,
    [newCard.id]: newCard
  }
};

// ❌ Wrong
board.cards[newCard.id] = newCard; // Don't mutate!
```

### 2. Order Calculation

**Calculate next order in column:**
```typescript
const cardsInColumn = Object.values(board.cards)
  .filter(c => c.columnId === columnId);

const maxOrder = cardsInColumn.length > 0
  ? Math.max(...cardsInColumn.map(c => c.order))
  : -1;

const nextOrder = maxOrder + 1;
```

### 3. Memoization Dependencies

**Depend on specific fields:**
```typescript
// ✅ Correct - only re-runs when cards change
useCallback(() => {
  return board.cards;
}, [board?.cards]);

// ❌ Wrong - re-runs on any board change
useCallback(() => {
  return board.cards;
}, [board]);
```

### 4. Form Handling

**Controlled input with keyboard support:**
```typescript
const [value, setValue] = useState('');

<input
  value={value}
  onChange={e => setValue(e.target.value)}
  onKeyDown={e => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') handleCancel();
  }}
  autoFocus
/>
```

---

## ✅ Verification Checklist

After completing Phase 1:

### Functionality
- [ ] Can click "+ Add Card" in any column
- [ ] Input appears and is focused
- [ ] Can type card title
- [ ] Enter key adds card
- [ ] Escape key cancels
- [ ] Card appears immediately after adding
- [ ] Input clears after successful add
- [ ] Empty title doesn't create card
- [ ] Can add multiple cards to same column
- [ ] Can add cards to different columns
- [ ] Cards appear in correct order (0, 1, 2...)
- [ ] Page reload preserves all cards

### Visual
- [ ] Cards have proper styling (Ozhiaki colors)
- [ ] Hover states work
- [ ] Transitions smooth
- [ ] Layout doesn't shift unexpectedly
- [ ] Text readable and properly sized
- [ ] Spacing looks good

### Technical
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Performance smooth (no lag)
- [ ] LocalStorage updates correctly
- [ ] Data structure matches Board interface

---

## 🐛 Common Issues & Fixes

### Issue: Cards not appearing
- Check addCard calls setBoard
- Check getAllColumnsWithCards returns cards
- Check Column component maps over column.cards

### Issue: Cards in wrong order
- Check sort: `.sort((a, b) => a.order - b.order)`
- Verify order calculation: `maxOrder + 1`

### Issue: Input not clearing
- Check `setNewCardTitle('')` after add
- Verify controlled input: `value={newCardTitle}`

### Issue: Cards not persisting
- Check useBoardState calls adapter.saveBoard
- Verify localStorage has data
- Check JSON serialization works

### Issue: TypeScript errors
- Verify all Card fields present
- Check imports correct
- Run `npx tsc --noEmit`

---

## 📊 Files Modified

### Created (if using detailed specs):
- Phase-1-Task-3-Build-Card-Component.md
- Phase-1-Task-4-Build-Column-Component.md
- Phase-1-Task-5-Update-KanbanBoard.md
- Phase-1-Task-6-Testing-And-Polish.md

### Updated:
- `hooks/useBoardActions.ts` (Task 1)
- `hooks/useBoardSelectors.ts` (Task 2)
- `components/Card.tsx` (Task 3)
- `components/Column.tsx` (Task 4)
- `components/KanbanBoard.tsx` (Task 5)

---

## ⏱️ Time Expectations

| Task | Estimated | Focus |
|------|-----------|-------|
| Task 1: AddCard | 45-60 min | Business logic |
| Task 2: Selectors | 30-45 min | Memoization |
| Task 3: Card | 30-45 min | Styling |
| Task 4: Column | 45-60 min | Form + UX |
| Task 5: Integration | 30 min | Connecting pieces |
| Task 6: Testing | 30-45 min | Polish + verify |
| **Total** | **3-4 hours** | |

**If faster:** Great! You're efficient.  
**If slower:** Normal. Take time to do it right.

---

## 🎨 Design Reference

**Ozhiaki Colors:**
- Primary: `var(--color-primary)` - CMU Maroon (#6a0032)
- Secondary: `var(--color-secondary)` - Forest Green (#2d5016)
- Text: `var(--color-text)` - Near black / near white
- Surface: `var(--color-surface)` - Light gray / dark gray

**Use Tailwind with CSS variables:**
```typescript
className="bg-[var(--color-surface)] text-[var(--color-text)]"
```

---

## 🚀 After Phase 1

Once complete and verified:

1. **Commit everything:**
   ```bash
   git add .
   git commit -m "Phase 1 complete: Static rendering with card creation"
   git push origin main
   ```

2. **Test with real usage:**
   - Create 10-20 cards
   - Use for actual task tracking
   - Find any UX issues

3. **Take a break!**
   - Phase 1 is substantial work
   - Next phase (drag & drop) builds on this

4. **Move to Phase 2:**
   - Implement drag and drop
   - Allow card reordering
   - Move cards between columns

---

## 📞 Support Resources

**If stuck on architecture:**
- Review `Agwakwagan-Architecture-Design.md`
- Check normalized data model section
- Understand immutable updates pattern

**If stuck on implementation:**
- Review task file carefully
- Check code examples
- Verify dependencies installed
- Test smaller pieces in isolation

**If performance issues:**
- Check memoization dependencies
- Verify no unnecessary re-renders
- Use React DevTools Profiler

---

## ✨ Success Criteria

**Phase 1 is successful when:**

- ✅ User can add cards to columns
- ✅ Cards display beautifully
- ✅ Data persists across reloads
- ✅ No errors in console
- ✅ Smooth, responsive UI
- ✅ Code is clean and well-typed
- ✅ Ready for Phase 2 (drag & drop)

---

## 🎯 Definition of Done

- [x] Task 1: addCard implemented and tested
- [x] Task 2: Selectors implemented with memoization
- [x] Task 3: Card component styled
- [x] Task 4: Column component with add form
- [x] Task 5: KanbanBoard integrated
- [x] Task 6: Tested and polished
- [x] All files committed to Git
- [x] Verification checklist complete
- [x] Ready for Phase 2

---

**Files available for download below. Good luck with Phase 1!**

Remember: Take your time, test thoroughly, and don't skip verification steps.
