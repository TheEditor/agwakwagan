# Phase 3.5: UI Redesign - Beads Issue Structure

**Status:** ✅ All 7 issues created with dependency chain
**Created:** November 17, 2025
**Total Estimated Time:** 6-8 hours

---

## Dependency Chain

```
kanban-o46 (Design System)
    ↓
kanban-6n6 (Drag-and-Drop)
    ↓
kanban-8l9 (Board Component)
    ↓
kanban-qcl (Column Component)
    ↓
kanban-eud (Card Component)
    ↓
kanban-3qf (Accessibility) [P2]
    ↓
kanban-jyb (Testing & Polish) [P3]
```

---

## Issue Details

### Task 3.5.1: Design System Setup
- **ID:** `kanban-o46`
- **Title:** Implement Ozhiaki design system with CSS variables and typography
- **Priority:** P1 (Highest)
- **Status:** Open
- **Dependencies:** None (root task)
- **Estimated Time:** 1 hour
- **Commit Message:** `fix(ui): Implement Ozhiaki design system - closes kanban-o46`

**What's Included:**
- Import Google Fonts (Crimson Pro, Fira Code)
- Define CSS variables for Ozhiaki colors (#6D2E42, #0A3622, #F5E6D3)
- Add spacing system (8px base units)
- Add shadow variables
- Add animation easing functions
- Dark mode CSS variables

---

### Task 3.5.2: Drag-and-Drop Hook Implementation
- **ID:** `kanban-6n6`
- **Title:** Implement robust drag-and-drop system with visual feedback
- **Priority:** P1
- **Status:** Open
- **Dependencies:** kanban-o46
- **Estimated Time:** 2 hours
- **Commit Message:** `feat(dnd): Implement robust drag-and-drop system - closes kanban-6n6`

**What's Included:**
- Create `hooks/useDragAndDrop.ts` hook
- Native HTML5 drag implementation (no library)
- DragState management
- Custom drag ghost with rotation
- Drop position calculation
- Drop indicator logic
- Touch support preparation

---

### Task 3.5.3: Board Component Refactor
- **ID:** `kanban-8l9`
- **Title:** Refactor Board component with Ozhiaki design and animations
- **Priority:** P1
- **Status:** Open
- **Dependencies:** kanban-6n6
- **Estimated Time:** 2 hours
- **Commit Message:** `refactor(board): Implement Ozhiaki board design - closes kanban-8l9`

**What's Included:**
- Update `components/KanbanBoard.tsx`
- Remove @hello-pangea/dnd dependency
- Use native HTML5 drag events
- Add texture overlay (subtle maroon diagonal pattern)
- Implement styled-components container
- Add Ojibwe syllabics decoration (ᐊᑲᐗᑲᐣ)
- Staggered column load animations
- Update scrollbar styling

---

### Task 3.5.4: Column Component Implementation
- **ID:** `kanban-qcl`
- **Title:** Implement Column component with drop zones and visual feedback
- **Priority:** P1
- **Status:** Open
- **Dependencies:** kanban-8l9
- **Estimated Time:** 1.5 hours
- **Commit Message:** `feat(column): Implement column with drop zones - closes kanban-qcl`

**What's Included:**
- Rewrite `components/Column.tsx`
- Convert to styled-components
- Drop zone visual feedback (border highlight)
- Drop indicator component (line between cards)
- Card count badge
- Add card form inline
- Smooth scrolling
- Fixed 320px width columns

---

### Task 3.5.5: Card Component Redesign
- **ID:** `kanban-eud`
- **Title:** Redesign Card component with Ozhiaki styling and interactions
- **Priority:** P1
- **Status:** Open
- **Dependencies:** kanban-qcl
- **Estimated Time:** 1.5 hours
- **Commit Message:** `feat(card): Redesign cards with Ozhiaki styling - closes kanban-eud`

**What's Included:**
- Rewrite `components/Card.tsx`
- Convert to styled-components
- Maroon left border accent
- Magnetic cursor effect (radial gradient follows mouse)
- External ID lightning indicator (⚡)
- Custom drag ghost with rotation
- Timestamp with relative time
- Notes indicator
- Edit/delete actions on hover
- Smooth animations

---

### Task 3.5.6: Accessibility & Keyboard Navigation
- **ID:** `kanban-3qf`
- **Title:** Add comprehensive accessibility and keyboard navigation
- **Priority:** P2 (High)
- **Status:** Open
- **Dependencies:** kanban-eud
- **Estimated Time:** 1 hour
- **Commit Message:** `feat(a11y): Add keyboard navigation and ARIA - closes kanban-3qf`

**What's Included:**
- Arrow keys to move cards between columns
- Enter/Space to open card details
- Tab navigation through cards
- ESC to cancel drag operations
- Shift+Delete to delete cards
- ARIA labels and roles
- Focus management
- Screen reader compatibility
- WCAG AA color contrast verification

---

### Task 3.5.7: Testing & Polish
- **ID:** `kanban-jyb`
- **Title:** Test UI implementation and fix remaining issues
- **Priority:** P3
- **Status:** Open
- **Dependencies:** kanban-3qf
- **Estimated Time:** 1 hour
- **Commit Message:** `test(ui): Complete UI testing and polish - closes kanban-jyb`

**What's Included:**
- Functional testing (drag-drop scenarios)
- Visual testing (colors, fonts, animations)
- Performance testing (60fps, memory leaks)
- Accessibility audit (axe DevTools)
- Browser compatibility testing
- Dark mode testing
- Cross-resolution testing (1440px, 1024px, 768px)
- External cards testing
- Auto-save verification

---

## Implementation Workflow

### Pre-Implementation (Complete - This Document)
✅ All 7 Beads issues created
✅ Dependency chain established
✅ Issue IDs recorded for commits

### Phase 1: Design System (kanban-o46)
1. Install @emotion/react and @emotion/styled
2. Update app/globals.css with exact color specs
3. Import Google Fonts (Crimson Pro + Fira Code)
4. Add spacing/shadow/animation variables
5. Run: `bd update kanban-o46 --status done --json`
6. Commit: `fix(ui): Implement Ozhiaki design system - closes kanban-o46`

### Phase 2: Drag & Drop (kanban-6n6)
1. Create hooks/useDragAndDrop.ts
2. Update Card.tsx to use native draggable
3. Update Column.tsx with drop zones
4. Update KanbanBoard.tsx orchestration
5. Remove @hello-pangea/dnd imports
6. Test drag functionality
7. Run: `bd update kanban-6n6 --status done --json`
8. Commit: `feat(dnd): Implement robust drag-and-drop system - closes kanban-6n6`

### Phase 3: Board Component (kanban-8l9)
1. Rewrite KanbanBoard.tsx with styled-components
2. Add texture overlay
3. Add Ojibwe syllabics decoration
4. Implement animations
5. Run: `bd update kanban-8l9 --status done --json`
6. Commit: `refactor(board): Implement Ozhiaki board design - closes kanban-8l9`

### Phase 4: Column Component (kanban-qcl)
1. Rewrite Column.tsx with styled-components
2. Add drop zone visual feedback
3. Implement drop indicator
4. Add card count badge
5. Run: `bd update kanban-qcl --status done --json`
6. Commit: `feat(column): Implement column with drop zones - closes kanban-qcl`

### Phase 5: Card Component (kanban-eud)
1. Rewrite Card.tsx with styled-components
2. Add maroon border and magnetic cursor effect
3. Add external ID indicator
4. Implement custom drag ghost
5. Run: `bd update kanban-eud --status done --json`
6. Commit: `feat(card): Redesign cards with Ozhiaki styling - closes kanban-eud`

### Phase 6: Accessibility (kanban-3qf)
1. Add keyboard navigation (Arrow keys, Enter, ESC, etc.)
2. Add ARIA labels and roles
3. Implement focus management
4. Test with screen reader
5. Run: `bd update kanban-3qf --status done --json`
6. Commit: `feat(a11y): Add keyboard navigation and ARIA - closes kanban-3qf`

### Phase 7: Testing (kanban-jyb)
1. Test all drag-drop scenarios
2. Visual testing (colors, fonts, animations)
3. Performance testing
4. Accessibility audit
5. Browser testing
6. Run: `bd update kanban-jyb --status done --json`
7. Commit: `test(ui): Complete UI testing and polish - closes kanban-jyb`

---

## Success Criteria

Phase 3.5 is complete when:
- ✅ All 7 Beads issues marked as "done"
- ✅ Drag-and-drop works flawlessly
- ✅ Ozhiaki branding throughout (no generic AI aesthetics)
- ✅ Professional desktop-first design
- ✅ All animations smooth (60fps)
- ✅ Keyboard navigation complete
- ✅ WCAG AA compliant
- ✅ External cards identifiable (lightning indicator)
- ✅ Build passes TypeScript checks
- ✅ All Beads issues closed with proper commits

---

## Key Commands Reference

**Update issue to done:**
```bash
bd update kanban-XXXX --status done --json
```

**List all Phase 3.5 issues:**
```bash
bd list | grep "Implement Ozhiaki\|Implement robust\|Refactor Board\|Implement Column\|Redesign Card\|Add comprehensive\|Test UI"
```

**Show issue dependencies:**
```bash
bd show kanban-o46 --json
```

**Claim an issue:**
```bash
bd claim kanban-XXXX --json
```

---

## Notes

- All issues are P1 except accessibility (P2) and testing (P3)
- Issues must be completed in dependency order
- Each commit message should reference the issue ID
- Use `bd update [id] --status done --json` before committing
- Reference the four specification files for implementation details:
  - `agwakwagan-phase-3.5-ui-redesign.md` - Main spec
  - `agwakwagan-ui-redesign-spec.md` - Design system details
  - `agwakwagan-ui-implementation-part1.md` - React components
  - `agwakwagan-ui-implementation-part2.md` - Hooks & utilities

---

## Next Steps

Ready to implement Phase 3.5? Follow the workflow above, starting with Task 3.5.1 (kanban-o46).

Good luck! 🚀
