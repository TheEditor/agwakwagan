# Phase 2 - Task Specifications Index

**Project:** Agwakwagan Kanban Board  
**Phase:** 2 - Drag & Drop  
**Total Estimated Time:** 4-6 hours  
**Status:** Ready to Execute  
**Prerequisites:** Phase 1 complete

---

## Overview

Phase 2 implements drag & drop functionality using @hello-pangea/dnd library. Users will be able to:
- Drag cards within the same column (reorder)
- Drag cards between columns (move)
- See visual feedback during drag
- Have new positions persist automatically

---

## Task Files (Execute in Order)

### 1. [Phase-2-Task-1-Implement-MoveCard.md](./Phase-2-Task-1-Implement-MoveCard.md)
**Duration:** 60-90 minutes  
**What:** Implement moveCard action with order recalculation  
**Output:** Working card movement logic

### 2. [Phase-2-Task-2-Setup-DnD-Context.md](./Phase-2-Task-2-Setup-DnD-Context.md)
**Duration:** 45-60 minutes  
**What:** Add DragDropContext to KanbanBoard  
**Output:** DnD provider with onDragEnd handler

### 3. [Phase-2-Task-3-Make-Column-Droppable.md](./Phase-2-Task-3-Make-Column-Droppable.md)
**Duration:** 30-45 minutes  
**What:** Wrap column card list in Droppable  
**Output:** Columns accept dropped cards

### 4. [Phase-2-Task-4-Make-Card-Draggable.md](./Phase-2-Task-4-Make-Card-Draggable.md)
**Duration:** 45-60 minutes  
**What:** Wrap Card in Draggable with styling  
**Output:** Cards can be dragged with visual feedback

### 5. [Phase-2-Task-5-Testing-And-Polish.md](./Phase-2-Task-5-Testing-And-Polish.md)
**Duration:** 60-90 minutes  
**What:** Test all drag scenarios, fix bugs, polish UX  
**Output:** Production-ready drag & drop

---

## Success Criteria

**Phase 2 is complete when:**
- ✅ Can drag cards within same column
- ✅ Can drag cards between columns
- ✅ Visual feedback during drag (opacity, hover states)
- ✅ Drop zones clearly indicated
- ✅ Order updates persist after page reload
- ✅ Smooth animations
- ✅ Keyboard drag works (Space to grab, arrows to move)
- ✅ No visual glitches or jank

---

## Testing Checklist

- [ ] Drag card within TODO column (reorder)
- [ ] Drag card from TODO to In Progress
- [ ] Drag card from In Progress to Done
- [ ] Drag card from Done back to TODO
- [ ] Drag multiple cards in sequence
- [ ] Drop card at beginning of column
- [ ] Drop card in middle of column
- [ ] Drop card at end of column
- [ ] Reload page - verify positions persist
- [ ] Keyboard: Space to grab, arrows to move, Space to drop
- [ ] No console errors

---

## Time Tracking

| Task | Estimated | Actual |
|------|-----------|--------|
| Task 1 | 60-90 min | |
| Task 2 | 45-60 min | |
| Task 3 | 30-45 min | |
| Task 4 | 45-60 min | |
| Task 5 | 60-90 min | |
| **Total** | **4-6 hours** | |

---

**Ready to start? Begin with Task 1: Implement MoveCard!**
