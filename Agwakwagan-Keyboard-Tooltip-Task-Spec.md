# Agwakwagan Keyboard & Tooltip Enhancements Task Specification

## Beads Issue Setup

**Note:** `br` is non-invasive and never executes git commands. After `br sync --flush-only`, you must manually run `git add .beads/ && git commit`.

```bash
# Create parent issue
br create "Add keyboard shortcuts and UI hints to Agwakwagan" -p 3 --json
# Note parent ID (e.g., agwa-p5q6)

# Create child issues
br create "Add tooltips to column action icons" -p 3 --parent agwa-p5q6 --json
br create "Add F2 keyboard hint to UI" -p 3 --parent agwa-p5q6 --json  
br create "Add Delete key shortcut for columns" -p 3 --parent agwa-p5q6 --json

# Claim all (note IDs, e.g., agwa-r7s8, agwa-t9u0, agwa-v1w2)
br update agwa-r7s8 --status in_progress --json
br update agwa-t9u0 --status in_progress --json
br update agwa-v1w2 --status in_progress --json
```

---

## Task 1: Icon Tooltips (15 min)

### Problem
Edit/delete icons have no hover text. Users unsure what they do.

### Files to Modify
- `components/Column.tsx` or `components/KanbanColumn.tsx`

### Implementation - Native HTML

```typescript
// Simplest approach - title attribute
<button
  onClick={() => setIsEditing(true)}
  className="edit-icon opacity-0 group-hover:opacity-100"
  aria-label="Edit column name"
  title="Edit column name (F2)"  // ADD THIS
>
  <PencilIcon className="w-4 h-4" />
</button>

<button
  onClick={() => setShowDeleteModal(true)}
  className="delete-icon opacity-0 group-hover:opacity-100"
  aria-label="Delete column"
  title="Delete column (Del)"  // ADD THIS
>
  <TrashIcon className="w-4 h-4" />
</button>
```

### Implementation - React Tooltip (Better UX)

```typescript
// components/Tooltip.tsx (create simple wrapper)
export function Tooltip({ text, children }: Props) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="tooltip">
          {text}
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
}

// CSS
.tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2
         bg-gray-900 text-white text-xs rounded py-1 px-2
         whitespace-nowrap mb-1 z-50;
}

// Usage in Column
<Tooltip text="Edit column name (F2)">
  <button onClick={() => setIsEditing(true)}>
    <PencilIcon />
  </button>
</Tooltip>
```

### Acceptance Criteria
- [ ] Hover edit icon → shows "Edit column name (F2)"
- [ ] Hover delete icon → shows "Delete column (Del)"
- [ ] Tooltips positioned above icons
- [ ] No tooltip on mobile (no hover)

---

## Task 2: F2 Hint in UI (20-30 min)

### Problem
F2 shortcut exists but not discoverable. Users don't know it's available.

### Option A: Persistent Footer Hint

```typescript
// components/KeyboardHints.tsx
export function KeyboardHints() {
  return (
    <div className="keyboard-hints">
      <span className="hint">
        <kbd>F2</kbd> Edit column
      </span>
      <span className="hint">
        <kbd>Del</kbd> Delete column
      </span>
      <span className="hint">
        <kbd>?</kbd> More shortcuts
      </span>
    </div>
  );
}

// CSS
.keyboard-hints {
  @apply fixed bottom-4 right-4 text-xs text-gray-500
         bg-white/90 backdrop-blur rounded-lg px-3 py-2
         flex gap-4 shadow-sm;
}

kbd {
  @apply bg-gray-100 px-1.5 py-0.5 rounded text-gray-700
         font-mono text-xs border border-gray-300;
}

// Add to BoardView
<div className="board-container">
  {/* columns */}
  <KeyboardHints />
</div>
```

### Option B: Collapsible Hint Bar

```typescript
// components/BoardView.tsx
const [showHints, setShowHints] = useState(
  localStorage.getItem('hideKeyboardHints') !== 'true'
);

// Hint bar at top
{showHints && (
  <div className="hint-bar">
    <div className="hints">
      <span>Quick tips:</span>
      <kbd>F2</kbd> to edit column
      <kbd>Del</kbd> to delete
      <kbd>Tab</kbd> to navigate
    </div>
    <button 
      onClick={() => {
        setShowHints(false);
        localStorage.setItem('hideKeyboardHints', 'true');
      }}
      className="dismiss"
    >
      ✕
    </button>
  </div>
)}
```

### Option C: Edit Form Helper Text

```typescript
// In column edit input area
<input
  type="text"
  value={editTitle}
  // ...
/>
<span className="helper-text">
  Press Enter to save, Esc to cancel
</span>
```

### Acceptance Criteria
- [ ] F2 hint visible somewhere in UI
- [ ] Not intrusive/annoying
- [ ] Can be dismissed (if using bar)
- [ ] Mobile: hide keyboard hints

---

## Task 3: Delete Key Shortcut (30 min)

### Problem  
Users expect Del/Backspace to delete focused column.

### Files to Modify
- `components/Column.tsx` - Add Delete handler

### Implementation

```typescript
// components/Column.tsx
// Add to existing keyboard effect or create new one
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only when column focused, not editing
    if (!isEditing && (isFocused || isHovered)) {
      // Delete or Backspace key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setShowDeleteModal(true);
      }
      
      // Existing F2 handler
      if (e.key === 'F2') {
        e.preventDefault();
        setIsEditing(true);
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isEditing, isFocused, isHovered]);

// Add focus tracking if not present
const [isFocused, setIsFocused] = useState(false);

<div 
  className="column"
  tabIndex={0}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  // existing props...
>
```

### Prevent Accidental Deletion

```typescript
// Option 1: Require modifier key
if ((e.key === 'Delete' || e.key === 'Backspace') && e.shiftKey) {
  // Shift+Del for safety
}

// Option 2: Always show confirmation modal (already implemented)
// Option 3: Don't allow on last column (already implemented)
```

### Acceptance Criteria
- [ ] Focus column → press Del → delete modal appears
- [ ] Backspace also triggers delete
- [ ] Only works when column focused
- [ ] Doesn't trigger during edit mode
- [ ] Doesn't trigger in input fields
- [ ] Modal confirmation still required

---

## Testing Matrix

| Action | Expected Result |
|--------|----------------|
| Hover edit icon | Tooltip "Edit column name (F2)" |
| Hover delete icon | Tooltip "Delete column (Del)" |
| Look for F2 hint | Visible in footer/bar/hint area |
| Tab to column → F2 | Enter edit mode |
| Tab to column → Del | Delete modal appears |
| Edit mode → Del | Types in input (no delete) |
| Focus elsewhere → Del | Nothing happens |
| Mobile view | No tooltips, no keyboard hints |

---

## Combined Implementation Flow

1. Add tooltips to both icons (10 min)
2. Add keyboard hints component (15 min)
3. Add Delete key handler (20 min)
4. Update existing F2 handler if needed (5 min)
5. Test all shortcuts together (10 min)

**Total: 1 hour**

---

## Edge Cases

1. **Input Fields**: Del key should work normally in inputs
2. **Modal Open**: Shortcuts disabled when any modal open
3. **Multiple Columns**: Only focused column responds
4. **Mobile**: Hide keyboard hints, no hover tooltips
5. **Screen Readers**: Announce shortcuts availability

---

## Styling

```css
/* Shared keyboard hint styles */
kbd {
  @apply inline-flex items-center px-1.5 py-0.5
         text-xs font-semibold text-gray-700
         bg-gray-100 border border-gray-300 rounded;
}

/* Tooltip animation */
.tooltip {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hide on mobile */
@media (max-width: 768px) {
  .keyboard-hints,
  .tooltip {
    display: none;
  }
}
```

---

## Commit Messages

```bash
# After Task 1
git commit -m "feat: Add tooltips to column action icons (br:agwa-r7s8)

- Edit icon shows 'Edit column name (F2)'
- Delete icon shows 'Delete column (Del)'
- Better discoverability for shortcuts"

# After Task 2
git commit -m "feat: Add keyboard shortcuts hint to UI (br:agwa-t9u0)

- Persistent hint bar showing available shortcuts
- Can be dismissed by user
- Hidden on mobile devices"

# After Task 3
git commit -m "feat: Add Delete key shortcut for columns (br:agwa-v1w2)

- Del or Backspace triggers delete modal
- Only works on focused column
- Confirmation still required"

# Close issues
br close agwa-r7s8 agwa-t9u0 agwa-v1w2 --json
```

---

## Future Keyboard Shortcuts

After these land, consider:
- `?` - Show all shortcuts modal
- `Ctrl+N` - New column
- `Ctrl+Left/Right` - Reorder columns
- `Enter` - Focus first card in column
- `Escape` - Unfocus/close any modal
- `/` - Search cards (future feature)