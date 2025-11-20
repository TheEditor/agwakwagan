# UBS Critical Fixes - Beads Task Specification

**Project:** Agwakwagan  
**Source:** UBS scan results 2025-11-19  
**Priority:** High - 11 critical issues identified  
**Epic:** Code Quality - UBS Critical Fixes

---

## Task Dependency Structure

```
epic: ubs-critical-fixes
├── task: fix-react-setstate-loops (no deps)
├── task: fix-useeffect-cleanup (no deps)
└── task: fix-react-key-props (depends: fix-react-setstate-loops)
```

---

## Epic Definition

### Epic: ubs-critical-fixes
**Title:** Fix UBS Critical Issues - React State & Lifecycle  
**Description:**  
Address 11 critical issues identified by UBS scanner that can cause:
- Race conditions from setState in loops
- Memory leaks from missing useEffect cleanup
- Rendering bugs from improper React keys

**Acceptance Criteria:**
- All 11 critical issues resolved
- `ubs src/ --fail-on-warning` exits 0
- No new critical issues introduced
- Existing functionality preserved (smoke test passes)

**Estimated Effort:** 3-4 hours total

---

## Task 1: Fix React setState in Loops

### Metadata
```
beads create \
  --title "Fix setState calls inside loops (3 instances)" \
  --priority high \
  --estimate 1h \
  --parent ubs-critical-fixes
```

### Description
**Issue:** React setState called inside loops can cause race conditions and excessive re-renders.

**Locations:**
1. `src/components/Board.tsx` - setState in map/forEach
2. `src/components/Card.tsx` - setState in iteration
3. `src/components/Column.tsx` - setState in loop

**Root Cause:**  
Multiple setState calls in tight loops don't batch properly, causing:
- Intermediate states visible to render
- Race conditions if order matters
- Performance degradation

### Solution Approach

**Pattern to fix:**
```typescript
// ❌ BAD - setState in loop
items.forEach(item => {
  setData(prev => ({ ...prev, [item.id]: item }));
});

// ✅ GOOD - Batch state update
setData(prev => {
  const updates = {};
  items.forEach(item => {
    updates[item.id] = item;
  });
  return { ...prev, ...updates };
});
```

### Implementation Steps

1. **Locate exact instances:**
   ```bash
   cd src/components
   grep -n "setState.*forEach\|setState.*map\|forEach.*setState" *.tsx
   ```

2. **For each instance:**
   - Accumulate changes in temporary variable
   - Apply single setState with accumulated changes
   - Verify no logic depends on intermediate state

3. **Test:**
   - Drag & drop operations (Board.tsx likely location)
   - Card editing (Card.tsx)
   - Column operations (Column.tsx)

### Acceptance Criteria
- [ ] No setState calls inside forEach/map/for loops
- [ ] `ubs src/components/Board.tsx src/components/Card.tsx src/components/Column.tsx` reports 0 critical
- [ ] All drag-and-drop operations work correctly
- [ ] Card editing persists properly
- [ ] Column operations (add/remove/reorder) function normally

### Verification Command
```bash
ubs src/components/Board.tsx src/components/Card.tsx src/components/Column.tsx --fail-on-warning
```

---

## Task 2: Fix Missing useEffect Cleanup

### Metadata
```
beads create \
  --title "Add cleanup functions to useEffect hooks (2 instances)" \
  --priority high \
  --estimate 1.5h \
  --parent ubs-critical-fixes
```

### Description
**Issue:** useEffect hooks without cleanup functions cause memory leaks when components unmount.

**Locations:**
2 instances found (exact locations need grep verification)

**Root Cause:**  
Effects that:
- Add event listeners
- Set timers (setTimeout/setInterval)
- Subscribe to external services

...without cleanup will continue running after unmount.

### Solution Approach

**Pattern to fix:**
```typescript
// ❌ BAD - No cleanup
useEffect(() => {
  document.addEventListener('keydown', handleKeyPress);
  const timer = setInterval(autoSave, 30000);
}, []);

// ✅ GOOD - With cleanup
useEffect(() => {
  document.addEventListener('keydown', handleKeyPress);
  const timer = setInterval(autoSave, 30000);
  
  return () => {
    document.removeEventListener('keydown', handleKeyPress);
    clearInterval(timer);
  };
}, []);
```

### Implementation Steps

1. **Find exact instances:**
   ```bash
   cd src
   # Search for useEffect with addEventListener/setInterval/setTimeout
   rg "useEffect.*addEventListener|useEffect.*setInterval|useEffect.*setTimeout" -A 5
   ```

2. **For each useEffect:**
   - Identify what resources are acquired:
     - Event listeners? → Add removeEventListener
     - Timers? → Add clearTimeout/clearInterval
     - Subscriptions? → Add unsubscribe
   - Return cleanup function
   - Verify cleanup uses same references as setup

3. **Common locations to check:**
   - Keyboard shortcut handlers
   - Auto-save timers
   - Window resize listeners
   - Document click handlers

### Acceptance Criteria
- [ ] All useEffect hooks with side effects have cleanup returns
- [ ] Event listeners removed on unmount
- [ ] Timers cleared on unmount
- [ ] No console errors when navigating between boards
- [ ] `ubs src/ --fail-on-warning` shows 0 critical for cleanup

### Verification Commands
```bash
# Scan for issues
ubs src/ --category=5

# Manual test: Open DevTools Console, navigate between views
# Should see no "memory leak" warnings or orphaned timers
```

---

## Task 3: Fix React Key Props

### Metadata
```
beads create \
  --title "Replace array index keys with stable IDs (6 instances)" \
  --priority high \
  --estimate 1.5h \
  --parent ubs-critical-fixes \
  --depends fix-react-setstate-loops
```

### Description
**Issue:** Using array index as React key prop causes rendering bugs when list order changes.

**Locations:**
6 instances across components (likely Board, Column, Card rendering)

**Root Cause:**  
When using index as key:
- Reordering breaks component identity
- React reuses wrong components
- State gets attached to wrong items
- Animations/transitions break

**Why depends on Task 1:**  
Key prop fixes work best after state management is stable.

### Solution Approach

**Pattern to fix:**
```typescript
// ❌ BAD - Index as key
{items.map((item, index) => (
  <Card key={index} {...item} />
))}

// ✅ GOOD - Stable ID as key
{items.map(item => (
  <Card key={item.id} {...item} />
))}
```

### Implementation Steps

1. **Locate all instances:**
   ```bash
   cd src
   rg "key=\{.*index.*\}|key=.*index" --type tsx
   ```

2. **Verify ID availability:**
   - Cards have `id` property (from `generateId`)
   - Columns have `id` property
   - Board items have stable identifiers

3. **For each instance:**
   - Replace `key={index}` with `key={item.id}`
   - If item lacks ID, add ID generation at creation point
   - Ensure IDs persist through operations (drag/drop, edit)

4. **Common locations:**
   - Board.tsx: rendering columns
   - Column.tsx: rendering cards
   - Card.tsx: rendering subtasks/checklists
   - Any list rendering in utils/components

### Acceptance Criteria
- [ ] No `key={index}` or `key={i}` patterns in codebase
- [ ] All list items use stable IDs as keys
- [ ] Drag-and-drop maintains component state correctly
- [ ] Reordering doesn't cause visual glitches
- [ ] Card edit state persists through reorder
- [ ] `ubs src/ --fail-on-warning` shows 0 critical for key props

### Test Procedure
1. Create 3 cards in a column
2. Edit middle card (open modal/inline edit)
3. Drag top card to bottom
4. Verify middle card edit state unchanged
5. Verify no React warnings in console

### Verification Command
```bash
ubs src/ --fail-on-warning
```

---

## Implementation Order

Execute in this sequence:

1. **Task 1** (setState loops) - Foundation fix
2. **Task 2** (useEffect cleanup) - Parallel to Task 1, independent
3. **Task 3** (key props) - After Task 1 completes

**Rationale:**  
- Task 1 & 2 are independent, can run parallel
- Task 3 depends on stable state management from Task 1
- Each task can be tested and committed independently

---

## Import into Beads

Run these commands from project root:

```bash
# Create epic
beads create \
  --title "Fix UBS Critical Issues - React State & Lifecycle" \
  --priority high \
  --labels "code-quality,ubs,critical"

# Get epic ID (replace <EPIC_ID> in commands below)
beads list --filter priority:high | grep "UBS Critical"

# Create Task 1
beads create \
  --title "Fix setState calls inside loops (3 instances)" \
  --priority high \
  --estimate 1h \
  --parent <EPIC_ID> \
  --labels "react,performance,critical"

# Create Task 2
beads create \
  --title "Add cleanup functions to useEffect hooks (2 instances)" \
  --priority high \
  --estimate 1.5h \
  --parent <EPIC_ID> \
  --labels "react,memory-leak,critical"

# Create Task 3 (get Task 1 ID first)
beads create \
  --title "Replace array index keys with stable IDs (6 instances)" \
  --priority high \
  --estimate 1.5h \
  --parent <EPIC_ID> \
  --depends <TASK_1_ID> \
  --labels "react,rendering,critical"
```

---

## Verification After All Fixes

### Full Scan
```bash
ubs src/ --fail-on-warning
```

**Expected:** Exit code 0, or only INFO-level items remaining

### Smoke Test
1. Create new board
2. Add 3 columns
3. Add 5 cards across columns
4. Drag cards between columns
5. Edit card while others are being dragged
6. Delete column
7. Refresh page
8. Verify localStorage persists
9. Open DevTools console - no errors/warnings

### Performance Check
```bash
# Before fixes - note the timing
ubs . > before-fixes.txt 2>&1

# After fixes
ubs . > after-fixes.txt 2>&1

# Compare critical counts
grep "Critical issues:" before-fixes.txt after-fixes.txt
```

---

## Post-Fix Actions

1. **Commit convention:**
   ```bash
   git commit -m "fix: resolve UBS critical issue - [specific issue]
   
   - Fixed setState in loops for [component]
   - Added useEffect cleanup for [hook]
   - Replaced index keys with stable IDs
   
   Closes beads:<TASK_ID>"
   ```

2. **Update CI (if applicable):**
   Add pre-commit hook:
   ```bash
   ubs src/ --fail-on-warning
   ```

3. **Document in CHANGELOG:**
   ```markdown
   ## [Unreleased]
   ### Fixed
   - React setState race conditions in Board/Card/Column components
   - Memory leaks from missing useEffect cleanup functions
   - Rendering bugs from array index keys
   ```

4. **Close epic:**
   ```bash
   beads close <EPIC_ID> --summary "Resolved 11 critical UBS findings. All React lifecycle and state management issues addressed. Scan now passes with --fail-on-warning."
   ```

---

## Notes

- **Total Estimated Time:** 3-4 hours
- **Risk Level:** Low - Changes are isolated, well-tested pattern fixes
- **Breaking Changes:** None - Internal implementation only
- **Testing Strategy:** Manual smoke test + UBS verification

**Reference Documentation:**
- React Hooks cleanup: https://react.dev/reference/react/useEffect#cleanup
- React keys: https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key
- State batching: https://react.dev/learn/queueing-a-series-of-state-updates
