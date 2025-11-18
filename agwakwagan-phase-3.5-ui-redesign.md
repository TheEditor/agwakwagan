# Phase 3.5: UI Redesign Implementation

**Prerequisites:** Phase 3 (API Prep) Complete, Phase 4 (External Command API) Partial
**Estimated Time:** 6-8 hours
**Priority:** CRITICAL (Core functionality broken)

---

## Overview

Complete redesign and reimplementation of Agwakwagan's UI to fix broken drag-and-drop, eliminate generic AI aesthetics, and establish Ozhiaki brand identity. This phase uses Anthropic's frontend-design skill principles to create a professional, desktop-first kanban board.

**Critical Issues to Fix:**
- Drag-and-drop completely broken
- Generic AI aesthetics (Inter font, purple gradients)
- Poor visual hierarchy and contrast
- No brand identity
- Inaccessible to keyboard/screen readers

**Design Principles:**
- Ozhiaki brand colors (CMU Maroon #6D2E42, Forest Green #0A3622)
- Distinctive typography (Crimson Pro + Fira Code)
- Desktop-first (1440px primary target)
- Professional, not toy-like
- Smooth animations and micro-interactions

---

## Task Structure for Beads

### Task 3.5.1: Design System Setup (1 hour)

**Create Beads Issue:**
```bash
bd create "Implement Ozhiaki design system with CSS variables and typography" -p 1 --json
bd claim [issue-id] --json
```

**Problem:** No consistent design system, generic AI aesthetics throughout.

**Solution:** Implement complete design system with Ozhiaki branding.

**Files to Create/Modify:**

| File | Action | Purpose |
|------|--------|---------|
| `app/styles/globals.css` | CREATE | Global styles, CSS variables, fonts |
| `app/styles/design-tokens.ts` | CREATE | Type-safe design tokens |
| `tailwind.config.ts` | MODIFY | Extend with Ozhiaki colors |
| `app/layout.tsx` | MODIFY | Add font imports, theme setup |

**Implementation:**

1. **Create CSS Variables** (`app/styles/globals.css`):
```css
:root {
  /* Ozhiaki Brand Colors */
  --maroon: #6D2E42;
  --forest: #0A3622;
  --earth: #3E2723;
  --cedar: #8B3A3A;
  --sky: #4A6FA5;
  --sage: #7A8B7F;
  --birch: #F5E6D3;
  --snow: #FAFAFA;
  
  /* Functional Colors */
  --bg-primary: #FAFAFA;
  --bg-secondary: #F5E6D3;
  --bg-card: #FFFFFF;
  --bg-hover: rgba(245, 230, 211, 0.5);
  
  /* Typography */
  --font-display: 'Crimson Pro', serif;
  --font-body: 'Fira Code', monospace;
  
  /* Shadows, Animations, etc. */
}
```

2. **Import Fonts**:
```html
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
```

3. **Install Dependencies**:
```bash
npm install @emotion/react @emotion/styled
```

**Acceptance Criteria:**
- [ ] CSS variables defined for all Ozhiaki colors
- [ ] Fonts load correctly (Crimson Pro + Fira Code)
- [ ] Dark mode variables included
- [ ] No references to Inter, Roboto, or purple gradients
- [ ] Build passes

**Close Issue:**
```bash
bd update [issue-id] --status done --json
git commit -m "fix(ui): Implement Ozhiaki design system - closes #[issue-id]"
```

---

### Task 3.5.2: Drag-and-Drop Hook Implementation (2 hours)

**Create Beads Issue:**
```bash
bd create "Implement robust drag-and-drop system with visual feedback" -p 1 --depends-on [3.5.1-id] --json
bd claim [issue-id] --json
```

**Problem:** Current drag-and-drop is completely broken, no visual feedback.

**Solution:** Create custom hook with proper HTML5 drag-and-drop, visual indicators, and smooth animations.

**Files to Create/Modify:**

| File | Action | Purpose |
|------|--------|---------|
| `app/hooks/useDragAndDrop.ts` | CREATE | Core drag-drop logic |
| `app/hooks/useTouchDragAndDrop.ts` | CREATE | Touch support (tablets) |
| `app/utils/dragHelpers.ts` | CREATE | Drag utilities |

**Implementation:**

1. **Core Hook** (`app/hooks/useDragAndDrop.ts`):
```typescript
export function useDragAndDrop(onCardMove: (cardId: string, targetColumnId: string, targetIndex: number) => void) {
  const [dragState, setDragState] = useState<DragState>({
    draggedCardId: null,
    draggedFromColumn: null,
    dragOverColumn: null,
    dropIndicatorIndex: null,
  });

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string, columnId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
    // Create custom drag ghost
    // Set drag state
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string, totalCards: number) => {
    e.preventDefault();
    // Calculate drop position
    // Update drop indicator
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    onCardMove(cardId, columnId, dropIndex);
  }, []);

  return { dragState, handleDragStart, handleDragOver, handleDrop };
}
```

2. **Visual Feedback**:
- Drop indicator line between cards
- Column highlight on drag over
- Custom drag ghost with rotation
- Smooth transitions

**Acceptance Criteria:**
- [ ] Cards drag smoothly between columns
- [ ] Drop indicator shows insertion point
- [ ] Visual feedback on drag over
- [ ] Custom drag ghost appears
- [ ] ESC cancels drag operation
- [ ] No flickering or jank

**Close Issue:**
```bash
bd update [issue-id] --status done --json
git commit -m "feat(dnd): Implement robust drag-and-drop system - closes #[issue-id]"
```

---

### Task 3.5.3: Board Component Refactor (2 hours)

**Create Beads Issue:**
```bash
bd create "Refactor Board component with Ozhiaki design and animations" -p 1 --depends-on [3.5.2-id] --json
bd claim [issue-id] --json
```

**Problem:** Current board layout is generic, no Ozhiaki branding, poor structure.

**Solution:** Complete refactor with styled-components, animations, and proper layout.

**Files to Create/Modify:**

| File | Action | Purpose |
|------|--------|---------|
| `app/components/Board/KanbanBoard.tsx` | REPLACE | Main board container |
| `app/components/Board/BoardHeader.tsx` | CREATE | Board header with branding |
| `app/components/Board/BoardLayout.tsx` | CREATE | Layout wrapper |
| `app/hooks/useBoard.ts` | MODIFY | Board state management |

**Implementation:**

1. **Board Container** (`app/components/Board/KanbanBoard.tsx`):
```tsx
const BoardContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background: var(--bg-primary);
  
  /* Ozhiaki texture overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 35px,
      rgba(109, 46, 66, 0.01) 35px,
      rgba(109, 46, 66, 0.01) 70px
    );
  }
`;
```

2. **Board Header with Ojibwe Syllabics**:
```tsx
<h1>
  <span className="syllabics">ᐊᑲᐗᑲᐣ</span>
  Agwakwagan
</h1>
```

3. **Staggered Load Animations**:
```css
.column:nth-child(1) { animation-delay: 0.1s; }
.column:nth-child(2) { animation-delay: 0.2s; }
.column:nth-child(3) { animation-delay: 0.3s; }
```

**Acceptance Criteria:**
- [ ] Board header shows Ozhiaki branding
- [ ] Texture overlay applied
- [ ] Columns animate on load
- [ ] Scrollbar styled
- [ ] Responsive at 1440px, 1024px
- [ ] Components properly typed

**Close Issue:**
```bash
bd update [issue-id] --status done --json
git commit -m "refactor(board): Implement Ozhiaki board design - closes #[issue-id]"
```

---

### Task 3.5.4: Column Component Implementation (1.5 hours)

**Create Beads Issue:**
```bash
bd create "Implement Column component with drop zones and visual feedback" -p 1 --depends-on [3.5.3-id] --json
bd claim [issue-id] --json
```

**Problem:** Columns lack visual hierarchy, no drop feedback, poor card organization.

**Solution:** New Column component with proper drop zones, card count, add card form.

**Files to Create/Modify:**

| File | Action | Purpose |
|------|--------|---------|
| `app/components/Board/Column.tsx` | CREATE | Column container |
| `app/components/Board/DropZone.tsx` | CREATE | Drop indicator component |
| `app/components/Board/AddCardForm.tsx` | CREATE | Inline card creation |

**Implementation Details:**
- 320px fixed width columns
- Visual drop zones between cards
- Card count badge
- Smooth scroll in column
- Add card button/form at bottom

**Acceptance Criteria:**
- [ ] Columns show card count
- [ ] Drop zones appear on drag
- [ ] Add card form inline
- [ ] Smooth scrolling
- [ ] Border highlights on drag over

**Close Issue:**
```bash
bd update [issue-id] --status done --json
git commit -m "feat(column): Implement column with drop zones - closes #[issue-id]"
```

---

### Task 3.5.5: Card Component Redesign (1.5 hours)

**Create Beads Issue:**
```bash
bd create "Redesign Card component with Ozhiaki styling and interactions" -p 1 --depends-on [3.5.4-id] --json
bd claim [issue-id] --json
```

**Problem:** Cards are generic, no visual interest, poor interaction feedback.

**Solution:** Redesigned cards with magnetic cursor effect, external ID indicator, smooth animations.

**Files to Create/Modify:**

| File | Action | Purpose |
|------|--------|---------|
| `app/components/Board/Card.tsx` | REPLACE | Card component |
| `app/components/Board/CardMeta.tsx` | CREATE | Card metadata display |
| `app/components/Board/CardActions.tsx` | CREATE | Card action buttons |

**Key Features:**
- Maroon left border accent
- External ID lightning indicator
- Magnetic cursor effect on hover
- Timestamp with relative time
- Notes indicator
- Edit/delete actions on hover

**Implementation:**
```tsx
const CardContainer = styled.div<{ isDragging: boolean; hasExternalId: boolean }>`
  background: var(--bg-card);
  border-left: 3px solid var(--maroon);
  cursor: grab;
  
  /* External ID indicator */
  ${props => props.hasExternalId && `
    &::after {
      content: '⚡';
      position: absolute;
      top: 12px;
      right: 12px;
      color: var(--sky);
    }
  `}
  
  /* Magnetic cursor effect */
  &::before {
    content: '';
    position: absolute;
    background: radial-gradient(circle, rgba(109, 46, 66, 0.08) 0%, transparent 70%);
    /* Follow mouse position */
  }
`;
```

**Acceptance Criteria:**
- [ ] Cards show Ozhiaki colors
- [ ] External cards have lightning icon
- [ ] Hover effects work smoothly
- [ ] Drag state visual feedback
- [ ] Timestamps show relative time
- [ ] Actions appear on hover

**Close Issue:**
```bash
bd update [issue-id] --status done --json
git commit -m "feat(card): Redesign cards with Ozhiaki styling - closes #[issue-id]"
```

---

### Task 3.5.6: Accessibility & Keyboard Navigation (1 hour)

**Create Beads Issue:**
```bash
bd create "Add comprehensive accessibility and keyboard navigation" -p 2 --depends-on [3.5.5-id] --json
bd claim [issue-id] --json
```

**Problem:** No keyboard navigation, missing ARIA labels, not screen reader friendly.

**Solution:** Full keyboard support, ARIA labels, focus management.

**Implementation:**
1. **Keyboard Shortcuts**:
   - Arrow keys: Move cards between columns
   - Enter/Space: Open card details
   - Tab: Navigate through cards
   - ESC: Cancel operations
   - Shift+Delete: Delete card

2. **ARIA Labels**:
```tsx
<div role="region" aria-label="Kanban board">
  <div role="list" aria-label="Board columns">
    <div role="listitem" aria-label={`${column.title} column with ${cards.length} cards`}>
```

3. **Focus Management**:
   - Visible focus indicators
   - Focus trap in modals
   - Focus restoration

**Acceptance Criteria:**
- [ ] Full keyboard navigation works
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Screen reader announces changes
- [ ] WCAG AA compliant

**Close Issue:**
```bash
bd update [issue-id] --status done --json
git commit -m "feat(a11y): Add keyboard navigation and ARIA - closes #[issue-id]"
```

---

### Task 3.5.7: Testing & Polish (1 hour)

**Create Beads Issue:**
```bash
bd create "Test UI implementation and fix remaining issues" -p 3 --depends-on [3.5.6-id] --json
bd claim [issue-id] --json
```

**Testing Checklist:**

**Drag & Drop:**
- [ ] Cards move between columns
- [ ] Cards reorder within column
- [ ] Cancel with ESC
- [ ] No duplicate cards
- [ ] State persists on reload

**Visual:**
- [ ] All Ozhiaki colors correct
- [ ] Fonts load properly
- [ ] Animations smooth
- [ ] Dark mode works
- [ ] No layout shifts

**Performance:**
- [ ] < 100ms interaction response
- [ ] No memory leaks
- [ ] Smooth 60fps animations
- [ ] Fast initial load

**Accessibility:**
- [ ] Axe DevTools passes
- [ ] Keyboard navigation complete
- [ ] Screen reader tested

**Close Issue:**
```bash
bd update [issue-id] --status done --json
git commit -m "test(ui): Complete UI testing and polish - closes #[issue-id]"
```

---

## Dependencies Graph

```
3.5.1 Design System
    └─> 3.5.2 Drag-and-Drop Hook
           └─> 3.5.3 Board Component
                  └─> 3.5.4 Column Component
                         └─> 3.5.5 Card Component
                                └─> 3.5.6 Accessibility
                                       └─> 3.5.7 Testing
```

---

## Success Criteria

Phase 3.5 is complete when:
- ✅ Drag-and-drop works flawlessly
- ✅ Ozhiaki branding throughout (no generic AI aesthetics)
- ✅ Professional desktop-first design
- ✅ All animations smooth
- ✅ Keyboard navigation complete
- ✅ WCAG AA compliant
- ✅ External cards identifiable
- ✅ Build passes TypeScript checks
- ✅ All Beads issues closed

---

## Reference Files

The following files contain detailed implementation code:
1. `agwakwagan-ui-redesign-spec.md` - Complete design system specification
2. `agwakwagan-ui-implementation-part1.md` - React component implementations
3. `agwakwagan-ui-implementation-part2.md` - Hooks, utilities, and styles

These should be referenced during implementation but the tasks above define the work structure.

---

## Installation Commands

```bash
# Install required dependencies
npm install @emotion/react @emotion/styled date-fns react-window

# Install dev dependencies
npm install -D @types/react-window

# Build and test
npm run build
npm run dev
```

---

## Notes for AI Assistant

**IMPORTANT**: Create all Beads issues BEFORE starting any implementation:

1. Run all `bd create` commands first
2. Note the issue IDs for dependencies
3. Claim issues one at a time
4. Complete in dependency order
5. Close with proper commit messages

The detailed implementation code is in the reference files, but follow this task structure for proper issue tracking.
