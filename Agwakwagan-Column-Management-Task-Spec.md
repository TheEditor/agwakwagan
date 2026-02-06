# Agwakwagan Add/Delete Columns Task Specification

## Beads Issue Setup

**Note:** `br` is non-invasive and never executes git commands. After `br sync --flush-only`, you must manually run `git add .beads/ && git commit`.

```bash
# Create parent issue
br create "Add column management (add/delete) to Agwakwagan" -p 2 --json
# Note parent ID (e.g., agwa-g7h8)

# Create child issues
br create "Implement add new column functionality" -p 2 --parent agwa-g7h8 --json
br create "Implement delete column with card handling" -p 2 --parent agwa-g7h8 --json
br create "Update API endpoints for column operations" -p 3 --parent agwa-g7h8 --json

# Claim all (note IDs, e.g., agwa-i9j0, agwa-k1l2, agwa-m3n4)
br update agwa-i9j0 --status in_progress --json
br update agwa-k1l2 --status in_progress --json
br update agwa-m3n4 --status in_progress --json
```

---

## Task 1: Add Column Functionality (1.5 hours)

### Problem
No way to add columns after board creation. Users stuck with initial columns.

### Files to Modify
- `hooks/useBoard.ts` - Add `addColumn` action
- `components/BoardView.tsx` - Add "New Column" button
- `components/NewColumnForm.tsx` - Create input form
- `types/board.ts` - Verify Column interface

### Implementation - useBoard Hook

```typescript
// hooks/useBoard.ts
const addColumn = useCallback((title: string, afterColumnId?: string) => {
  setBoard(prev => {
    if (!prev) return prev;
    
    const columnId = generateId('col');
    const now = new Date();
    
    // Create new column
    const newColumn: Column = {
      id: columnId,
      title: title.trim(),
      order: 0, // Will recalculate
      createdAt: now,
      updatedAt: now
    };
    
    // Determine position in columnOrder
    let newColumnOrder = [...prev.columnOrder];
    if (afterColumnId) {
      const index = newColumnOrder.indexOf(afterColumnId);
      newColumnOrder.splice(index + 1, 0, columnId);
    } else {
      newColumnOrder.push(columnId); // Add to end
    }
    
    // Recalculate order values
    const updatedColumns = { ...prev.columns, [columnId]: newColumn };
    newColumnOrder.forEach((id, index) => {
      if (updatedColumns[id]) {
        updatedColumns[id].order = index;
      }
    });
    
    const updated = {
      ...prev,
      columns: updatedColumns,
      columnOrder: newColumnOrder,
      metadata: { ...prev.metadata, updatedAt: now }
    };
    
    dataSource.saveBoard(updated);
    return updated;
  });
}, [dataSource]);
```

### Implementation - UI Component

```typescript
// components/BoardView.tsx
const [showNewColumn, setShowNewColumn] = useState(false);

// After last column
<div className="board-container">
  {/* Existing columns */}
  {columnOrder.map(id => <Column key={id} />)}
  
  {/* Add column button/form */}
  <div className="add-column-container">
    {showNewColumn ? (
      <NewColumnForm
        onSubmit={(title) => {
          addColumn(title);
          setShowNewColumn(false);
        }}
        onCancel={() => setShowNewColumn(false)}
      />
    ) : (
      <button
        onClick={() => setShowNewColumn(true)}
        className="add-column-btn"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Add Column</span>
      </button>
    )}
  </div>
</div>
```

### Implementation - New Column Form

```typescript
// components/NewColumnForm.tsx
export function NewColumnForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="new-column-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Column name..."
        maxLength={50}
        autoFocus
        className="column-name-input"
      />
      <div className="form-buttons">
        <button type="submit" disabled={!title.trim()}>
          Add
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
```

---

## Task 2: Delete Column Functionality (2 hours)

### Problem
No way to remove columns. Must handle cards in deleted column.

### Card Handling Options
1. **Move to another column** (recommended)
2. Delete all cards (destructive)
3. Archive cards (future feature)

### Implementation - Delete Confirmation Modal

```typescript
// components/DeleteColumnModal.tsx
interface Props {
  column: Column;
  cardCount: number;
  targetColumns: Column[];
  onConfirm: (targetColumnId?: string) => void;
  onCancel: () => void;
}

export function DeleteColumnModal({ 
  column, 
  cardCount, 
  targetColumns, 
  onConfirm, 
  onCancel 
}: Props) {
  const [targetColumnId, setTargetColumnId] = useState(
    targetColumns[0]?.id
  );
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Delete "{column.title}"?</h2>
        
        {cardCount > 0 ? (
          <>
            <p>This column contains {cardCount} card(s).</p>
            <div className="card-handling">
              <label>
                <input
                  type="radio"
                  checked={!!targetColumnId}
                  onChange={() => {}}
                />
                Move cards to:
                <select
                  value={targetColumnId}
                  onChange={(e) => setTargetColumnId(e.target.value)}
                  disabled={!targetColumnId}
                >
                  {targetColumns.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <input
                  type="radio"
                  checked={!targetColumnId}
                  onChange={() => setTargetColumnId(undefined)}
                />
                Delete all cards (cannot be undone)
              </label>
            </div>
          </>
        ) : (
          <p>Column is empty and will be removed.</p>
        )}
        
        <div className="modal-buttons">
          <button 
            onClick={() => onConfirm(targetColumnId)}
            className="btn-danger"
          >
            Delete Column
          </button>
          <button onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Implementation - Delete Column Action

```typescript
// hooks/useBoard.ts
const deleteColumn = useCallback((
  columnId: string, 
  moveCardsTo?: string
) => {
  setBoard(prev => {
    if (!prev || !prev.columns[columnId]) return prev;
    
    // Can't delete last column
    if (prev.columnOrder.length <= 1) {
      alert('Cannot delete the last column');
      return prev;
    }
    
    const now = new Date();
    const updatedCards = { ...prev.cards };
    
    // Handle cards in deleted column
    const cardsInColumn = Object.values(updatedCards)
      .filter(c => c.columnId === columnId);
    
    if (moveCardsTo && prev.columns[moveCardsTo]) {
      // Move cards to target column
      const targetCards = Object.values(updatedCards)
        .filter(c => c.columnId === moveCardsTo);
      const maxOrder = Math.max(0, ...targetCards.map(c => c.order));
      
      cardsInColumn.forEach((card, index) => {
        card.columnId = moveCardsTo;
        card.order = maxOrder + index + 1;
        card.updatedAt = now;
      });
    } else {
      // Delete cards
      cardsInColumn.forEach(card => {
        delete updatedCards[card.id];
      });
    }
    
    // Remove column
    const updatedColumns = { ...prev.columns };
    delete updatedColumns[columnId];
    
    const updatedColumnOrder = prev.columnOrder
      .filter(id => id !== columnId);
    
    // Recalculate order
    updatedColumnOrder.forEach((id, index) => {
      if (updatedColumns[id]) {
        updatedColumns[id].order = index;
      }
    });
    
    const updated = {
      ...prev,
      columns: updatedColumns,
      columnOrder: updatedColumnOrder,
      cards: updatedCards,
      metadata: { ...prev.metadata, updatedAt: now }
    };
    
    dataSource.saveBoard(updated);
    return updated;
  });
}, [dataSource]);
```

### Implementation - Delete Button in Column

```typescript
// components/Column.tsx
const [showDeleteModal, setShowDeleteModal] = useState(false);
const { deleteColumn } = useBoard();

// In column header (near edit icon)
<button
  onClick={() => setShowDeleteModal(true)}
  className="delete-icon opacity-0 group-hover:opacity-100"
  aria-label="Delete column"
>
  <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-700" />
</button>

// Modal
{showDeleteModal && (
  <DeleteColumnModal
    column={column}
    cardCount={cardsInColumn.length}
    targetColumns={otherColumns}
    onConfirm={(targetId) => {
      deleteColumn(column.id, targetId);
      setShowDeleteModal(false);
    }}
    onCancel={() => setShowDeleteModal(false)}
  />
)}
```

---

## Task 3: API Updates (30 min)

### If Phase 4 Complete

**File: `app/api/boards/[boardId]/columns/route.ts`**

```typescript
// POST /api/boards/:boardId/columns
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (!body.title) {
    return NextResponse.json(
      { error: 'title is required' },
      { status: 400 }
    );
  }
  
  const board = await dataSource.loadBoard(params.boardId);
  const columnId = generateId('col');
  
  // Add column logic (reuse from useBoard)
  // ...
  
  return NextResponse.json(
    { id: columnId, title: body.title },
    { status: 201 }
  );
}

// DELETE /api/boards/:boardId/columns/:columnId
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moveCardsTo = searchParams.get('moveCardsTo');
  
  // Delete column logic (reuse from useBoard)
  // ...
  
  return new NextResponse(null, { status: 204 });
}
```

---

## Edge Cases & Validation

1. **Last Column**: Prevent deletion of last column
2. **Column Names**: Trim, max 50 chars, allow duplicates
3. **Card Movement**: Preserve relative order when moving
4. **Empty Columns**: Skip card handling UI if empty
5. **Max Columns**: Consider limit (10-20 columns?)
6. **Mobile**: Horizontal scroll for many columns
7. **External IDs**: Update cards' external references if moved

---

## Acceptance Criteria

### Add Column
- [ ] "Add Column" button visible after last column
- [ ] Click button shows input form
- [ ] Enter/Submit creates column
- [ ] Escape/Cancel closes form
- [ ] New column appears at end
- [ ] Empty name prevented
- [ ] Persists to localStorage

### Delete Column
- [ ] Delete icon on column hover
- [ ] Click shows confirmation modal
- [ ] Shows card count if not empty
- [ ] Can choose target column for cards
- [ ] Can choose to delete cards
- [ ] Last column cannot be deleted
- [ ] Changes persist

### API (if applicable)
- [ ] POST /api/boards/:id/columns works
- [ ] DELETE /api/boards/:id/columns/:id works
- [ ] Proper error responses

---

## Testing Scenarios

1. **Add Column Flow**
   - Click Add → Type name → Enter → Column appears
   - Add multiple columns rapidly
   - Cancel add operation

2. **Delete Empty Column**
   - Delete empty column → Immediate removal

3. **Delete Column with Cards**
   - Delete → Modal shows count
   - Move cards → Cards appear in target
   - Delete cards → Cards removed

4. **Edge Cases**
   - Try to delete last column → Prevented
   - Add column with 100 char name → Truncated
   - Add 20 columns → UI still usable

5. **Persistence**
   - Add column → Refresh → Still there
   - Delete column → Refresh → Still gone
   - Move cards → Refresh → In new column

---

## Time Breakdown

- Add Column: 1.5 hours
- Delete Column: 2 hours  
- API Updates: 30 min
- Testing: 30 min
- **Total: 4 hours**

---

## Commit Messages

```bash
# After Add Column
git commit -m "feat: Add new column creation (br:agwa-i9j0)

- Add Column button after last column
- Inline form for column name
- Persists to localStorage"

# After Delete Column
git commit -m "feat: Add column deletion with card handling (br:agwa-k1l2)

- Delete icon on column hover
- Confirmation modal with options
- Move or delete cards in column
- Prevent deleting last column"

# After API Updates
git commit -m "feat: Add column API endpoints (br:agwa-m3n4)

- POST /api/boards/:id/columns
- DELETE /api/boards/:id/columns/:id
- Handle card movement via query param"

# Close issues
br close agwa-i9j0 agwa-k1l2 agwa-m3n4 --json
```

---

## Dependencies

```bash
# Icons (if not installed)
npm install @heroicons/react
```

---

## Future Enhancements

- Drag columns between positions (reorder)
- Column templates (preset columns)
- Bulk operations (delete multiple)
- Archive instead of delete
- Undo/redo support
- Activity log entries