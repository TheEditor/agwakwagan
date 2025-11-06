# Phase 0 - Task 1: Project Initialization and Dependencies

**Task ID:** P0-T1  
**Estimated Time:** 10 minutes  
**Dependencies:** None (fresh start)

---

## Context

You are setting up a brand new Next.js project for Agwakwagan, a desktop-first kanban board application. The repo has been wiped clean and you're starting fresh.

**GitHub Repo:** https://github.com/TheEditor/agwakwagan.git

---

## Objectives

1. Initialize Next.js project with TypeScript and Tailwind CSS
2. Install required dependencies
3. Configure project structure
4. Initialize Git and push to GitHub

---

## Tasks

### 1.1 Initialize Next.js Project

```bash
cd "C:\Users\davef\Documents\Projects\Claude\Vibe Coding\agwakwagan\agwakwagan"
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

**When prompted, select:**
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `app/` directory: Yes
- ✅ App Router: Yes
- ❌ Customize import alias: No
- ❌ `src/` directory: No

### 1.2 Install Additional Dependencies

```bash
npm install @hello-pangea/dnd framer-motion date-fns
```

**Packages:**
- `@hello-pangea/dnd` - Drag and drop library (maintained fork of react-beautiful-dnd)
- `framer-motion` - Animation library
- `date-fns` - Date formatting utilities

### 1.3 Verify Installation

Check that `package.json` includes:
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@hello-pangea/dnd": "^16.x",
    "framer-motion": "^11.x",
    "date-fns": "^4.x"
  }
}
```

### 1.4 Initialize Git and Push

```bash
git init
git add .
git commit -m "Initial Next.js setup with TypeScript and Tailwind"
git branch -M main
git remote add origin https://github.com/TheEditor/agwakwagan.git
git push -u origin main
```

### 1.5 Create Directory Structure

Create these empty directories (Git will track them once files are added):

```bash
mkdir -p types
mkdir -p utils
mkdir -p hooks
mkdir -p components
mkdir -p docs
```

---

## Acceptance Criteria

- [ ] Next.js project initialized with TypeScript
- [ ] All dependencies installed successfully
- [ ] `npm run dev` starts without errors (test on http://localhost:3000)
- [ ] Directory structure created
- [ ] Git initialized and pushed to GitHub
- [ ] No build errors

---

## Notes

- Keep the default Next.js structure (app/, public/, etc.)
- Don't delete any config files (next.config.ts, tailwind.config.ts, tsconfig.json)
- The project should show the default Next.js welcome page when running

---

## Next Task

After completion, proceed to **Phase-0-Task-2-Type-Definitions.md**
