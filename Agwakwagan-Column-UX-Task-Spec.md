# Agwakwagan Column UX Improvements Task Specification

## Beads Issue Setup

**Note:** `br` is non-invasive and never executes git commands. After `br sync --flush-only`, you must manually run `git add .beads/ && git commit`.

```bash
# Create parent issue
br create "Add column editing UX improvements" -p 3 --json
# Note parent ID (e.g., agwa-a1b2)

# Create child issues
br create "Add edit icon to columns instead of click-to-edit" -p 3 --parent agwa-a1b2 --json
br create "Add F2 keyboard shortcut for column editing" -p 3 --parent agwa-a1b2 --json

# Claim both (note IDs, e.g., agwa-c3d4, agwa-e5f6)
br update agwa-c3d4 --status in_progress --json
br update agwa-e5f6 --status in_progress --json
```

---

## Task 1: Edit Icon Button (20 min)

### Problem
Click-to-edit on title text is not discoverable. Users expect edit icon.

### Files to Modify
- `components/Column.tsx` or `components/KanbanColumn.tsx`

### Implementation
```typescript
// Add edit icon (pencil/edit) to column header
import { PencilIcon } from '@heroicons/react/24/outline';

// Replace clickable title with icon button
<div className="column-header flex items-center justify-between">
  {isEditing ? (
    <input {...existing} />
  ) : (
    <>
      <h2 className="column-title">{column.title}</h2>
      <button
        onClick={() => setIsEditing(true)}
        className="edit-icon opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Edit column name"
      >
        <PencilIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
      </button>
    </>
  )}
</div>

// Add group class to column container
<div className="column group">
```

### Styling
```css
/* Show icon on column hover */
.column:hover .edit-icon {
  @apply opacity-100;
}

/* Always show on mobile (no hover) */
@media (max-width: 768px) {
  .edit-icon {
    @apply opacity-100;
  }
}
```

### Acceptance Criteria
- [ ] Edit icon appears on column hover
- [ ] Icon always visible on mobile
- [ ] Click icon enters edit mode
- [ ] Title text no longer clickable
- [ ] Proper aria-label for accessibility

---

## Task 2: F2 Keyboard Shortcut (30-45 min)

### Problem  
Power users expect F2 to trigger edit mode (standard in many apps).

### Files to Modify
- `components/Column.tsx` or `components/KanbanColumn.tsx`

### Implementation
```typescript
// Add keyboard handler to column
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only if column is focused/hovered
    if (e.key === 'F2' && !isEditing && isHovered) {
      e.preventDefault();
      setIsEditing(true);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isEditing, isHovered]);

// Add hover tracking
const [isHovered, setIsHovered] = useState(false);

// Add tabindex and hover handlers to column
<div 
  className="column group"
  tabIndex={0}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onFocus={() => setIsHovered(true)}
  onBlur={() => setIsHovered(false)}
>
```

### Alternative: Global F2
```typescript
// In useBoard hook - edit focused column
const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    const focused = document.activeElement;
    const column = focused?.closest('.column');
    if (column) {
      const editBtn = column.querySelector('.edit-icon');
      editBtn?.click();
    }
  }
};
```

### Accessibility
- Column needs `tabindex="0"` for keyboard nav
- Focus ring styling when tabbed to
- Screen reader announces "Press F2 to edit"

### Acceptance Criteria
- [ ] F2 triggers edit when column focused/hovered
- [ ] F2 does nothing if already editing
- [ ] Column focusable via Tab key
- [ ] Visual focus indicator
- [ ] No conflicts with other shortcuts
- [ ] Works with screen readers

---

## Testing Checklist

### Task 1 - Edit Icon
1. Hover column → icon appears
2. Move away → icon disappears  
3. Click icon → edit mode
4. Click title → nothing happens
5. Mobile view → icon always visible

### Task 2 - F2 Shortcut
1. Tab to column → focus ring appears
2. Press F2 → edit mode
3. Press F2 while editing → nothing
4. F2 on unfocused column → nothing
5. Test with screen reader

### Combined Testing
1. Tab to column → F2 → edit
2. Save with Enter
3. Click edit icon → edit again
4. Both methods work consistently

---

## Edge Cases

1. **Multiple columns**: Only focused/hovered column responds to F2
2. **Mobile**: No hover state, icon always visible
3. **Screen readers**: Announce edit capability
4. **Existing shortcuts**: Ensure no conflicts
5. **Focus management**: Return focus after edit

---

## Implementation Order

1. Add edit icon (15 min)
2. Remove click-to-edit from title (5 min)
3. Add F2 handler to column (20 min)
4. Add focus/hover tracking (10 min)
5. Test both features together (10 min)
6. Fix edge cases (15 min)

**Total: 1-1.25 hours**

---

## Commit Messages

```bash
# After Task 1
git commit -m "feat: Add edit icon button to columns (br:agwa-c3d4)

- Replace click-to-edit with explicit edit icon
- Icon appears on hover (always visible on mobile)
- Improves discoverability"

# After Task 2
git commit -m "feat: Add F2 keyboard shortcut for column editing (br:agwa-e5f6)

- F2 triggers edit mode on focused column
- Columns now keyboard navigable (tabindex)
- Standard keyboard pattern for power users"

# Close issues
br close agwa-c3d4 --json
br close agwa-e5f6 --json
```

---

## Code Libraries

```bash
# If not already installed
npm install @heroicons/react
# or use existing icon library (lucide-react, react-icons, etc.)
```

---

## Future Enhancements

After these land:
- Tooltip on icon hover ("Edit column name")
- F2 hint in UI somewhere
- Bulk edit mode (edit all columns)
- More keyboard shortcuts (Del to delete column)