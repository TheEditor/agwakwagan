<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Issue Tracking with br (beads_rust)

**Note:** `br` is non-invasive and never executes git commands. After `br sync --flush-only`, you must manually run `git add .beads/ && git commit`.

**Legacy IDs:** Existing issues may still use `bd-*` IDs. New issues use `agw-*`.

**IMPORTANT**: This project uses **br (beads_rust)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why br?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**
```bash
br ready --json
```

**Create new issues:**
```bash
br create "Issue title" -t bug|feature|task -p 0-4 --json
br create "Issue title" -p 1 --deps discovered-from:br-123 --json
```

**Claim and update:**
```bash
br update br-42 --status in_progress --json
br update br-42 --priority 1 --json
```

**Complete work:**
```bash
br close br-42 --reason "Completed" --json
```

**Search and filter:**
```bash
br list --status open --priority 1 --json
br list --label-any urgent,critical --json
br show <id> --json
```

**Sync (CRITICAL at end of session!):**
```bash
br sync --flush-only  # Force immediate export/commit/push
git add .beads/
git commit -m "sync beads"
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `br ready` shows unblocked issues
2. **Claim your task**: `br update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `br create "Found bug" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `br close <id> --reason "Done"`
6. **Commit together**: Always commit the `.beads/issues.jsonl` file together with the code changes so issue state stays in sync with code state

### Auto-Sync

br automatically syncs with git:
- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!


### Managing AI-Generated Planning Documents

AI assistants often create planning and design documents during development:
- PLAN.md, IMPLEMENTATION.md, ARCHITECTURE.md
- DESIGN.md, CODEBASE_SUMMARY.md, INTEGRATION_PLAN.md
- TESTING_GUIDE.md, TECHNICAL_DESIGN.md, and similar files

**Best Practice: Use a dedicated directory for these ephemeral files**

**Recommended approach:**
- Create a `history/` directory in the project root
- Store ALL AI-generated planning/design docs in `history/`
- Keep the repository root clean and focused on permanent project files
- Only access `history/` when explicitly asked to review past planning

**Example .gitignore entry (optional):**
```
# AI planning documents (ephemeral)
history/
```

### What's New?

Before starting work run `br info --whats-new` to see agent-relevant changes from recent versions:

```bash
br info --whats-new          # Human-readable output
br info --whats-new --json   # Machine-readable output
```

This shows the last 3 versions with workflow-impacting changes, avoiding the need to re-read all documentation. Examples:
- New commands and flags that improve agent workflows
- Breaking changes that require workflow updates
- Performance improvements and bug fixes
- Integration features (MCP, Agent Mail, git hooks)

**Why this matters:** br releases weekly with major versions. This command helps you quickly understand what changed. It's possible the new info will conflict with the command descriptions elsewhere in this file. Make note of it before you start any work.

**Benefits:**
- ✅ Clean repository root
- ✅ Clear separation between ephemeral and permanent documentation
- ✅ Easy to exclude from version control if desired
- ✅ Preserves planning history for archeological research
- ✅ Reduces noise when browsing the project

### Important Rules

- ✅ Use br for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `br ready` before asking "what should I work on?"
- ✅ Store AI planning docs in `history/` directory
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems
- ❌ Do NOT clutter repo root with planning documents

For more details, see README.md and QUICKSTART.md. 

### Landing the Plane

**When the user says "let's land the plane"**, follow this clean session-ending protocol:

1. **File beads issues for any remaining work** that needs follow-up
2. **Ensure all quality gates pass** (only if code changes were made) - run tests, linters, builds (file P0 issues if broken)
3. **Update beads issues** - close finished work, update status
4. **Sync the issue tracker carefully** - Work methodically to ensure both local and remote issues merge safely. This may require pulling, handling conflicts (sometimes accepting remote changes and re-importing), syncing the database, and verifying consistency. Be creative and patient - the goal is clean reconciliation where no issues are lost.
5. **Clean up git state** - Clear old stashes and prune dead remote branches:
   ```bash
   git stash clear                    # Remove old stashes
   git remote prune origin            # Clean up deleted remote branches
   ```
6. **Verify clean state** - Ensure all changes are committed and pushed, no untracked files remain
7. **Choose a follow-up issue for next session**
   - Provide a prompt for the user to give to you in the next session
   - Format: "Continue work on bd-X: [issue title]. [Brief context about what's been done and what's next]"

**Example "land the plane" session:**

```bash
# 1. File remaining work
br create "Add integration tests for sync" -t task -p 2 --json

# 2. Run quality gates (only if code changes were made)
go test -short ./...
golangci-lint run ./...

# 3. Close finished issues
br close br-42 br-43 --reason "Completed" --json

# 4. Sync carefully - example workflow (adapt as needed):
git pull --rebase
# If conflicts in .beads/issues.jsonl, resolve thoughtfully:

#   - git checkout --theirs .beads/issues.jsonl (accept remote)

#   - br sync --import-only -i .beads/issues.jsonl (re-import)

git add .beads/
git commit -m "sync beads"
#   - Or manual merge, then import
br sync --flush-only  # Export/import/verify
git add .beads/
git commit -m "sync beads"
git push
# Repeat pull/push if needed until clean

# 5. Verify clean state
git status

# 6. Choose next work
br ready --json
br show br-44 --json
```

**Then provide the user with:**

- Summary of what was completed this session
- What issues were filed for follow-up
- Status of quality gates (all passing / issues filed)
- Recommended prompt for next session
