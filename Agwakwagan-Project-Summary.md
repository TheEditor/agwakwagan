# Agwakwagan - Project Summary

**Project:** Agwakwagan Kanban Board (Complete Rebuild)  
**Document Type:** Quick Reference  
**Version:** 1.0  
**Created:** November 5, 2025  
**Status:** Ready to Start Development

---

## What is Agwakwagan?

**Agwakwagan** (Ojibwe for "sign") is a desktop-first kanban board for power users managing complex projects. It emphasizes speed, keyboard shortcuts, and data safety.

**Key Features:**
- Multiple customizable columns
- Drag & drop cards
- Auto-save with LocalStorage
- Export/import board data
- Dark/light themes
- Inline card editing

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + CSS Variables
- **Drag & Drop:** @hello-pangea/dnd
- **Animations:** Framer Motion
- **Storage:** LocalStorage (client-side)

---

## Architecture Highlights

### Data Model
**Normalized (flat) structure** - not nested:
```typescript
{
  cards: { 'card-1': {...}, 'card-2': {...} },  // Dictionary
  columns: { 'col-1': {...}, 'col-2': {...} },
  columnOrder: ['col-1', 'col-2']
}
```

**Why?** Fast lookups, easy updates, supports undo/redo

### State Management
**Separated hooks:**
- `useBoardState()` - LocalStorage wrapper
- `useBoardActions()` - Business logic (add, move, delete)
- `useBoardSelectors()` - Derived data (memoized)
- `useBoard()` - Composition layer

**Why?** Testable, maintainable, extensible

---

## Project Structure

```
agwakwagan/
├── app/
│   └── page.tsx                  # Main entry
├── components/
│   ├── KanbanBoard.tsx           # Root component
│   ├── Column.tsx                # Column with cards
│   ├── Card.tsx                  # Single card
│   └── BoardHeader.tsx           # Theme, export, import
├── hooks/
│   ├── useBoard.ts               # Composition
│   ├── useBoardState.ts          # Storage
│   ├── useBoardActions.ts        # Mutations
│   ├── useBoardSelectors.ts      # Queries
│   └── useLocalStorage.ts        # Generic storage
├── types/
│   └── board.ts                  # TypeScript types
├── utils/
│   ├── constants.ts              # Default board, keys
│   ├── ids.ts                    # ID generation
│   └── export.ts                 # Export/import logic
└── docs/
    ├── Agwakwagan-Architecture-Design.md
    ├── Agwakwagan-Feature-Requirements.md
    └── Agwakwagan-Implementation-Phases.md
```

---

## Development Phases

### MVP (Phases 0-4) - ~13-19 hours

**Phase 0:** Project Setup (1-2h)
- Clean codebase
- Install dependencies
- Setup types & utils
- Configure Ozhiaki theme

**Phase 1:** Static Rendering (3-4h)
- Display columns and cards
- Add card functionality
- Basic styling

**Phase 2:** Drag & Drop (4-6h)
- Integrate @hello-pangea/dnd
- Move cards between columns
- Reorder within columns

**Phase 3:** Persistence (2-3h)
- Export/import board
- Delete cards
- Update cards

**Phase 4:** Polish (3-4h)
- Theme toggle
- Inline editing
- Save indicator
- UX refinements

### Post-MVP (Phases 5-6)

**Phase 5:** Undo/Redo (4-6h)
- History stack
- Keyboard shortcuts
- UI feedback

**Phase 6:** Tags & Advanced (8-12h)
- Tagging system
- Filtering
- Search

---

## Quick Start (Phase 0)

```bash
# 1. Navigate to project
cd agwakwagan

# 2. Install dependencies
npm install @hello-pangea/dnd framer-motion date-fns

# 3. Create type definitions
# Create types/board.ts with Card, Column, Board interfaces

# 4. Setup utils
# Create utils/ids.ts, utils/constants.ts, utils/export.ts

# 5. Create hook structure
# Create hooks/ folder with empty files

# 6. Configure theme
# Update globals.css with Ozhiaki CSS variables

# 7. Start dev server
npm run dev
```

See Implementation Phases doc for detailed tasks.

---

## Key Decisions

### Why Normalized Data?
- O(1) lookups by ID
- Minimal updates (change 1 field vs rebuild arrays)
- Easier undo/redo (store diffs)
- Scales better

### Why @hello-pangea/dnd?
- Best UX for kanban drag & drop
- Excellent accessibility
- Maintained actively
- Proven at scale

### Why LocalStorage?
- Zero setup
- Works offline
- 5-10MB sufficient for typical use
- Can migrate to IndexedDB later if needed

### Why Separate Hooks?
- Testable in isolation
- Clear separation of concerns
- Easy to extend
- Follows single responsibility principle

---

## Ozhiaki Branding

**Colors:**
- Primary: CMU Maroon (#6a0032)
- Secondary: Forest Green (#2d5016)
- Neutral: Grayscale with warm undertones

**Design Principles:**
- Clean, minimal interface
- Generous whitespace
- Smooth animations
- Professional tone

---

## Testing Strategy

**Per Phase:**
- Manual testing of new features
- Regression testing of previous features
- Browser compatibility check

**Before MVP Release:**
- Comprehensive manual test
- Performance test (100+ cards)
- Data integrity test (export/import)
- Accessibility test (keyboard only)
- All target browsers

**Later (Optional):**
- Unit tests (Jest)
- Integration tests (React Testing Library)
- E2E tests (Playwright)

---

## Success Criteria

**MVP is successful when:**
- ✅ Can manage 50+ card project comfortably
- ✅ Zero data loss over 1 week of use
- ✅ All core actions in <3 clicks
- ✅ Keyboard users can do everything
- ✅ Export/import preserves all data
- ✅ Feels fast and responsive

**Each phase successful when:**
- ✅ Acceptance criteria met
- ✅ No regressions
- ✅ Definition of done complete
- ✅ Tested in all browsers

---

## Known Constraints

- **Desktop only** - No mobile optimization
- **Single user** - No collaboration
- **Client-side only** - No backend/server
- **LocalStorage** - 5-10MB limit (sufficient for now)
- **Modern browsers** - Chrome, Firefox, Safari (latest 2 versions)

---

## Next Actions

1. **Start Phase 0** - Project setup (1-2 hours)
2. **Review Architecture doc** - Understand data model
3. **Follow Implementation Phases** - Step by step
4. **Test continuously** - Don't accumulate bugs
5. **Deploy early** - Get feedback soon

---

## Documentation

**Planning Docs (Read First):**
1. Agwakwagan-Architecture-Design.md - System design, data model
2. Agwakwagan-Feature-Requirements.md - User stories, UX patterns
3. Agwakwagan-Implementation-Phases.md - Step-by-step build plan

**Reference:**
- Agwakwagan-Project-Summary.md - This document
- Agwakwagan-Roadmap.md - Progress tracking

---

## Glossary

**Agwakwagan** - Ojibwe word meaning "sign"  
**Normalized data** - Flat structure with references, not nested  
**MVP** - Minimum Viable Product (Phase 0-4)  
**LocalStorage** - Browser storage API, ~5-10MB limit  
**IndexedDB** - Browser database API, much larger capacity  
**DnD** - Drag and Drop  
**Ozhiaki** - Brand name, culturally significant

---

**End of Project Summary**

For detailed information, refer to the three main planning documents: Architecture Design, Feature Requirements, and Implementation Phases.
