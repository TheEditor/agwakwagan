# Agwakwagan - Feature Requirements Document

**Project:** Agwakwagan Kanban Board (Complete Rebuild)  
**Document Type:** Feature Requirements  
**Version:** 1.0  
**Created:** November 4, 2025  
**Status:** Planning Phase

---

## Document Purpose

This document defines **what** Agwakwagan does from the user's perspective, without specifying **how** it's implemented. It describes:
- User-facing capabilities
- User interaction patterns
- UI/UX behaviors
- Feature priorities (MVP vs. future)

This is the **blueprint for user experience** - what users can do and how they do it.

---

## 1. Overview

### 1.1 Product Vision

Agwakwagan is a desktop-first kanban board for power users managing complex projects. It emphasizes:
- **Speed** - Fast interactions, keyboard-driven
- **Flexibility** - Customizable to different workflows
- **Reliability** - Never lose work, always recoverable
- **Simplicity** - Clean interface, no clutter

### 1.2 Target Users

**Primary:** Individual developers, project managers, designers managing personal or small team projects

**Use Cases:**
- Software development sprints
- Content creation pipelines
- Personal task management
- Project planning and tracking

**NOT for:**
- Large team collaboration (50+ people)
- Mobile-first users
- Simple todo lists (overkill)

---

## 2. Core Features (MVP)

### 2.1 Board Management

#### 2.1.1 View Board
**User Story:** As a user, I can see all my columns and cards at a glance.

**Behavior:**
- Board displays horizontally scrolling columns
- Each column shows title and cards within it
- Empty board shows helpful empty state
- Columns arranged left-to-right by order
- Smooth loading animation on initial load

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│  Ozhiaki Kanban        [Theme] [Export] [...] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  TODO    │  │ PROGRESS │  │   DONE   │ │
│  ├──────────┤  ├──────────┤  ├──────────┤ │
│  │ Card 1   │  │ Card 3   │  │ Card 5   │ │
│  │ Card 2   │  │ Card 4   │  │          │ │
│  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] All columns visible on load
- [ ] Cards sorted by order within columns
- [ ] Horizontal scroll if columns exceed viewport width
- [ ] Loading state shown while data loads
- [ ] Empty state if no columns exist

---

#### 2.1.2 Create Column
**User Story:** As a user, I can add new columns to organize my work stages.

**Interaction:**
1. User clicks "Add Column" button in header
2. Inline input appears in header area
3. User types column title
4. User presses Enter or clicks "Create"
5. New column appears at the end of board

**Behavior:**
- Column title required (1-100 characters)
- Column title trims whitespace
- Escape key cancels
- Default columns created on first load (TODO, In Progress, Done)
- New column has no cards initially

**Visual:**
```
[Add Column] → Click
               ↓
┌────────────────────────────────┐
│ [Column title...] [Create] [X] │
└────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Button visible in header
- [ ] Input appears inline on click
- [ ] Enter key creates column
- [ ] Escape key cancels
- [ ] Empty title shows validation error
- [ ] Column appears immediately after creation
- [ ] Focus moves to new column

---

#### 2.1.3 Edit Column Title
**User Story:** As a user, I can rename columns as my workflow evolves.

**Interaction:**
1. User clicks on column title
2. Title becomes editable input
3. User edits text
4. User presses Enter or clicks outside
5. Title updates

**Behavior:**
- Click title to edit (inline)
- Title required (1-100 characters)
- Escape reverts to original
- Blur (click outside) saves changes
- Enter key saves changes

**Acceptance Criteria:**
- [ ] Title becomes input on click
- [ ] Current value pre-filled
- [ ] Enter saves and exits edit mode
- [ ] Escape cancels without saving
- [ ] Clicking outside saves changes
- [ ] Empty title reverts to previous value

---

#### 2.1.4 Delete Column
**User Story:** As a user, I can remove columns I no longer need.

**Interaction:**
1. User hovers over column header
2. Delete icon appears
3. User clicks delete icon
4. Confirmation prompt appears
5. User confirms
6. Column and all its cards are deleted

**Behavior:**
- Delete icon only on hover (or always on mobile)
- Confirmation required ("Delete '[Title]' and X cards?")
- Deleted column cannot be recovered (unless undo implemented)
- Cards in deleted column are also deleted

**Visual:**
```
┌──────────────┐
│ TODO    [🗑️] │ ← Delete icon on hover
└──────────────┘
```

**Acceptance Criteria:**
- [ ] Delete button visible on hover
- [ ] Confirmation dialog appears
- [ ] Column deleted on confirm
- [ ] Cards in column also deleted
- [ ] Board updates immediately
- [ ] Cannot delete if only one column remains (optional)

---

#### 2.1.5 Reorder Columns
**User Story:** As a user, I can rearrange columns to match my workflow.

**Interaction:**
1. User drags column header
2. Other columns shift to show drop position
3. User releases
4. Column moves to new position

**Behavior:**
- Drag handle on column header
- Smooth animation while dragging
- Visual indicator of drop position
- Column order persists

**Note:** This is a **future feature**, not MVP. MVP has fixed column order (creation order).

---

### 2.2 Card Management

#### 2.2.1 Create Card
**User Story:** As a user, I can add cards to track individual tasks.

**Interaction:**
1. User clicks "+ Add Card" at bottom of column
2. Inline input appears
3. User types card title
4. User presses Enter or clicks "Add"
5. New card appears at bottom of column

**Behavior:**
- Card title required (1-500 characters)
- Card added at end of column (highest order number)
- Empty description by default
- No notes by default
- Created timestamp recorded

**Visual:**
```
┌──────────────┐
│ Card 1       │
│ Card 2       │
│ [+ Add Card] │ ← Click here
└──────────────┘
       ↓
┌──────────────┐
│ Card 1       │
│ Card 2       │
│ [________]   │ ← Type here
│ [Add] [X]    │
└──────────────┘
```

**Acceptance Criteria:**
- [ ] Add button visible at bottom of column
- [ ] Input appears on click
- [ ] Enter creates card with title
- [ ] Escape cancels
- [ ] Empty title shows error or cancels
- [ ] Card appears immediately
- [ ] Focus returns to add button

---

#### 2.2.2 View Card Details
**User Story:** As a user, I can see full card details without losing context.

**Interaction:**
1. User clicks on card
2. Card expands inline (grows vertically)
3. Title, description, and notes become visible
4. User can read/edit content
5. User clicks outside or on card again to collapse

**Behavior:**
- Collapsed view: Title only (1-2 lines max)
- Expanded view: Title, description (full), notes list
- Smooth expand/collapse animation
- Other cards shift down to make space
- Only one card expanded per column at a time (optional)

**Visual:**

**Collapsed:**
```
┌──────────────────────┐
│ Fix login bug        │
└──────────────────────┘
```

**Expanded:**
```
┌──────────────────────┐
│ Fix login bug        │
│ Description:         │
│ Users can't log in   │
│ with Google OAuth... │
│                      │
│ Notes:               │
│ • Checked API keys   │
│ • Tested locally     │
│                      │
│ [Edit] [Delete]      │
└──────────────────────┘
```

**Acceptance Criteria:**
- [ ] Click card to expand
- [ ] Smooth animation
- [ ] All content visible when expanded
- [ ] Click outside to collapse
- [ ] Click card again to collapse
- [ ] Keyboard accessible (Space/Enter to toggle)

---

#### 2.2.3 Edit Card
**User Story:** As a user, I can update card details as work progresses.

**Interaction:**
1. User clicks "Edit" button on expanded card (or double-click title)
2. Title and description become editable inputs
3. User makes changes
4. User clicks "Save" or presses Cmd+Enter
5. Card updates and collapses

**Behavior:**
- Title and description both editable
- Title required (1-500 chars)
- Description optional (0-5000 chars)
- Escape cancels without saving
- Save button or Cmd+Enter saves
- Updated timestamp recorded

**Acceptance Criteria:**
- [ ] Edit mode activated on button click
- [ ] Both fields editable
- [ ] Save button appears
- [ ] Cancel button appears
- [ ] Escape cancels changes
- [ ] Cmd+Enter saves changes
- [ ] Card collapses after save

---

#### 2.2.4 Delete Card
**User Story:** As a user, I can remove completed or irrelevant cards.

**Interaction:**
1. User expands card or hovers over card
2. Delete button visible
3. User clicks delete
4. Card immediately removed (no confirmation for single card)

**Behavior:**
- Delete button in card actions
- No confirmation (unless undo not implemented)
- Card removed from board immediately
- Cannot be recovered (unless undo)

**Acceptance Criteria:**
- [ ] Delete button visible on hover or in expanded view
- [ ] Click deletes card immediately
- [ ] Card disappears with animation
- [ ] Other cards shift up smoothly

---

#### 2.2.5 Move Card (Drag & Drop)
**User Story:** As a user, I can move cards between columns by dragging.

**Interaction:**
1. User clicks and holds on card
2. Card lifts up (visual feedback)
3. User drags over other column
4. Drop zone highlighted
5. User releases
6. Card moves to new column at drop position

**Behavior:**
- Smooth drag animation
- Card follows cursor
- Other cards shift to show drop position
- Can drag within same column to reorder
- Can drag to different column
- Drop position indicated clearly
- Invalid drop zones disabled (if any)

**Visual Feedback:**
```
Dragging:
┌──────────────┐
│ [🎯 Dragged] │ ← Ghost/semi-transparent
└──────────────┘

Drop Zone:
┌──────────────┐
│ Card 1       │
│ ┄┄┄┄┄┄┄┄┄┄┄┄ │ ← Drop indicator
│ Card 2       │
└──────────────┘
```

**Acceptance Criteria:**
- [ ] Card can be dragged
- [ ] Visual feedback while dragging
- [ ] Drop position clearly indicated
- [ ] Card moves on release
- [ ] Order updates correctly
- [ ] Smooth animations
- [ ] Works with keyboard (Space to grab, arrows to move)

---

### 2.3 Card Notes

#### 2.3.1 Add Note
**User Story:** As a user, I can add notes to cards for additional context.

**Interaction:**
1. User expands card
2. User clicks "+ Add Note" button
3. Input field appears
4. User types note text
5. User presses Enter or clicks "Add"
6. Note appears in list

**Behavior:**
- Notes displayed as list under description
- Each note has timestamp
- Notes sorted by creation time (newest first or oldest first - decide)
- No limit on number of notes
- Note text 1-2000 characters

**Visual:**
```
Notes:
┌────────────────────────────┐
│ • Checked API keys         │
│   2 hours ago              │
│ • Tested locally           │
│   1 day ago                │
│ [+ Add Note]               │
└────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Add note button visible in expanded card
- [ ] Input appears on click
- [ ] Enter adds note
- [ ] Note appears in list immediately
- [ ] Timestamp shown
- [ ] Notes sorted by time

---

#### 2.3.2 Delete Note
**User Story:** As a user, I can remove outdated or incorrect notes.

**Interaction:**
1. User hovers over note
2. Delete icon appears
3. User clicks delete
4. Note removed immediately

**Behavior:**
- Delete icon on hover
- No confirmation (small action)
- Note disappears immediately

**Acceptance Criteria:**
- [ ] Delete button visible on hover
- [ ] Click deletes note
- [ ] Note removed with animation
- [ ] List updates immediately

---

### 2.4 Data Persistence

#### 2.4.1 Auto-Save
**User Story:** As a user, my changes are saved automatically so I never lose work.

**Behavior:**
- Every action (add, edit, delete, move) saves immediately
- Save indicator shows "Saving..." then "Saved"
- No manual save button needed
- Data persists in browser LocalStorage
- Works offline (no server needed)

**Visual:**
```
Bottom-right corner:
┌─────────────┐
│ ✓ Saved     │ ← Shows briefly after each action
└─────────────┘
```

**Acceptance Criteria:**
- [ ] All actions trigger save
- [ ] Save indicator appears on changes
- [ ] Data persists after page reload
- [ ] Works offline
- [ ] No "unsaved changes" warnings needed

---

#### 2.4.2 Export Board
**User Story:** As a user, I can export my board as a backup or to share.

**Interaction:**
1. User clicks "Export" button in header
2. Browser downloads JSON file
3. File named with date (e.g., "ozhiaki-board-2025-11-04.json")

**Behavior:**
- Exports complete board state as JSON
- Includes all columns, cards, notes, metadata
- Human-readable JSON (formatted with indentation)
- File downloads to browser's default location

**Acceptance Criteria:**
- [ ] Export button in header
- [ ] Click triggers download
- [ ] File is valid JSON
- [ ] Filename includes date
- [ ] All data included in export

---

#### 2.4.3 Import Board
**User Story:** As a user, I can import a previously exported board.

**Interaction:**
1. User clicks "Import" button in header
2. File picker opens
3. User selects JSON file
4. Confirmation prompt: "This will replace your current board. Continue?"
5. User confirms
6. Board data replaced with imported data
7. Page reloads with new board

**Behavior:**
- Only accepts .json files
- Validates file structure before import
- Shows error if file invalid
- Requires confirmation (destructive action)
- Replaces entire board (not merge)

**Acceptance Criteria:**
- [ ] Import button in header
- [ ] File picker accepts .json only
- [ ] Validation catches invalid files
- [ ] Confirmation required
- [ ] Board replaced on confirm
- [ ] Error shown if import fails

---

### 2.5 Visual & Interaction

#### 2.5.1 Theme Switching
**User Story:** As a user, I can switch between light and dark themes for comfort.

**Interaction:**
1. User clicks theme toggle button (sun/moon icon)
2. Theme switches immediately
3. Preference saved for future visits

**Behavior:**
- Toggle button in header
- Instant theme switch (no page reload)
- Smooth color transitions
- Preference persists in LocalStorage
- Respects system preference on first visit (optional)

**Acceptance Criteria:**
- [ ] Toggle button visible
- [ ] Click switches theme
- [ ] Smooth transition
- [ ] Preference saved
- [ ] Works across page reloads

---

#### 2.5.2 Keyboard Shortcuts
**User Story:** As a power user, I can use keyboard shortcuts for common actions.

**MVP Shortcuts:**
- `N` - Add card to first column
- `Cmd+Z` - Undo (future)
- `Cmd+Shift+Z` - Redo (future)
- `Escape` - Close expanded card
- `Space` - Grab/release card for keyboard drag
- `Arrow keys` - Move grabbed card
- `/` - Focus search (future)

**Behavior:**
- Shortcuts work globally (except when typing in input)
- Visual hint shows available shortcuts (optional tooltip)
- Shortcuts documented in help menu (future)

**Acceptance Criteria:**
- [ ] MVP shortcuts work as specified
- [ ] Don't trigger when typing in inputs
- [ ] Consistent across browsers

---

#### 2.5.3 Loading States
**User Story:** As a user, I see feedback when the app is loading.

**Behavior:**
- Initial load: Animated loading spinner with "Loading your board..."
- Action feedback: Save indicator shows saving/saved
- Drag feedback: Card follows cursor smoothly
- No action feels unresponsive

**Acceptance Criteria:**
- [ ] Loading spinner on initial load
- [ ] Save feedback after each action
- [ ] Drag preview smooth
- [ ] No actions feel laggy

---

#### 2.5.4 Empty States
**User Story:** As a new user, I see helpful messages when the board is empty.

**Scenarios:**

**No Columns:**
```
┌─────────────────────────────────┐
│   No columns yet!               │
│   Click "Add Column" to start   │
└─────────────────────────────────┘
```

**No Cards in Column:**
```
┌──────────────┐
│ TODO         │
│              │
│ No cards yet │
│ Click below  │
│ to add one   │
│              │
│ [+ Add Card] │
└──────────────┘
```

**Acceptance Criteria:**
- [ ] Empty state shown when no columns
- [ ] Empty state shown in empty columns
- [ ] Helpful text guides user
- [ ] Visually pleasant (not jarring)

---

## 3. Future Features (Post-MVP)

### 3.1 Undo/Redo
**Priority:** High  
**Complexity:** Medium

**Behavior:**
- Cmd+Z / Cmd+Shift+Z to undo/redo
- Undo buttons in header
- History of last 50 actions
- Visual feedback ("Undid: Delete card")

---

### 3.2 Card Tags/Labels
**Priority:** High  
**Complexity:** Medium

**Behavior:**
- Add colored tags to cards (e.g., "bug", "urgent")
- Filter cards by tag
- Create/edit/delete tags
- Tag manager in settings

---

### 3.3 Multi-Select & Bulk Operations
**Priority:** Medium  
**Complexity:** High

**Behavior:**
- Checkbox mode to select multiple cards
- Shift+Click to select range
- Cmd+Click to add to selection
- Bulk actions: Move, Delete, Add Tag

---

### 3.4 Search & Filter
**Priority:** Medium  
**Complexity:** Low

**Behavior:**
- Search bar in header
- Search by title, description, notes
- Real-time filtering
- Clear button to reset

---

### 3.5 Card Due Dates
**Priority:** Medium  
**Complexity:** Medium

**Behavior:**
- Add due date to card
- Visual indicator on card (colored border if overdue)
- Sort by due date
- Calendar view (future)

---

### 3.6 Priority Levels
**Priority:** Low  
**Complexity:** Low

**Behavior:**
- Set priority: High, Medium, Low
- Visual indicator (colored dot or border)
- Sort by priority
- Filter by priority

---

### 3.7 Card Templates
**Priority:** Low  
**Complexity:** Medium

**Behavior:**
- Save card as template
- Create card from template
- Template manager
- Default templates (bug, feature, task)

---

### 3.8 Multiple Boards
**Priority:** Medium  
**Complexity:** High

**Behavior:**
- Board switcher in header
- Create/delete/rename boards
- Each board has own columns/cards
- Export/import per board

---

### 3.9 Activity Log
**Priority:** Low  
**Complexity:** Medium

**Behavior:**
- View history of all actions
- Filter by date, action type, user (future)
- Useful for audit trail
- Optional sidebar or modal

---

### 3.10 Print View
**Priority:** Low  
**Complexity:** Low

**Behavior:**
- Print-friendly CSS
- Remove buttons, hide theme toggle
- One column per page or all on one page

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Board loads in <500ms (local data)
- Actions feel instant (<100ms response)
- Smooth animations (60fps)
- No lag with 200 cards

### 4.2 Accessibility
- Keyboard navigation for all actions
- Screen reader compatible
- WCAG AA color contrast
- Focus indicators visible

### 4.3 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (Chromium, latest 2 versions)

### 4.4 Data Integrity
- Never lose user data
- Validation on all inputs
- Graceful degradation if storage full
- Export as backup mechanism

---

## 5. Out of Scope

**Explicitly NOT included:**

- ❌ Mobile app (desktop only)
- ❌ Real-time collaboration (single user)
- ❌ Backend/server (client-side only)
- ❌ User accounts/authentication
- ❌ File attachments (too large for LocalStorage)
- ❌ Rich text editor (plain text only for MVP)
- ❌ Gantt charts or calendar views
- ❌ Time tracking or estimates
- ❌ Integrations (Jira, GitHub, etc.)

---

## 6. Design Guidelines

### 6.1 Visual Style
- **Ozhiaki branding** - CMU Maroon, Forest Green palette
- **Clean & minimal** - No clutter, focus on content
- **Generous whitespace** - Breathing room
- **Smooth animations** - Delightful but not distracting
- **Professional** - Suitable for work use

### 6.2 Interaction Patterns
- **Direct manipulation** - Drag to move, click to edit
- **Inline editing** - No unnecessary modals
- **Keyboard-friendly** - Shortcuts for everything
- **Forgiving** - Undo/redo, no confirmation overkill
- **Fast** - Optimized for speed, not clicks

### 6.3 Tone
- **Helpful** - Guide users with empty states
- **Confident** - Actions work, no hedging language
- **Concise** - Short labels, clear actions
- **Professional** - No cutesy language

---

## 7. Success Metrics

**MVP is successful when:**
- ✅ User can manage real project (50+ cards) comfortably
- ✅ No data loss over 1 week of use
- ✅ All core actions complete in <3 clicks
- ✅ Keyboard users can do everything
- ✅ Theme switching works perfectly
- ✅ Export/import round-trip preserves all data

**Feature priorities based on:**
- User pain points (undo/redo high priority)
- Frequency of use (search/filter medium priority)
- Implementation complexity vs. value

---

**End of Feature Requirements Document**

This document should be reviewed alongside the Architecture Design Document to ensure features are technically feasible.
