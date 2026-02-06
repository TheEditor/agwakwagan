# Agwakwagan Quick Fixes Task Specification

## Beads Issue Setup

**Note:** `br` is non-invasive and never executes git commands. After `br sync --flush-only`, you must manually run `git add .beads/ && git commit`.

### Create Parent Issue
```bash
br create "Fix broken UI interactions in Agwakwagan" -p 2 --json
# Note the parent ID (e.g., agwa-x1y2)
```

### Create Child Issues
```bash
# Issue 1: Settings Button
br create "Settings button has no onClick handler" -p 2 --parent agwa-x1y2 --json

# Issue 2: Edit Icon  
br create "Card edit icon doesn't trigger edit mode" -p 2 --parent agwa-x1y2 --json

# Claim both
br update agwa-xxxx --status in_progress --json
br update agwa-yyyy --status in_progress --json
```

---

## Task 1: Fix Settings Button (30 min)

### Problem
Settings button in header is decorative only - no onClick handler.

### Files to Check
- `components/Header.tsx` or `components/BoardHeader.tsx`
- Look for Settings/gear icon component

### Implementation
```typescript
// Add state for settings modal/dropdown
const [showSettings, setShowSettings] = useState(false);

// Add onClick handler
<button onClick={() => setShowSettings(true)}>
  <SettingsIcon />
</button>

// Add modal/dropdown component
{showSettings && (
  <SettingsModal onClose={() => setShowSettings(false)}>
    {/* Board name, theme toggle, export/import */}
  </SettingsModal>
)}
```

### Acceptance Criteria
- [ ] Settings button responds to clicks
- [ ] Shows modal/dropdown with at least placeholder content
- [ ] Can dismiss modal/dropdown
- [ ] No console errors

### Verification
1. Click Settings button → modal appears
2. Click outside/X → modal closes
3. Check console for errors

---

## Task 2: Fix Card Edit Icon (45 min)

### Problem  
Edit icon on cards doesn't trigger edit mode. Likely missing onClick or wrong state reference.

### Files to Check
- `components/Card.tsx` or `components/KanbanCard.tsx`
- Look for edit icon in card header
- Check `useCard` or `useBoard` hooks for edit state

### Likely Issues
1. Missing onClick handler on edit icon
2. Wrong card ID passed to edit handler
3. Edit state not wired to UI

### Implementation Pattern
```typescript
// In Card component
const { setEditingCardId } = useBoard();

// On edit icon
<button onClick={() => setEditingCardId(card.id)}>
  <EditIcon />
</button>

// Card should check
{editingCardId === card.id ? (
  <CardEditForm />
) : (
  <CardDisplay />
)}
```

### Acceptance Criteria
- [ ] Click edit icon → card enters edit mode
- [ ] Can modify title/description
- [ ] Save/Cancel buttons work
- [ ] Edit mode exits after save
- [ ] Only one card in edit mode at a time

### Verification
1. Click edit icon on any card
2. Card shows input fields
3. Edit text and save
4. Changes persist in localStorage
5. Refresh page - changes remain

---

## Testing Checklist

### Pre-Implementation
- [ ] Pull latest code
- [ ] Verify both issues exist
- [ ] Note current console errors

### Post-Implementation  
- [ ] Settings button functional
- [ ] Card edit mode working
- [ ] No new TypeScript errors
- [ ] No console errors
- [ ] Changes persist on refresh
- [ ] Mobile responsive (if applicable)

### Commit Pattern
```bash
# After Task 1
git commit -m "fix: Add onClick handler to Settings button (br:agwa-xxxx)"

# After Task 2  
git commit -m "fix: Wire edit icon to card edit mode (br:agwa-yyyy)"

# Close issues
br close agwa-xxxx --json
br close agwa-yyyy --json
```

---

## Common Pitfalls

1. **State Management**: Ensure using correct state hooks (useBoard vs local state)
2. **ID References**: Verify passing correct card.id not index
3. **Event Bubbling**: stopPropagation() on edit click if card is draggable
4. **localStorage**: Test persistence after fixes
5. **TypeScript**: May need to update interfaces if adding new props

---

## Time Estimate

- Task 1: 30 minutes
- Task 2: 45 minutes  
- Testing: 15 minutes
- **Total: ~1.5 hours**

Start with Task 1 (simpler), build momentum for Task 2.