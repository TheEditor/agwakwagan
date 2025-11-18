# Beads Workflow Requirements for AI Assistants

## Executive Summary

This document explains why the Beads issue tracking requirement was missed during planning and provides recommendations to prevent this oversight in future projects.

---

## What Was Missed

**Critical Requirement:** The Phase 3.5 UI Redesign cannot begin implementation until all required Beads issues are created and dependency chains are established.

**File That Contained This:** `agwakwagan-phase-3.5-ui-redesign.md` lines 522-530

**What Should Have Happened:**
1. Create 7 Beads issues (3.5.1 through 3.5.7) using `bd create` commands
2. Establish dependency chain (3.5.1 → 3.5.2 → 3.5.3 → ... → 3.5.7)
3. Record issue IDs for use in commit messages
4. Plan implementation phases around these issue IDs
5. Only then begin coding

**What Actually Happened:**
- Created a standard implementation plan with phases and timelines
- Treated Beads structure as reference material, not prerequisite
- Started decomposing technical work before issue tracking was set up

---

## Root Cause Analysis

### 1. Didn't Prioritize CLAUDE.md Instructions

The CLAUDE.md file explicitly states:
> "This project uses bd (beads) for issue tracking. Use `bd` commands instead of markdown TODOs."

**Why Missed:**
- Treated this as informational context rather than a mandatory workflow requirement
- Focused on the technical content in the four specification files instead
- Didn't recognize that project management workflow takes precedence over implementation planning

### 2. Overlooked the Explicit Task Structure Section

The spec file has an entire section "Task Structure for Beads" (lines 29-501) with:
- 7 specific `bd create` commands
- Dependency declarations (--depends-on flags)
- Explicit issue IDs to use in commits
- A dependencies graph diagram
- A section titled "Notes for AI Assistant" with CAPITAL IMPORTANT warning

**Why Missed:**
- Read the section but categorized it as "reference material"
- Didn't recognize `bd create` commands as mandatory prerequisites
- Pattern-matched to typical project planning (phases → implementation)

### 3. Default Pattern-Matching Behavior

**Pattern Matched To:**
- Standard project implementation plans
- Technical task decomposition
- Risk/timeline estimation

**Didn't Match To:**
- Project-specific workflow requirements
- Issue tracking prerequisites
- Sequential gate-keeping (issues first, coding second)

### 4. Missed the Explicit Warning

Lines 522-530 contain a "Notes for AI Assistant" section with ALL CAPS emphasis:
```
**IMPORTANT**: Create all Beads issues BEFORE starting any implementation:

1. Run all `bd create` commands first
2. Note the issue IDs for dependencies
3. Claim issues one at a time
4. Complete in dependency order
5. Close with proper commit messages
```

**Why Missed:**
- This warning appeared AFTER the main task descriptions
- Treated it as supplementary note rather than blocking requirement
- Didn't recognize the sequential nature: issues → planning → implementation

---

## How to Prevent This in Future Projects

### For Project Owners/Instructors

#### 1. Add to CLAUDE.md (Top Priority)

Add a prominent section at the very beginning of CLAUDE.md:

```markdown
<!-- WORKFLOW:START -->
# CRITICAL WORKFLOW REQUIREMENTS FOR THIS PROJECT

## Issue Tracking with Beads (bd)

**This project uses bd (beads) for issue tracking. AI assistants MUST:**

1. **NEVER start implementation without creating Beads issues first**
2. **Create all required issues using `bd create` before any coding**
3. **Use `--depends-on` flags to establish dependency chains**
4. **Record issue IDs for use in commit messages**
5. **Complete issues in dependency order**

This is NON-NEGOTIABLE for multi-step work. See AGENTS.md for workflow details.

<!-- WORKFLOW:END -->
```

#### 2. Add Mandatory Checklist to Plan Requests

When asking for plans, include this requirement:

```
YOUR PLAN MUST INCLUDE:

Step 0: Beads Issue Creation (MANDATORY - MUST COME FIRST)
- List all Beads `bd create` commands that must run
- Show the dependency chain (issue-id → issue-id)
- Explain why each issue is necessary
- Do NOT include any implementation steps until issues are created

Steps 1+: Implementation phases
- Only after Step 0 is complete
- Reference Beads issue IDs in your plan
```

#### 3. Create a Pre-Implementation Checklist Section

In spec files, add at the very top (before content):

```markdown
# PRE-IMPLEMENTATION CHECKLIST (MUST COMPLETE BEFORE CODING)

**DO NOT PROCEED TO IMPLEMENTATION UNTIL ALL ITEMS ARE CHECKED:**

- [ ] All Beads issues created (see "Task Structure" section)
- [ ] Dependency chain verified and correct
- [ ] All issue IDs recorded for use in commits
- [ ] Project manager/user confirmed issue structure
- [ ] No code written until issues are set up

**IF THESE ARE NOT COMPLETE, PLANNING IS INCOMPLETE.**
```

#### 4. Use Format That Forces Attention

Use this structure for issue-dependent projects:

```markdown
## PHASE 0: Beads Issue Setup (PREREQUISITE - MANDATORY)

**This MUST complete before any other work begins.**

### Required Beads Issues

Create these issues in order:

1. **Issue 3.5.1: Design System Setup**
   ```bash
   bd create "Implement Ozhiaki design system with CSS variables and typography" -p 1 --json
   ```
   - Dependencies: None (root issue)
   - Timeline: 1 hour
   - Closes with: `bd update [issue-id] --status done --json`

2. **Issue 3.5.2: Drag-and-Drop Hook Implementation**
   ```bash
   bd create "Implement robust drag-and-drop system with visual feedback" -p 1 --depends-on [3.5.1-id] --json
   ```
   - Dependencies: 3.5.1
   - Timeline: 2 hours
   - Closes with: `bd update [issue-id] --status done --json`

[... etc for each issue ...]

## PHASE 1: Implementation (Only begins after Phase 0 complete)

[Only then include implementation details]
```

---

## Recommendations for AI Assistants

### When You Receive a Complex Multi-Task Project

**Always Check For:**

1. **Is this project using bd/beads for issue tracking?**
   - Search CLAUDE.md for "beads", "bd", "issue tracking"
   - If yes → Issues must come first

2. **Are there explicit `bd create` commands in the specs?**
   - If yes → These are MANDATORY prerequisites
   - Not optional → Not reference material → Not "nice to have"

3. **Is there a "Notes for AI Assistant" section?**
   - Read these carefully
   - Look for CAPS emphasis (IMPORTANT, MUST, MANDATORY)
   - Treat these as blocking requirements

4. **Is there a dependency graph or dependency chain mentioned?**
   - If yes → The project has sequential gate-keeping
   - Cannot parallelize across these gates
   - Must complete in order

### Planning Methodology for Beads-Tracked Projects

**Step 1: Identify all issues to create**
- Parse the spec for `bd create` commands
- List them in order of dependencies
- Document the dependency chain

**Step 2: Create the plan**
- Phase 0: Beads issue creation (with exact commands)
- Phase 1+: Implementation phases referencing issue IDs
- Include gate markers (e.g., "Pause here for user confirmation")

**Step 3: In the ExitPlanMode call**
- Clearly separate "Issue Creation" from "Implementation"
- Make it obvious that Phase 0 must complete before Phase 1
- Call out the dependency chain

**Step 4: Don't start implementation**
- Wait for user confirmation
- Only write code after issues are created and dependencies are established

---

## The Lesson

**Issue tracking is not just documentation—it's the project workflow.**

When a project says "use Beads," it doesn't mean "write about Beads in your plan." It means:
- Issues are the primary organizational unit
- Issue creation is a blocking prerequisite
- Dependency chains serialize the work
- Commits reference issues
- Issues track completion

This is a **sequential workflow requirement**, not a "nice to have" feature.

---

## Files to Update (For Agwakwagan Project)

If you encounter this in future work on this project, remember:

- `CLAUDE.md` - Contains workflow requirements
- `@/openspec/AGENTS.md` - Contains detailed spec workflows
- Any phase spec file ending in `.md` - May contain Beads task structures

Always read CLAUDE.md first. Always search for `bd create` commands. Always respect CAPS warnings.

---

## References

- CLAUDE.md (this project's AI instructions)
- agwakwagan-phase-3.5-ui-redesign.md (lines 522-530, the missed warning)
- @/openspec/AGENTS.md (Beads workflow documentation)
