# UBS Critical Fixes - Corrected Task Specification

**Project:** Agwakwagan  
**Source:** UBS scan results 2025-11-19 (verified)  
**Priority:** Medium - 6 actual issues identified  
**Epic:** Code Quality - UBS Verified Fixes

---

## Correction Note

**Previous spec was incorrect.** The 211 "critical" issues were false positives (CSS `var()` flagged as missing variable declarations).

**Actual findings:**
- 1 real critical issue (JSON.parse without error handling)
- 5 UX warnings (native dialogs)
- 63 code quality items (console.log - low priority)

---

## Task Dependency Structure

```
epic: ubs-verified-fixes
├── task: fix-json-parse-error-handling (no deps)
└── task: replace-native-dialogs (no deps)
```

---

## Epic Definition

### Epic: ubs-verified-fixes
**Title:** Fix Verified UBS Issues - Error Handling & UX  
**Description:**  
Address 6 actual issues identified by UBS scanner:
- 1 critical: Unhandled JSON.parse that can crash on invalid data
- 5 UX issues: Native browser dialogs (poor user experience)

**Acceptance Criteria:**
- JSON.parse wrapped in try/catch with fallback
- All native dialogs replaced with proper UI components
- `ubs src/ --fail-on-warning` shows 0 critical issues in our code
- Existing functionality preserved

**Estimated Effort:** 2 hours total

---

## Task 1: Fix JSON.parse Error Handling

### Metadata
```bash
beads create \
  --title "Add error handling to JSON.parse in useBoardState" \
  --priority high \
  --estimate 30m \
  --parent ubs-verified-fixes \
  --labels "error-handling,critical"
```

### Description
**Issue:** JSON.parse without try/catch can crash the application on invalid localStorage data.

**Exact Location:**
- `hooks/useBoardState.ts:51` - `const parsed = JSON.parse(item) as Board;`

**Root Cause:**  
Corrupted or manually-edited localStorage data will throw SyntaxError, crashing the entire app instead of gracefully recovering.

**Risk:**  
High - Users lose all board data if localStorage is corrupted.

### Solution Approach

**Current code (line 51):**
```typescript
// ❌ CRITICAL - No error handling
const parsed = JSON.parse(item) as Board;
```

**Fixed code:**
```typescript
// ✅ FIXED - Graceful error handling
try {
  const parsed = JSON.parse(item) as Board;
  // Continue with parsed data
} catch (error) {
  console.error('Failed to parse board data:', error);
  // Option 1: Skip this board, continue loading others
  continue;
  
  // Option 2: Return default/empty board
  // return getDefaultBoard();
  
  // Option 3: Clear corrupted data
  // localStorage.removeItem(key);
}
```

### Implementation Steps

1. **Locate the exact function:**
   ```bash
   cd hooks
   grep -n "JSON.parse" useBoardState.ts
   ```

2. **Understand the context:**
   - What happens if parse fails?
   - Are we loading one board or multiple?
   - Should we skip or provide fallback?

3. **Apply fix with appropriate fallback:**
   ```typescript
   // Most likely pattern (loading multiple boards):
   const loadBoards = () => {
     const boards: Board[] = [];
     for (const [key, item] of Object.entries(localStorage)) {
       if (!key.startsWith('board-')) continue;
       
       try {
         const parsed = JSON.parse(item) as Board;
         boards.push(parsed);
       } catch (error) {
         console.error(`Corrupted board data in ${key}:`, error);
         // Skip this board, continue with others
         continue;
       }
     }
     return boards;
   };
   ```

4. **Test scenarios:**
   - Normal load (valid JSON)
   - Corrupted localStorage (invalid JSON)
   - Empty localStorage
   - Partial corruption (some boards valid, some invalid)

### Acceptance Criteria
- [ ] JSON.parse wrapped in try/catch block
- [ ] Error logged with context (which board failed)
- [ ] App continues loading other boards on parse failure
- [ ] No user data loss on corrupted localStorage
- [ ] `ubs hooks/useBoardState.ts` reports 0 critical

### Test Procedure
```bash
# 1. Test normal operation
# - Load app, verify boards load

# 2. Test corrupted data
# - Open DevTools Console
localStorage.setItem('board-test', 'invalid{json');
# - Reload app
# - Should see error logged, app still works

# 3. Verify recovery
localStorage.removeItem('board-test');
# - Reload app
# - Should work normally
```

### Verification Command
```bash
ubs hooks/useBoardState.ts --fail-on-warning
```

---

## Task 2: Replace Native Browser Dialogs

### Metadata
```bash
beads create \
  --title "Replace window.confirm/alert/prompt with UI components" \
  --priority medium \
  --estimate 1.5h \
  --parent ubs-verified-fixes \
  --labels "ux,refactor"
```

### Description
**Issue:** Native browser dialogs (alert/confirm/prompt) provide poor UX:
- Block entire UI
- Can't be styled
- Look unprofessional
- Break keyboard navigation

**Exact Locations (5 instances):**

1. `components/Board/Column.tsx:412`
   ```typescript
   if (window.confirm(`Delete card "${card.title}"?`)) {
   ```

2. `components/Board/SettingsModal.tsx:262`
   ```typescript
   alert('Invalid board file. Please select a valid JSON export.');
   ```

3. `components/BoardHeader.tsx:121`
   ```typescript
   const newBoardId = prompt("Enter a name for the new board (e.g., 'football-schedule'):");
   ```

4-5. (Two more instances - scan will reveal exact locations)

### Solution Approach

**Pattern 1: Replace confirm() with modal dialog**
```typescript
// ❌ BAD
if (window.confirm(`Delete card "${card.title}"?`)) {
  deleteCard(card.id);
}

// ✅ GOOD - Use existing modal pattern
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete Card"
  message={`Delete card "${card.title}"?`}
  onConfirm={() => deleteCard(card.id)}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

**Pattern 2: Replace alert() with toast notification**
```typescript
// ❌ BAD
alert('Invalid board file. Please select a valid JSON export.');

// ✅ GOOD - Use toast (if available) or inline error message
setError('Invalid board file. Please select a valid JSON export.');
// OR
toast.error('Invalid board file. Please select a valid JSON export.');
```

**Pattern 3: Replace prompt() with input dialog**
```typescript
// ❌ BAD
const newBoardId = prompt("Enter a name for the new board:");

// ✅ GOOD - Use modal with form
const [showNameDialog, setShowNameDialog] = useState(false);

<InputDialog
  isOpen={showNameDialog}
  title="Create New Board"
  placeholder="e.g., 'football-schedule'"
  onSubmit={(name) => createBoard(name)}
  onCancel={() => setShowNameDialog(false)}
/>
```

### Implementation Steps

1. **Scan for all instances:**
   ```bash
   cd components
   rg "window\.confirm|window\.alert|window\.prompt|\balert\(|\bconfirm\(|\bprompt\(" --type tsx
   ```

2. **Check if reusable components exist:**
   ```bash
   # Look for existing modal/dialog components
   find components -name "*Dialog*.tsx" -o -name "*Modal*.tsx"
   ```

3. **Create reusable components if needed:**
   - `components/ui/ConfirmDialog.tsx` (for confirm)
   - `components/ui/InputDialog.tsx` (for prompt)
   - Use inline error messages for alerts

4. **Replace each instance:**
   - Column.tsx: Delete confirmation → ConfirmDialog
   - SettingsModal.tsx: Error alert → inline error state
   - BoardHeader.tsx: Name prompt → InputDialog

5. **Test each replacement:**
   - Delete card flow (Column.tsx)
   - Import invalid file (SettingsModal.tsx)
   - Create new board (BoardHeader.tsx)

### Acceptance Criteria
- [ ] No `window.confirm()` in codebase
- [ ] No `alert()` in codebase (except possibly external libraries)
- [ ] No `prompt()` in codebase
- [ ] All replacements use proper React components
- [ ] Modals can be dismissed with Escape key
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Modals are styled consistently with app theme
- [ ] `ubs components/ --fail-on-warning` shows 0 alerts/confirms/prompts

### Test Procedure
1. **Delete card confirmation:**
   - Click delete on a card
   - Should see modal dialog (not browser confirm)
   - Verify cancel works
   - Verify confirm deletes card
   - Verify Escape key dismisses

2. **Invalid file import:**
   - Try importing invalid JSON
   - Should see inline error or toast (not alert)
   - Error should be dismissable

3. **Create board:**
   - Click "New Board"
   - Should see modal with input (not prompt)
   - Verify validation (empty name, special chars)
   - Verify cancel/submit work

### Verification Command
```bash
ubs components/ | grep -i "alert\|confirm\|prompt"
```

Should return no matches (or only in comments/strings).

---

## Optional Task: Reduce console.log Usage

### Metadata
```bash
beads create \
  --title "Replace console.log with logging utility (optional)" \
  --priority low \
  --estimate 1h \
  --parent ubs-verified-fixes \
  --labels "code-quality,optional"
```

### Description
**Issue:** 63 console.log statements found throughout codebase.

**Why low priority:**  
- Not a bug or crash risk
- Console logs are useful during development
- Can be stripped by build tools

**Why consider fixing:**  
- Production logs clutter browser console
- Can expose sensitive data
- No filtering/levels (debug vs error)

### Solution (If Pursued)

Create simple logging utility:

```typescript
// utils/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => isDev && console.log('[DEBUG]', ...args),
  info: (...args: any[]) => isDev && console.info('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};

// Replace:
console.log('Loading board') → logger.debug('Loading board')
console.error('Failed')      → logger.error('Failed')
```

**Recommendation:** Defer until Phase 5+ or production release.

---

## Implementation Order

Execute in this sequence:

1. **Task 1** (JSON.parse error handling) - 30 minutes, high priority
2. **Task 2** (Replace native dialogs) - 1.5 hours, medium priority
3. **Optional** (Logging utility) - Defer to later phase

**Total Essential Work:** 2 hours

---

## Import into Beads

```bash
# Navigate to project root
cd /c/Users/davef/Documents/Projects/Claude/Vibe\ Coding/agwakwagan/agwakwagan

# Create epic
beads create \
  --title "Fix Verified UBS Issues - Error Handling & UX" \
  --priority medium \
  --labels "code-quality,ubs,verified"

# Get epic ID
beads list --filter "Verified UBS" --format json | jq -r '.[0].id'
# Or manually: beads list | grep "Verified UBS"

# Create Task 1 (replace <EPIC_ID> with actual ID)
beads create \
  --title "Add error handling to JSON.parse in useBoardState" \
  --priority high \
  --estimate 30m \
  --parent <EPIC_ID> \
  --labels "error-handling,critical"

# Create Task 2
beads create \
  --title "Replace window.confirm/alert/prompt with UI components" \
  --priority medium \
  --estimate 1.5h \
  --parent <EPIC_ID> \
  --labels "ux,refactor"

# Optional Task 3 (defer if desired)
beads create \
  --title "Replace console.log with logging utility (optional)" \
  --priority low \
  --estimate 1h \
  --parent <EPIC_ID> \
  --labels "code-quality,optional"
```

---

## Verification After Fixes

### Full Scan (src only)
```bash
ubs src/ --fail-on-warning
```

**Expected output:**
- 0 critical issues in src/
- 0 warnings for JSON.parse
- 0 warnings for native dialogs
- Console.log warnings may remain (acceptable)

### Smoke Test
1. **Test corrupted localStorage:**
   ```javascript
   // In DevTools Console
   localStorage.setItem('board-corrupt', '{invalid}');
   location.reload();
   // Should log error but app still loads
   ```

2. **Test delete confirmation:**
   - Create card
   - Click delete
   - Should see styled modal (not browser confirm)
   - Cancel should work
   - Confirm should delete

3. **Test create board:**
   - Click "New Board"
   - Should see input dialog (not browser prompt)
   - Enter name and submit
   - Should create board

4. **Test invalid import:**
   - Try importing non-JSON file
   - Should see error message (not alert)

### Compare Before/After
```bash
# Before fixes
ubs src/ > before-fixes.txt 2>&1

# After fixes
ubs src/ > after-fixes.txt 2>&1

# Compare
diff before-fixes.txt after-fixes.txt
```

**Expected changes:**
- JSON.parse warning removed
- alert/confirm/prompt warnings removed
- Critical count: 0 (previously 1)

---

## Post-Fix Actions

### 1. Commit
```bash
git add hooks/useBoardState.ts components/Board/Column.tsx components/Board/SettingsModal.tsx components/BoardHeader.tsx
git commit -m "fix: add error handling and replace native dialogs

- Wrap JSON.parse in try/catch to handle corrupted localStorage
- Replace window.confirm with ConfirmDialog component
- Replace alert() with inline error messages
- Replace prompt() with InputDialog component

Resolves UBS critical issue and 5 UX warnings.

Closes beads:<TASK_1_ID>
Closes beads:<TASK_2_ID>"
```

### 2. Close Epic
```bash
beads close <EPIC_ID> --summary "Fixed 6 verified UBS issues: 1 critical (JSON.parse error handling) and 5 UX improvements (native dialogs). Scan now shows 0 critical issues in src/."
```

### 3. Re-scan for Verification
```bash
ubs src/ --fail-on-warning > verification-scan.txt 2>&1
echo "Exit code: $?" >> verification-scan.txt
```

Exit code should be 0 (or warnings only from console.log, which is acceptable).

---

## Notes

**False Positive Alert:**  
The original UBS scan reported 211 "critical" issues. These were CSS custom properties (`var(--color)`) incorrectly flagged as missing variable declarations. Ignore these - they are NOT real issues.

**Real Issues Summary:**
- 1 critical: JSON.parse (must fix)
- 5 UX warnings: Native dialogs (should fix)
- 63 code quality: console.log (optional/defer)

**Estimated Time:** 2 hours for essential fixes (Tasks 1-2)

**Risk Level:** Low - Changes are defensive improvements, no breaking changes

**Testing Strategy:** Manual testing + UBS verification scan
