# Agwakwagan Phase 4: Polish & MVP Completion - Task Specifications

**Phase:** 4 of 7  
**Phase Name:** Polish & MVP Completion  
**Estimated Time:** 3.5 hours  
**Dependencies:** Phase 3 (Data Persistence) complete  
**Status:** Ready for Implementation

---

## Phase Overview

**Goal:** Polish the UI, add theme switching, complete keyboard shortcuts, and finalize MVP.

**Deliverables:**
1. Light/dark theme toggle with smooth transitions
2. Complete keyboard shortcut system
3. Accessibility improvements (WCAG AA)
4. Visual polish (hover states, focus indicators, animations)
5. Empty state guidance
6. Performance optimization

**Why This Matters:**
- Professional appearance
- Accessibility compliance
- Power user efficiency (keyboard shortcuts)
- Delightful UX (animations, feedback)
- **MVP COMPLETE** - ready for real use

---

## Task Breakdown

### Task 4.1: Theme Switching (1 hour)

**Goal:** Enable light/dark theme toggle with smooth transitions.

#### Step 1: Verify CSS Variables (15 min)

Ensure `app/globals.css` has complete theme support:

```css
/* Should already exist from Phase 0 */
:root {
  /* Light theme vars */
  --color-bg: #ffffff;
  --color-surface: #f5f5f5;
  --color-text: #1a1a1a;
  /* ... all others */
}

.dark {
  /* Dark theme vars */
  --color-bg: #1a1a1a;
  --color-surface: #2a2a2a;
  --color-text: #f5f5f5;
  /* ... all others */
}

/* Add smooth transitions */
* {
  transition: background-color 0.2s ease, 
              color 0.2s ease, 
              border-color 0.2s ease;
}

/* Disable transitions during drag */
.is-dragging * {
  transition: none !important;
}
```

**Verify all semantic variables defined for both themes:**
- Background colors (bg, surface, surface-hover)
- Text colors (primary, secondary, tertiary)
- Border colors
- Brand colors (primary, secondary)
- Status colors (success, warning, error)

#### Step 2: Create Theme Hook (20 min)

Create `src/hooks/useTheme.ts`:

```typescript
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'agwakwagan-theme';

/**
 * Hook for managing app theme
 */
export function useTheme() {
  // Initialize from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save preference
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return { theme, toggleTheme, isDark };
}
```

**Why this design:**
- Respects system preference initially
- Persists user choice
- Simple toggle function
- Applies theme immediately via class

#### Step 3: Create Theme Toggle Button (25 min)

Create `src/components/ThemeToggle.tsx`:

```typescript
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
```

**Add to BoardHeader:**

```typescript
import { ThemeToggle } from './ThemeToggle';

export function BoardHeader({ ... }: BoardHeaderProps) {
  return (
    <header className="...">
      {/* ... other content ... */}
      
      <div className="flex items-center gap-3">
        {/* Import/Export buttons */}
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
```

**Testing Checklist:**
- [ ] Toggle button appears in header
- [ ] Click switches theme instantly
- [ ] Icon changes (sun ↔ moon)
- [ ] Preference persists after reload
- [ ] Respects system preference initially
- [ ] All colors update smoothly
- [ ] No flash of wrong theme on load
- [ ] Works in all browsers

---

### Task 4.2: Complete Keyboard Shortcuts (45 min)

**Goal:** Comprehensive keyboard shortcut system for power users.

#### Step 1: Create Keyboard Hook (30 min)

Create `src/hooks/useKeyboardShortcuts.ts`:

```typescript
import { useEffect } from 'react';
import { Board, Card } from '@/types/board';

interface UseKeyboardShortcutsProps {
  board: Board;
  onAddCard: (columnId: string) => void;
  onExport: () => void;
  onImport: () => void;
  // Add more handlers as needed
}

/**
 * Global keyboard shortcuts
 */
export function useKeyboardShortcuts({
  board,
  onAddCard,
  onExport,
  onImport,
}: UseKeyboardShortcutsProps) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;
      
      if (isTyping) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // N - New card in first column
      if (e.key === 'n' && !modKey) {
        e.preventDefault();
        const firstColumnId = board.columnOrder[0];
        if (firstColumnId) {
          onAddCard(firstColumnId);
        }
      }

      // Cmd/Ctrl + E - Export
      if (e.key === 'e' && modKey) {
        e.preventDefault();
        onExport();
      }

      // Cmd/Ctrl + I - Import
      if (e.key === 'i' && modKey) {
        e.preventDefault();
        onImport();
      }

      // Escape - Close modal/expanded card (handled by components)
      // Cmd/Ctrl + Z - Undo (Phase 5)
      // Cmd/Ctrl + Shift + Z - Redo (Phase 5)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, onAddCard, onExport, onImport]);
}
```

#### Step 2: Integrate with Main Component (15 min)

Update `src/app/page.tsx`:

```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportBoard } from '@/utils/export';

export default function Home() {
  const [board, setBoard, storageStatus] = useBoardStorage(DEFAULT_BOARD);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCard = (columnId: string) => {
    // Create new card in specified column
    const newCard = createCard({
      title: 'New Card',
      columnId,
    });

    setBoard({
      ...board,
      cards: {
        ...board.cards,
        [newCard.id]: newCard,
      },
    });
  };

  const handleExport = () => {
    exportBoard(board);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    board,
    onAddCard: handleAddCard,
    onExport: handleExport,
    onImport: handleImportClick,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ... */}
    </div>
  );
}
```

**Testing Checklist:**
- [ ] 'N' creates card in first column
- [ ] Cmd/Ctrl+E exports board
- [ ] Cmd/Ctrl+I opens import dialog
- [ ] Shortcuts don't fire when typing
- [ ] Works on Mac (Cmd) and Windows (Ctrl)
- [ ] Escape closes modals (if applicable)

---

### Task 4.3: Accessibility Improvements (45 min)

**Goal:** WCAG AA compliance for keyboard and screen reader users.

#### Step 1: Focus Indicators (20 min)

Add to `app/globals.css`:

```css
/* Enhanced focus indicators */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default outline */
*:focus {
  outline: none;
}

/* Button focus states */
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Input focus states */
input:focus-visible,
textarea:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(106, 0, 50, 0.1);
}

/* Card focus states */
.kanban-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

#### Step 2: ARIA Labels (15 min)

Audit all interactive elements for proper labels:

```typescript
// Example: Card component
<div
  role="button"
  tabIndex={0}
  aria-label={`Card: ${card.title}`}
  className="kanban-card"
>
  {/* ... */}
</div>

// Example: Column header
<header aria-label={`Column: ${column.title}`}>
  {/* ... */}
</header>

// Example: Add card button
<button aria-label={`Add card to ${column.title}`}>
  <Plus className="w-4 h-4" />
</button>
```

#### Step 3: Keyboard Navigation (10 min)

Ensure all interactive elements are keyboard accessible:

```typescript
// Example: Card with keyboard support
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }}
  onClick={handleCardClick}
  className="kanban-card"
>
  {/* ... */}
</div>
```

**Testing Checklist:**
- [ ] Can navigate entire app with Tab
- [ ] Focus indicators clearly visible
- [ ] Enter/Space activate buttons
- [ ] Screen reader announces elements correctly
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] No keyboard traps

---

### Task 4.4: Visual Polish (45 min)

**Goal:** Professional appearance with smooth interactions.

#### Step 1: Hover States (15 min)

Ensure all interactive elements have hover feedback:

```css
/* Button hovers */
.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(106, 0, 50, 0.2);
}

/* Card hovers */
.kanban-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Column hovers */
.kanban-column:hover {
  background-color: var(--color-surface-hover);
}
```

#### Step 2: Loading Animations (15 min)

Add subtle loading feedback:

```typescript
// Example: Spinner component
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="w-full h-full border-4 border-gray-300 border-t-primary rounded-full" />
    </div>
  );
}
```

#### Step 3: Smooth Animations (15 min)

Add CSS transitions for state changes:

```css
/* Smooth property transitions */
.kanban-card {
  transition: all 0.2s ease;
}

.kanban-column {
  transition: background-color 0.2s ease;
}

/* Fade in animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: fadeIn 0.3s ease;
}
```

**Testing Checklist:**
- [ ] All buttons have hover states
- [ ] Cards animate on hover
- [ ] New cards fade in smoothly
- [ ] Theme transitions are smooth
- [ ] No jarring state changes
- [ ] Animations don't interfere with drag

---

### Task 4.5: Empty States (30 min)

**Goal:** Guide new users with helpful empty state messages.

#### Step 1: Empty Board State (10 min)

```typescript
// In KanbanBoard component
{board.columnOrder.length === 0 && (
  <div className="flex flex-col items-center justify-center h-96 text-center">
    <div className="text-gray-400 dark:text-gray-600 mb-4">
      <Columns className="w-16 h-16 mx-auto" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
      No columns yet
    </h3>
    <p className="text-gray-500 dark:text-gray-500 mb-4">
      Get started by adding your first column
    </p>
    <button
      onClick={handleAddColumn}
      className="btn-primary"
    >
      Add Column
    </button>
  </div>
)}
```

#### Step 2: Empty Column State (10 min)

```typescript
// In Column component
{cardIds.length === 0 && (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
    <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
      No cards yet
    </p>
    <button
      onClick={() => onAddCard(column.id)}
      className="text-sm text-primary hover:underline"
    >
      Add first card
    </button>
  </div>
)}
```

#### Step 3: First-time User Tip (10 min)

```typescript
// Optional: Show tooltip on first visit
export function WelcomeTip() {
  const [show, setShow] = useState(() => {
    return !localStorage.getItem('agwakwagan-welcome-seen');
  });

  const dismiss = () => {
    localStorage.setItem('agwakwagan-welcome-seen', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
          Welcome to Agwakwagan! 👋
        </h4>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">N</kbd> to add cards quickly
      </p>
      <button onClick={dismiss} className="btn-primary btn-sm w-full">
        Got it
      </button>
    </div>
  );
}
```

**Testing Checklist:**
- [ ] Empty board shows helpful message
- [ ] Empty columns show add card prompt
- [ ] Welcome tip shows on first visit
- [ ] Welcome tip can be dismissed
- [ ] Empty states don't show after adding items

---

### Task 4.6: Performance Optimization (30 min)

**Goal:** Ensure smooth performance with large boards.

#### Step 1: Memoization (15 min)

Add React.memo to expensive components:

```typescript
import { memo } from 'react';

// Card component
export const Card = memo(function Card({ card, onUpdate }: CardProps) {
  // ... component code
});

// Column component
export const Column = memo(function Column({ column, cardIds, ... }: ColumnProps) {
  // ... component code
});
```

#### Step 2: Virtual Scrolling Check (5 min)

For large boards (100+ cards), consider if needed:

```typescript
// If columns have 50+ cards, implement virtual scrolling
// For MVP, just document as future enhancement
// Current limit: Test with 200 cards total
```

#### Step 3: Debounce Heavy Operations (10 min)

Already implemented in Phase 3 (localStorage debouncing). Verify:

```typescript
// Auto-save debounced at 1000ms
// No additional debouncing needed for MVP
```

**Testing Checklist:**
- [ ] Board with 50+ cards feels smooth
- [ ] Drag-drop responsive with 100+ cards
- [ ] No lag during typing
- [ ] Theme switch is instant
- [ ] No memory leaks (check DevTools)

---

## Integration Checklist

After completing all tasks:

- [ ] **Theme switching**
  - [ ] Toggle button works
  - [ ] Smooth transitions
  - [ ] Preference persists
  - [ ] All colors update correctly

- [ ] **Keyboard shortcuts**
  - [ ] All shortcuts work
  - [ ] Don't interfere with typing
  - [ ] Cross-platform (Mac/Windows)

- [ ] **Accessibility**
  - [ ] Tab navigation works
  - [ ] Focus indicators visible
  - [ ] ARIA labels present
  - [ ] Screen reader compatible

- [ ] **Visual polish**
  - [ ] All hover states present
  - [ ] Smooth animations
  - [ ] Consistent spacing
  - [ ] Professional appearance

- [ ] **Empty states**
  - [ ] Helpful messages
  - [ ] Clear CTAs
  - [ ] Welcome tip (optional)

- [ ] **Performance**
  - [ ] Smooth with large boards
  - [ ] No lag or jankyness
  - [ ] Memory usage reasonable

---

## Manual Testing Workflow

### Test 1: Theme Switching
1. Click theme toggle
2. Verify colors update instantly
3. Check all UI elements (header, cards, columns)
4. Reload page - theme persists
5. Verify smooth transitions

### Test 2: Keyboard Shortcuts
1. Press 'N' - card created
2. Press Cmd/Ctrl+E - board exports
3. Press Cmd/Ctrl+I - import dialog opens
4. Type in card title - shortcuts don't fire
5. Navigate with Tab key

### Test 3: Accessibility
1. Navigate app using only keyboard
2. Verify all elements reachable
3. Check focus indicators visible
4. Test with screen reader (optional)
5. Verify color contrast

### Test 4: Visual Polish
1. Hover all interactive elements
2. Verify smooth transitions
3. Check animations (card creation, drag)
4. Test in both light and dark themes
5. Verify spacing and alignment

### Test 5: Empty States
1. Start with empty board
2. Verify helpful message shown
3. Add column - empty column message shown
4. Add card - empty state disappears
5. Check welcome tip (if implemented)

### Test 6: Performance
1. Create board with 50 cards
2. Test drag-drop responsiveness
3. Switch themes - no lag
4. Type in card - no lag
5. Check browser memory (DevTools)

---

## Success Criteria

Phase 4 is complete when:

1. ✅ **Theme switching works**
   - Smooth transitions
   - Preference persists
   - All colors update correctly

2. ✅ **Keyboard shortcuts complete**
   - All shortcuts functional
   - Cross-platform compatible
   - Don't interfere with typing

3. ✅ **Accessibility compliant**
   - WCAG AA contrast
   - Keyboard navigation complete
   - Focus indicators visible
   - Screen reader compatible

4. ✅ **Visual polish complete**
   - Professional appearance
   - Smooth animations
   - Consistent hover states
   - Proper spacing

5. ✅ **Empty states helpful**
   - Clear guidance for new users
   - CTAs for all empty states

6. ✅ **Performance optimized**
   - Smooth with 50+ cards
   - No lag or jank
   - Efficient memory usage

7. ✅ **MVP COMPLETE**
   - All Phase 0-4 features working
   - Ready for real use
   - Deployable

---

## Known Limitations & Future Work

**Current Limitations:**
- No undo/redo (Phase 5)
- No tags/filtering (Phase 6)
- No API/agent support (Phase 7-8)
- No mobile optimization
- No real-time collaboration

**Future Enhancements:**
- Undo/redo history (Phase 5)
- Tag system with filtering (Phase 6)
- Keyboard shortcut help menu
- Customizable shortcuts
- Tooltips for all actions
- Onboarding tour

---

## Files Modified

This phase touches:

**New Files:**
- `src/hooks/useTheme.ts` (theme management)
- `src/hooks/useKeyboardShortcuts.ts` (shortcuts)
- `src/components/ThemeToggle.tsx` (toggle button)
- `src/components/WelcomeTip.tsx` (optional)

**Modified Files:**
- `src/components/BoardHeader.tsx` (add theme toggle)
- `src/app/page.tsx` (integrate shortcuts)
- `src/app/globals.css` (polish, transitions, focus)
- Various components (accessibility labels, empty states)

**Total LOC:** ~400 lines

---

## Time Breakdown

- Task 4.1: Theme switching - 1 hour
- Task 4.2: Keyboard shortcuts - 45 minutes
- Task 4.3: Accessibility - 45 minutes
- Task 4.4: Visual polish - 45 minutes
- Task 4.5: Empty states - 30 minutes
- Task 4.6: Performance - 30 minutes
- Testing & refinement - 30 minutes

**Total: 3.5 hours**

---

## Dependencies & Risks

**Dependencies:**
- Phase 3 complete (need working persistence)
- CSS variables defined (Phase 0)
- Component structure stable

**Risks:**
- Theme flash on load (cached with localStorage)
- Keyboard shortcuts conflict with browser defaults (use preventDefault)
- Performance issues with large boards (use memoization)
- Accessibility testing requires screen reader (optional, but verify basics)

**Blockers:**
- None (Phase 3 complete)

---

## Agent-Ready Considerations

Phase 4 sets good UX foundation for future agent integration:

- **Theme system** - Agents can respect user theme preference
- **Keyboard shortcuts** - Power users (including agents) benefit from shortcuts
- **Accessibility** - API will need similar ARIA-like metadata
- **Empty states** - Good pattern for API responses

No additional work needed now.

---

## Notes for Implementer

**Architecture decisions:**
- Theme via CSS classes (not inline styles) - easier to maintain
- Keyboard shortcuts centralized - easier to document/modify
- Focus on WCAG AA compliance - sufficient for most users
- Memoization only where needed - don't over-optimize

**Testing priorities:**
1. Theme switching - most visible feature
2. Keyboard shortcuts - power user feature
3. Accessibility - compliance requirement
4. Performance - critical for large boards

**Common pitfalls:**
- Theme flash on load (use localStorage correctly)
- Keyboard shortcuts firing during typing (check target element)
- Missing focus indicators (test with keyboard navigation)
- Over-animating (keep it subtle)

**Time-saving tips:**
- Test theme in both modes as you build
- Use browser DevTools Lighthouse for accessibility
- Keep keyboard shortcut list in code comment
- Test empty states by clearing localStorage

---

**Phase 4 Complete = MVP COMPLETE! 🎉🎉🎉**

**Next Steps:**
- Deploy and use the app
- Gather feedback
- Decide on Phase 5-8 priorities based on real usage

**Post-MVP Phases Available:**
- Phase 5: Undo/Redo (4-6h)
- Phase 6: Tags & Filtering (8-12h)
- Phase 7-8: API & Agent Integration (20-28h)
