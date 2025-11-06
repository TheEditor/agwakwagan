# Phase 1 - Remaining Tasks (Quick Reference)

**Tasks 3-6 Summary** - Full details in individual files

---

## Task 3: Build Card Component (30-45 min)

**File:** `Phase-1-Task-3-Build-Card-Component.md`

**What to do:**
- Update `components/Card.tsx` with full styling
- Apply Ozhiaki theme colors
- Add hover states and transitions
- Show title, description (if exists), notes count
- Make responsive and accessible

**Key code:**
```typescript
<div className="bg-white dark:bg-[var(--color-surface)] 
                border border-[var(--color-border)]
                rounded-lg p-3 mb-2 
                shadow-sm hover:shadow-md 
                transition-all duration-200
                cursor-pointer">
  <h3 className="text-sm font-medium text-[var(--color-text)]">
    {card.title}
  </h3>
  {/* ... */}
</div>
```

---

## Task 4: Build Column Component (45-60 min)

**File:** `Phase-1-Task-4-Build-Column-Component.md`

**What to do:**
- Update `components/Column.tsx` with add card form
- Implement inline input with Enter/Escape handling
- Add validation (empty title prevention)
- Show card list using Card component
- Clear input after successful add

**Key code:**
```typescript
const [isAdding, setIsAdding] = useState(false);
const [newCardTitle, setNewCardTitle] = useState('');

const handleAdd = () => {
  if (newCardTitle.trim()) {
    onAddCard(column.id, newCardTitle);
    setNewCardTitle('');
    setIsAdding(false);
  }
};

{!isAdding ? (
  <button onClick={() => setIsAdding(true)}>+ Add Card</button>
) : (
  <input
    value={newCardTitle}
    onChange={e => setNewCardTitle(e.target.value)}
    onKeyDown={e => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') setIsAdding(false);
    }}
    autoFocus
  />
)}
```

---

## Task 5: Update KanbanBoard (30 min)

**File:** `Phase-1-Task-5-Update-KanbanBoard.md`

**What to do:**
- Update `components/KanbanBoard.tsx` to use real Column components
- Pass addCard callback down
- Render columns from getAllColumnsWithCards
- Handle loading state properly

**Key code:**
```typescript
const { getAllColumnsWithCards, addCard } = useBoard();
const columns = getAllColumnsWithCards();

return (
  <div className="flex gap-4">
    {columns.map(column => (
      <Column
        key={column.id}
        column={column}
        onAddCard={addCard}
      />
    ))}
  </div>
);
```

---

## Task 6: Testing and Polish (30-45 min)

**File:** `Phase-1-Task-6-Testing-And-Polish.md`

**What to do:**
- Test adding cards to all columns
- Test edge cases (empty title, very long title, many cards)
- Verify persistence (reload page)
- Check keyboard navigation
- Fix any bugs found
- Polish UX (focus management, transitions)
- Git commit

**Test checklist:**
- [ ] Can add card to each column
- [ ] Cards appear immediately
- [ ] Cards sorted correctly
- [ ] Input clears after add
- [ ] Enter key works
- [ ] Escape key works
- [ ] Page reload preserves cards
- [ ] No console errors

---

## Files You'll Create/Update

### Update:
- `components/Card.tsx` (Task 3)
- `components/Column.tsx` (Task 4)
- `components/KanbanBoard.tsx` (Task 5)

### Test in:
- Browser at http://localhost:3000
- LocalStorage in DevTools
- Multiple browsers

---

## Quick Win Path

**If short on time, minimum viable:**
1. ✅ Task 1 (addCard) - Critical
2. ✅ Task 2 (selectors) - Critical
3. ✅ Task 3 (Card styling) - Can use basic styling
4. ✅ Task 4 (Column + add form) - Critical
5. ✅ Task 5 (KanbanBoard integration) - Critical
6. ⏭️ Task 6 (Polish) - Can defer to later

**Total minimum:** ~2 hours for basic functionality

---

## Expected End State

```
Working Board:
┌──────────────────────────────────────┐
│  TODO           PROGRESS      DONE   │
│ ┌─────────┐   ┌─────────┐  ┌──────┐│
│ │Task 1   │   │Task 3   │  │Task 5││
│ │Task 2   │   │Task 4   │  └──────┘│
│ │[+Add]   │   │[+Add]   │  │[+Add]││
│ └─────────┘   └─────────┘  └──────┘│
└──────────────────────────────────────┘
```

**Features working:**
- ✅ Click "+ Add Card"
- ✅ Type title, press Enter
- ✅ Card appears immediately
- ✅ Reload page - cards persist
- ✅ Can add to any column
- ✅ Cards stay in correct order

---

## Git Commits

```bash
git commit -m "Phase 1.1: Implement addCard action"
git commit -m "Phase 1.2: Implement board selectors"
git commit -m "Phase 1.3: Complete Card component styling"
git commit -m "Phase 1.4: Complete Column component with add form"
git commit -m "Phase 1.5: Integrate KanbanBoard"
git commit -m "Phase 1.6: Testing and polish"
git commit -m "Phase 1 complete: Static rendering with card creation"
git push origin main
```

---

**All detailed task files available in outputs folder.**

Start with Task 1, work through sequentially.
