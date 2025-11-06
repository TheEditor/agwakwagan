# Phase 0 - Task Specifications Index

**Project:** Agwakwagan Kanban Board  
**Phase:** 0 - Project Setup & Foundation  
**Total Estimated Time:** 60-70 minutes  
**Status:** Ready to Execute

---

## Overview

Phase 0 sets up the complete project foundation with agent-ready architecture. All tasks are designed to be executed by Claude Code VS Code extension.

**Critical:** This phase includes 3 small but important changes that make Phase 7-8 (agent integration) possible without refactoring.

---

## Task Files (Execute in Order)

### 1. [Phase-0-Task-1-Project-Init.md](./Phase-0-Task-1-Project-Init.md)
**Duration:** 10 minutes  
**What:** Initialize Next.js project, install dependencies, setup directory structure  
**Output:** Working Next.js app with all dependencies

### 2. [Phase-0-Task-2-Type-Definitions.md](./Phase-0-Task-2-Type-Definitions.md) ⭐
**Duration:** 5 minutes  
**What:** Create TypeScript types with agent-ready modifications  
**Output:** `types/board.ts` with Board ID and reserved fields  
**Critical:** Includes agent-ready changes

### 3. [Phase-0-Task-3-Utility-Functions.md](./Phase-0-Task-3-Utility-Functions.md) ⭐
**Duration:** 10 minutes  
**What:** ID generation and constants (including Board ID in DEFAULT_BOARD)  
**Output:** `utils/ids.ts`, `utils/constants.ts`  
**Critical:** DEFAULT_BOARD includes board ID

### 4. [Phase-0-Task-4-Theme-Setup.md](./Phase-0-Task-4-Theme-Setup.md)
**Duration:** 10 minutes  
**What:** Ozhiaki CSS variables for light/dark themes  
**Output:** Updated `app/globals.css` with brand colors

### 5. [Phase-0-Task-5-Hook-Structure.md](./Phase-0-Task-5-Hook-Structure.md) ⭐
**Duration:** 15 minutes  
**What:** Hook architecture with storage adapter pattern  
**Output:** 5 hook files including `useStorageAdapter.ts`  
**Critical:** Storage adapter makes Phase 7 easy

### 6. [Phase-0-Task-6-Component-Structure.md](./Phase-0-Task-6-Component-Structure.md)
**Duration:** 10 minutes  
**What:** Placeholder React components  
**Output:** 4 component files + updated `app/page.tsx`

### 7. [Phase-0-Task-7-Verification.md](./Phase-0-Task-7-Verification.md)
**Duration:** 10 minutes  
**What:** Comprehensive checks and Git commit  
**Output:** Verified working app, committed to Git

---

## Critical Agent-Ready Changes ⭐

**These 3 changes must be included in Phase 0:**

1. **Board ID in interface** (Task 2)
   ```typescript
   export interface Board {
     id: string;  // ⭐ Required for API/agent integration
     // ... rest
   }
   ```

2. **Board ID in DEFAULT_BOARD** (Task 3)
   ```typescript
   export const DEFAULT_BOARD: Board = {
     id: 'board-default',  // ⭐ Required
     // ... rest
   };
   ```

3. **Storage Adapter Interface** (Task 5)
   ```typescript
   export interface StorageAdapter {
     loadBoard(boardId: string): Promise<Board>;
     saveBoard(board: Board): Promise<void>;
   }
   ```

**Why critical?** Without these, Phase 7-8 would require major refactoring and data migration.

---

## File Tree After Phase 0

```
agwakwagan/
├── app/
│   ├── globals.css          (Updated with Ozhiaki theme)
│   ├── layout.tsx           (Default Next.js)
│   ├── page.tsx             (Updated to use KanbanBoard)
│   └── favicon.ico
├── components/
│   ├── KanbanBoard.tsx      ⭐ Root component
│   ├── Column.tsx
│   ├── Card.tsx
│   └── BoardHeader.tsx
├── hooks/
│   ├── useStorageAdapter.ts ⭐ Agent-ready
│   ├── useBoardState.ts
│   ├── useBoardActions.ts
│   ├── useBoardSelectors.ts
│   └── useBoard.ts
├── types/
│   └── board.ts             ⭐ With Board ID
├── utils/
│   ├── ids.ts
│   └── constants.ts         ⭐ With Board ID
├── docs/
│   └── Phase-0-Completion-Checklist.md
├── public/
├── node_modules/
├── .git/
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

---

## Verification Checklist

After completing all tasks:

- [ ] `npm run dev` works
- [ ] Browser shows board with 3 columns
- [ ] Board ID displayed: "board-default"
- [ ] LocalStorage has board data
- [ ] TypeScript compiles (no errors)
- [ ] Build succeeds
- [ ] All files committed to Git
- [ ] Board interface has `id` field ⭐
- [ ] DEFAULT_BOARD has board ID ⭐
- [ ] Storage adapter exists ⭐

---

## Common Issues

**"Cannot find module '@/types/board'"**
- Check tsconfig.json has correct path mapping
- Restart TypeScript server in VS Code

**"localStorage is not defined"**
- Add 'use client' directive to hooks
- Check running in browser, not server

**Build fails with missing dependencies**
- Run `npm install` again
- Check package.json has all dependencies

**CSS variables not working**
- Verify globals.css imported in layout.tsx
- Use syntax: `bg-[var(--color-bg)]`

---

## Time Tracking

| Task | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| Task 1 | 10 min | | |
| Task 2 | 5 min | | |
| Task 3 | 10 min | | |
| Task 4 | 10 min | | |
| Task 5 | 15 min | | |
| Task 6 | 10 min | | |
| Task 7 | 10 min | | |
| **Total** | **70 min** | | |

---

## Success Criteria

**Phase 0 is complete when:**

✅ Project compiles without errors  
✅ App runs in browser  
✅ Board displays with 3 columns  
✅ LocalStorage persists data  
✅ All agent-ready changes included  
✅ Code committed to Git  
✅ Ready for Phase 1

---

## Next Steps

After Phase 0 completion:

1. ✅ Review Phase 0 completion checklist
2. ✅ Take a break! You've set up the foundation
3. ➡️ Move to Phase 1: Static Rendering
4. ➡️ Implement actual board functionality

---

## Support Documents

- [Agwakwagan-Architecture-Design.md](../Agwakwagan-Architecture-Design.md) - Full architecture
- [Agwakwagan-Implementation-Phases.md](../Agwakwagan-Implementation-Phases.md) - All phases
- [PHASE-0-AGENT-READY-CHANGES.md](../PHASE-0-AGENT-READY-CHANGES.md) - Quick reference
- [DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) - All documentation

---

**Ready to start? Begin with Task 1!**

Execute these tasks in Claude Code VS Code extension for best results.
