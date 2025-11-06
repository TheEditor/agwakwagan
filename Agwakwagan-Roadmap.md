# Agwakwagan - Development Roadmap

**Project:** Agwakwagan Kanban Board (Complete Rebuild)  
**Document Type:** Progress Tracking  
**Version:** 1.0  
**Last Updated:** November 5, 2025

---

## Current Status

**Phase:** Phase 0 - Project Setup  
**Progress:** 0% (Ready to start)  
**Next Milestone:** Complete Phase 0 setup

---

## Phase Tracking

### ✅ Planning Phase (COMPLETE)
- [x] Create Architecture Design Document
- [x] Create Feature Requirements Document
- [x] Create Implementation Phases Document
- [x] Create Project Summary Document
- [x] Create Development Roadmap
- [x] Review and approve all planning docs

**Completed:** November 5, 2025

---

### 🔄 Phase 0: Project Setup (IN PROGRESS)
**Target Duration:** 1-2 hours  
**Started:** Not yet  
**Target Completion:** TBD

#### Tasks
- [ ] 0.1 Clean existing codebase
  - [ ] Remove old component files
  - [ ] Clear unused dependencies
  - [ ] Delete old state management code
  
- [ ] 0.2 Install dependencies
  - [ ] @hello-pangea/dnd
  - [ ] framer-motion
  - [ ] date-fns
  
- [ ] 0.3 Setup type definitions
  - [ ] Create types/board.ts
  - [ ] Define Card, Column, Board interfaces
  
- [ ] 0.4 Setup utility functions
  - [ ] Create utils/ids.ts (ID generation)
  - [ ] Create utils/constants.ts (DEFAULT_BOARD)
  - [ ] Create utils/export.ts (export/import)
  
- [ ] 0.5 Setup Ozhiaki theme
  - [ ] Update globals.css with CSS variables
  - [ ] Define light theme colors
  - [ ] Define dark theme colors
  
- [ ] 0.6 Create hook structure
  - [ ] Create empty hook files
  - [ ] Setup folder structure
  
- [ ] 0.7 Create component structure
  - [ ] Create empty component files
  - [ ] Update app/page.tsx

**Acceptance Criteria:**
- [ ] Project compiles without errors
- [ ] Types defined and exported
- [ ] CSS variables applied
- [ ] File structure matches architecture
- [ ] `npm run dev` works

---

### 📋 Phase 1: Static Rendering (PENDING)
**Target Duration:** 3-4 hours  
**Started:** Not yet  
**Depends on:** Phase 0

#### Tasks
- [ ] 1.1 Implement useLocalStorage hook
- [ ] 1.2 Implement useBoardState hook
- [ ] 1.3 Implement useBoardSelectors hook
- [ ] 1.4 Implement basic useBoardActions (addCard)
- [ ] 1.5 Implement useBoard composition hook
- [ ] 1.6 Create Card component
- [ ] 1.7 Create Column component
- [ ] 1.8 Create KanbanBoard component
- [ ] 1.9 Update main page

**Acceptance Criteria:**
- [ ] Board displays with 3 default columns
- [ ] Can add cards to any column
- [ ] Cards persist after page reload
- [ ] Styled with Ozhiaki theme

---

### 📋 Phase 2: Drag & Drop (PENDING)
**Target Duration:** 4-6 hours  
**Depends on:** Phase 1

#### Tasks
- [ ] 2.1 Add moveCard action
- [ ] 2.2 Integrate @hello-pangea/dnd
- [ ] 2.3 Make Column droppable
- [ ] 2.4 Make Card draggable

**Acceptance Criteria:**
- [ ] Cards draggable within column
- [ ] Cards draggable to different columns
- [ ] Visual feedback during drag
- [ ] Order updates persist

---

### 📋 Phase 3: Data Persistence (PENDING)
**Target Duration:** 2-3 hours  
**Depends on:** Phase 2

#### Tasks
- [ ] 3.1 Add deleteCard action
- [ ] 3.2 Add updateCard action
- [ ] 3.3 Add export functionality
- [ ] 3.4 Add import functionality
- [ ] 3.5 Create BoardHeader component
- [ ] 3.6 Integrate header into KanbanBoard

**Acceptance Criteria:**
- [ ] Can export board as JSON
- [ ] Can import board from JSON
- [ ] Import validates file format
- [ ] Can delete cards

---

### 📋 Phase 4: Polish & MVP Completion (PENDING)
**Target Duration:** 3-4 hours  
**Depends on:** Phase 3

#### Tasks
- [ ] 4.1 Add theme toggle
- [ ] 4.2 Add card expansion/editing
- [ ] 4.3 Add save indicator
- [ ] 4.4 Final UX polish

**Acceptance Criteria:**
- [ ] Theme toggle works (light/dark)
- [ ] Cards editable inline
- [ ] Save indicator appears after changes
- [ ] All interactions polished

**🎉 MVP COMPLETE AFTER PHASE 4**

---

### 📋 Phase 5: Undo/Redo (POST-MVP)
**Target Duration:** 4-6 hours  
**Depends on:** Phase 4 (MVP)

#### Tasks
- [ ] 5.1 Implement useBoardUndo hook
- [ ] 5.2 Wrap actions with history tracking
- [ ] 5.3 Add keyboard shortcuts
- [ ] 5.4 Add undo/redo buttons
- [ ] 5.5 Add toast feedback

**Status:** Not started (Post-MVP feature)

---

### 📋 Phase 6: Tags & Advanced Features (POST-MVP)
**Target Duration:** 8-12 hours  
**Depends on:** Phase 5

#### Tasks
- [ ] 6.1 Extend data model
- [ ] 6.2 Create tag manager UI
- [ ] 6.3 Add tag selector to cards
- [ ] 6.4 Implement tag filtering
- [ ] 6.5 Style tags with colors

**Status:** Not started (Post-MVP feature)

---

## Timeline

```
Planning Phase     ████████████████████ DONE (Nov 5)
Phase 0 (Setup)    ░░░░░░░░░░░░░░░░░░░░ NOT STARTED
Phase 1 (Static)   ░░░░░░░░░░░░░░░░░░░░ PENDING
Phase 2 (DnD)      ░░░░░░░░░░░░░░░░░░░░ PENDING
Phase 3 (Data)     ░░░░░░░░░░░░░░░░░░░░ PENDING
Phase 4 (Polish)   ░░░░░░░░░░░░░░░░░░░░ PENDING
─────────────────── MVP COMPLETE ───────────────────
Phase 5 (Undo)     ░░░░░░░░░░░░░░░░░░░░ FUTURE
Phase 6 (Tags)     ░░░░░░░░░░░░░░░░░░░░ FUTURE
```

**Estimated MVP Completion:** Phase 4 (13-19 hours from start)

---

## Recent Updates

### 2025-11-05
- ✅ Created all planning documents
- ✅ Defined architecture (normalized data model)
- ✅ Specified features (user stories, acceptance criteria)
- ✅ Outlined implementation phases (7 phases total)
- 📝 Ready to begin Phase 0

---

## Next Actions

### Immediate (This Session)
1. **Start Phase 0** - Begin project setup
2. **Clean codebase** - Remove old code
3. **Install dependencies** - Add required packages
4. **Setup types** - Create board.ts interfaces

### Short Term (Next Session)
1. Complete Phase 0 setup
2. Begin Phase 1 static rendering
3. Implement basic hooks

### Medium Term (Next Week)
1. Complete Phases 1-2 (static + drag & drop)
2. Begin Phase 3 (persistence)
3. Test core functionality

### Long Term (This Month)
1. Complete MVP (Phases 0-4)
2. Deploy to production
3. Gather user feedback
4. Plan post-MVP features

---

## Blockers & Risks

### Current Blockers
None (just starting)

### Potential Risks
- **LocalStorage limits** - May need IndexedDB for large boards
  - Mitigation: Monitor size, warn users, plan migration path
- **Drag & drop complexity** - @hello-pangea/dnd learning curve
  - Mitigation: Follow docs carefully, have custom fallback plan
- **State management bugs** - Complex update logic
  - Mitigation: Unit test actions thoroughly, test incrementally

---

## Success Metrics

### Phase 0 Success
- [ ] Clean project compiles
- [ ] All types defined
- [ ] Theme configured
- [ ] Dev server runs

### MVP Success (After Phase 4)
- [ ] Can manage 50+ cards
- [ ] Zero data loss
- [ ] All actions <3 clicks
- [ ] Keyboard accessible
- [ ] Export/import works
- [ ] Fast & responsive

### Overall Project Success
- [ ] MVP deployed and used
- [ ] Positive user feedback
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Code maintainable
- [ ] Ready for post-MVP features

---

## Resources

### Documentation
- [Architecture Design](./Agwakwagan-Architecture-Design.md)
- [Feature Requirements](./Agwakwagan-Feature-Requirements.md)
- [Implementation Phases](./Agwakwagan-Implementation-Phases.md)
- [Project Summary](./Agwakwagan-Project-Summary.md)

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [@hello-pangea/dnd Docs](https://github.com/hello-pangea/dnd)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Change Log

### Version 1.0 - 2025-11-05
- Initial roadmap created
- All phases defined
- Planning documents complete
- Ready to begin development

---

## Notes

- **Naming:** "Agwakwagan" (Ojibwe for "sign") relates to "Kanban" (Japanese for "sign board")
- **Brand:** Ozhiaki colors (CMU Maroon, Forest Green)
- **Target:** Desktop-first, keyboard-friendly
- **Philosophy:** Incremental development, test continuously

---

**End of Roadmap**

Update this document after completing each phase to track progress.
