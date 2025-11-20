# Agwakwagan Column Name Editing Task Specification

## Beads Issue Setup

```bash
# Create issue
bd create "Add inline column name editing to Agwakwagan" -p 2 --json
# Note the ID (e.g., agwa-z3w4)

# Claim it
bd claim agwa-z3w4 --json

# Mark in progress when starting
bd update agwa-z3w4 --status in_progress --json
```

---

## Task: Column Name Editing (1-2 hours)

### Problem
No way to edit column names after creation. Users stuck with initial names.

### Architecture Impact
- Modify `Column` interface if needed
- Update `BoardDataSource` save logic
- Add inline edit UI component

### Files to Modify
- `components/Column.tsx` or `components/KanbanColumn.tsx` - Add edit UI
- `hooks/useBoard.ts` - Add `updateColumnTitle` action
- `types/board.ts` - Verify Column interface

---

## Implementation

### 1. Add Edit State to Column Component
```typescript
// components/Column.tsx
const [isEditing, setIsEditing] = useState(false);
const [editTitle, setEditTitle] = useState(column.title);

// Column header JSX
<div className="column-header">
  {isEditing ? (
    <input
      type="text"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
      }}
      autoFocus
      className="column-title-input"
    />
  ) : (
    <h2 
      onClick={() => setIsEditing(true)}
      className="column-title cursor-pointer hover:bg-gray-100"
    >
      {column.title}
    </h2>
  )}
</div>
```

### 2. Add Update Function to useBoard Hook
```typescript
// hooks/useBoard.ts
const updateColumnTitle = useCallback((columnId: string, newTitle: string) => {
  setBoard(prev => {
    if (!prev) return prev;
    
    const updated = {
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          title: newTitle,
          updatedAt: new Date()
        }
      },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    };
    
    // Save to localStorage
    dataSource.saveBoard(updated);
    return updated;
  });
}, [dataSource]);

// Add to returned object
return { ...existing, updateColumnTitle };
```

### 3. Wire Save Handler
```typescript
// In Column component
const { updateColumnTitle } = useBoard();

const handleSave = () => {
  const trimmed = editTitle.trim();
  if (trimmed && trimmed !== column.title) {
    updateColumnTitle(column.id, trimmed);
  }
  setIsEditing(false);
};

const handleCancel = () => {
  setEditTitle(column.title);
  setIsEditing(false);
};
```

---

## UI/UX Requirements

### Visual Indicators
- Hover state on column title (cursor: pointer, subtle background)
- Edit icon appears on hover (optional)
- Input field matches title styling (font size, weight)
- Focus ring on input
- Smooth transition between view/edit modes

### Behavior
- Single click to edit (or click edit icon if added)
- Enter to save
- Escape to cancel
- Click outside (blur) to save
- Empty title reverts to previous
- Trim whitespace on save

### Styling Example
```css
.column-title {
  @apply text-lg font-semibold text-gray-800 
         px-2 py-1 rounded transition-colors;
}

.column-title:hover {
  @apply bg-gray-50;
}

.column-title-input {
  @apply text-lg font-semibold text-gray-800 
         px-2 py-1 border border-blue-400 
         rounded outline-none;
}
```

---

## Edge Cases to Handle

1. **Empty Input**: Don't save empty/whitespace-only titles
2. **Duplicate Names**: Allow (board can have multiple "Done" columns)
3. **Long Names**: Set reasonable max length (50 chars)
4. **Special Characters**: Allow, but sanitize for display
5. **Concurrent Edits**: Only one column editable at a time
6. **API Sync**: Update externalId mapping if column names change

---

## Acceptance Criteria

- [ ] Click column title enters edit mode
- [ ] Can type new name in input field
- [ ] Enter key saves changes
- [ ] Escape key cancels edit
- [ ] Click outside saves changes
- [ ] Empty input doesn't save
- [ ] Changes persist to localStorage
- [ ] Changes survive page refresh
- [ ] Visual feedback on hover
- [ ] Only one column editable at a time
- [ ] No console errors
- [ ] TypeScript compilation passes

---

## Testing Steps

1. **Basic Edit**
   - Click column title → input appears
   - Type new name → press Enter
   - Verify title updated

2. **Cancel Edit**
   - Click title → type text → press Escape
   - Verify original title remains

3. **Blur Save**
   - Click title → type text → click elsewhere
   - Verify new title saved

4. **Empty Input**
   - Click title → clear text → press Enter
   - Verify original title remains

5. **Persistence**
   - Edit column name
   - Refresh page
   - Verify new name persists

6. **API Integration** (if Phase 4 complete)
   - Edit column name
   - Call GET /api/boards/:id/columns
   - Verify new name in response

---

## Implementation Order

1. Add edit state to Column component (20 min)
2. Implement inline edit UI (20 min)
3. Add updateColumnTitle to useBoard (20 min)
4. Wire up save/cancel handlers (15 min)
5. Add styling and hover states (15 min)
6. Test all scenarios (15 min)
7. Fix edge cases (15 min)

**Total: 1.5-2 hours**

---

## Commit Message

```bash
git commit -m "feat: Add inline column name editing (bd:agwa-z3w4)

- Click column title to edit
- Enter to save, Escape to cancel  
- Blur saves changes
- Persists to localStorage"

# Close issue
bd close agwa-z3w4 --json
```

---

## Future Enhancement

After MVP, consider:
- Edit icon instead of click-to-edit
- Column name validation rules
- Undo/redo for name changes
- Activity log entry for renames
- Keyboard shortcut (F2) to edit
