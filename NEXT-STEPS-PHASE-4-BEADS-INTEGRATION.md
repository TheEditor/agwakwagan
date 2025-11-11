# Phase 4: Extensibility for Beads Integration

**Prerequisites:** Phase 3 (API Prep) Complete
**Estimated Time:** 2-3 hours
**Priority:** MEDIUM (Required before Beads MCP integration)

---

## Overview

Phase 4 prepares the card model and UI for **integration with Beads** (distributed issue tracker for AI agents) and other external systems. This phase focuses on:

1. Extending the Card type to support external system references
2. Adding dependency visualization for blocked cards
3. Preparing for bi-directional sync with external systems

**About Beads:**
- GitHub: https://github.com/steveyegge/beads
- Lightweight memory system for coding agents
- Graph-based issue tracking with 4 dependency types
- Git-backed storage (SQLite + JSONL)
- "Ready work" detection (identifies unblocked issues)

**Use Case:**
- Display Beads issues as kanban cards
- Show dependency relationships (blocking/blocked)
- Sync status between Beads and kanban
- Agents can work on "ready" cards

---

## Task 4.1: Extend Card Type for External Systems (1 hour)

### Problem

Currently, Card type only supports internal kanban data. To integrate with external systems (Beads, GitHub, Jira, custom):
- Need to track external system ID
- Need to know sync status
- Need to store system-specific metadata
- Need to handle dependencies between cards

### Solution: Extend Card Interface

**File: `types/board.ts`**

Add new fields to Card interface:

```typescript
/**
 * Card represents a single task/item in the kanban board
 */
export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];

  // NEW: External System Integration

  /**
   * Reference to external system (Beads, GitHub, Jira, etc.)
   * Enables bi-directional sync and tracking
   */
  externalRef?: ExternalReference;

  /**
   * Dependencies on other cards
   * Used for Beads blocking relationships and task dependencies
   * Array of card IDs that this card depends on (blocks this card)
   */
  dependencies?: string[]; // Card IDs this card is blocked by

  /**
   * Cards that depend on this one
   * Automatically maintained when dependencies are set
   * Array of card IDs that depend on this card
   */
  dependents?: string[]; // Card IDs blocked by this card

  /**
   * Tags for filtering and categorization
   * Will be used in Phase 6 for filtering
   */
  tags?: string[];

  // RESERVED FOR PHASE 8 (Agent Integration):
  // assignedTo?: string;           // "human:dave" or "agent:gpt-researcher"
  // claimedBy?: string;            // Who's currently working on it
  // claimedAt?: Date;              // When claimed (for timeout detection)
  // status?: TaskStatus;           // 'available' | 'claimed' | 'in_progress' | 'blocked' | 'completed'
  // progress?: number;             // 0-1 for agent progress updates
  // agentMetadata?: Record<string, any>; // Agent-specific data
}

/**
 * ExternalReference - Link to external system
 */
export interface ExternalReference {
  /** System type */
  system: 'beads' | 'github' | 'jira' | 'linear' | 'custom';

  /** ID in external system (e.g., Beads issue ID, GitHub issue number) */
  id: string;

  /** Direct URL to issue in external system */
  url?: string;

  /** Sync status */
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';

  /** Last successful sync timestamp */
  lastSyncedAt?: Date;

  /** Error message if sync failed */
  syncError?: string;

  /** System-specific metadata */
  metadata?: Record<string, any>;
}
```

### Example Card with External Reference

```typescript
const beadsIssueCard: Card = {
  id: 'card-1699564800000-abc123',
  title: 'Implement authentication flow',
  description: 'Add OAuth 2.0 authentication with GitHub',
  columnId: 'col-in-progress',
  order: 0,
  createdAt: new Date('2024-11-09'),
  updatedAt: new Date('2024-11-10'),
  notes: [],

  // External reference to Beads issue
  externalRef: {
    system: 'beads',
    id: 'issue-abc123xyz',
    url: 'beads://project/my-app/issues/abc123xyz',
    syncStatus: 'synced',
    lastSyncedAt: new Date('2024-11-10T17:00:00Z'),
    metadata: {
      beadsStatus: 'in_progress',
      beadsProject: 'my-app',
      beadsParent: 'feature-auth',
    },
  },

  // Dependencies (this card is blocked by two others)
  dependencies: ['card-design-mockups', 'card-api-setup'],

  // Tags
  tags: ['auth', 'backend', 'high-priority'],
};
```

### Update Constants

**File: `utils/constants.ts`**

Ensure new fields are optional and default to undefined.

### Acceptance Criteria
- [ ] Card interface includes externalRef, dependencies, dependents, tags
- [ ] ExternalReference type defined
- [ ] Existing cards load without errors (fields are optional)
- [ ] Build passes TypeScript checks

---

## Task 4.2: Dependency Visualization (1-2 hours)

### Problem

When cards have dependencies (especially from Beads), users need to see:
- Which cards are blocked by others
- Which cards are blocking others
- Visual indicators in the UI

### Solution: Dependency Badges and Tooltips

**File: `components/Card.tsx`**

Add dependency indicators to card display:

```typescript
"use client";

import { Card as CardType } from "@/types/board";
import { Draggable } from "@hello-pangea/dnd";
import { memo } from "react";

interface CardProps {
  card: CardType;
  index: number;
  dependencies?: CardType[]; // Resolved dependency cards
  dependents?: CardType[];   // Resolved dependent cards
}

export const Card = memo(function Card({
  card,
  index,
  dependencies = [],
  dependents = [],
}: CardProps) {
  const isBlocked = (dependencies?.length || 0) > 0;
  const hasExternalRef = !!card.externalRef;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white rounded-lg p-4 shadow-sm border border-gray-200
            hover:shadow-md transition-shadow
            ${snapshot.isDragging ? "opacity-50" : ""}
            ${isBlocked ? "border-l-4 border-l-orange-400" : ""}
          `}
        >
          {/* Card Header with Badges */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800 flex-1">
              {card.title}
            </h3>

            {/* External Reference Badge */}
            {hasExternalRef && (
              <span
                className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700"
                title={`Linked to ${card.externalRef?.system}: ${card.externalRef?.id}`}
              >
                {getSystemIcon(card.externalRef?.system)}
              </span>
            )}
          </div>

          {/* Card Description */}
          {card.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Dependency Indicators */}
          {(isBlocked || (dependents?.length || 0) > 0) && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              {/* Blocked Badge */}
              {isBlocked && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded
                             bg-orange-50 text-orange-700"
                  title={`Blocked by ${dependencies.length} card(s):\n${dependencies
                    .map((d) => `• ${d.title}`)
                    .join("\n")}`}
                >
                  <span>🔒</span>
                  <span>Blocked by {dependencies.length}</span>
                </div>
              )}

              {/* Blocking Others Badge */}
              {(dependents?.length || 0) > 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded
                             bg-purple-50 text-purple-700"
                  title={`Blocking ${dependents.length} card(s):\n${dependents
                    .map((d) => `• ${d.title}`)
                    .join("\n")}`}
                >
                  <span>⛔</span>
                  <span>Blocks {dependents.length}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Sync Status (if external) */}
          {hasExternalRef && card.externalRef?.syncStatus !== "synced" && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              {getSyncStatusIcon(card.externalRef?.syncStatus)}
              <span>{card.externalRef?.syncStatus}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
});

function getSystemIcon(system?: string): string {
  switch (system) {
    case "beads":
      return "🔵"; // Or custom icon
    case "github":
      return "🐙";
    case "jira":
      return "🔷";
    case "linear":
      return "↗️";
    default:
      return "🔗";
  }
}

function getSyncStatusIcon(status?: string): string {
  switch (status) {
    case "synced":
      return "✅";
    case "pending":
      return "⏳";
    case "conflict":
      return "⚠️";
    case "error":
      return "❌";
    default:
      return "⚪";
  }
}
```

### Add Dependency Resolution to Board Selectors

**File: `hooks/useBoardSelectors.ts`**

Add helper to resolve dependencies:

```typescript
/**
 * Get dependencies for a card
 * Returns array of Card objects that this card depends on
 */
const getCardDependencies = useCallback(
  (cardId: string): Card[] => {
    if (!board) return [];

    const card = board.cards[cardId];
    if (!card || !card.dependencies) return [];

    return card.dependencies
      .map((depId) => board.cards[depId])
      .filter((c) => c !== undefined);
  },
  [board]
);

/**
 * Get dependents for a card
 * Returns array of Card objects that depend on this card
 */
const getCardDependents = useCallback(
  (cardId: string): Card[] => {
    if (!board) return [];

    return Object.values(board.cards).filter(
      (c) => c.dependencies?.includes(cardId)
    );
  },
  [board]
);

/**
 * Check if card is blocked (has unresolved dependencies)
 */
const isCardBlocked = useCallback(
  (cardId: string): boolean => {
    const dependencies = getCardDependencies(cardId);
    // Card is blocked if it has any dependencies not in "Done" column
    return dependencies.some((dep) => dep.columnId !== "col-done");
  },
  [getCardDependencies]
);

// Add to return:
return {
  // ... existing selectors
  getCardDependencies,
  getCardDependents,
  isCardBlocked,
};
```

### Update Column to Pass Dependencies

**File: `components/Column.tsx`**

```typescript
import { useBoard } from "@/hooks/useBoard";

export function Column({ column, onAddCard }: ColumnProps) {
  const { getCardDependencies, getCardDependents } = useBoard();

  return (
    // ... column structure
    {column.cards.map((card) => (
      <Card
        key={card.id}
        card={card}
        index={card.order}
        dependencies={getCardDependencies(card.id)}
        dependents={getCardDependents(card.id)}
      />
    ))}
    // ...
  );
}
```

### Acceptance Criteria
- [ ] Cards show "Blocked" badge when they have dependencies
- [ ] Cards show "Blocks X" badge when other cards depend on them
- [ ] Tooltip on hover shows which cards are blocking/blocked
- [ ] External system badge displays (Beads, GitHub, etc.)
- [ ] Sync status shows when not "synced"
- [ ] Tags display below card content
- [ ] Visual distinction for blocked cards (orange left border)

---

## Task 4.3: Beads Data Source Skeleton (30 min - 1 hour)

### Purpose

Create a skeleton BeadsDataSource to show integration pattern. Full implementation will happen when Beads MCP is installed and configured.

**File: `lib/datasources/beads.ts`**

```typescript
import { Board, Card, Column } from '@/types/board';
import { DataSource, BoardSummary } from '@/types/datasource';
import { generateId } from '@/utils/ids';

/**
 * Beads implementation of DataSource
 *
 * Integrates with Beads issue tracker (https://github.com/steveyegge/beads)
 * Converts Beads issues to kanban cards, respecting dependencies.
 *
 * NOTE: Requires Beads MCP server to be installed and configured.
 * This is a skeleton - full implementation in Phase 8.
 */
export class BeadsDataSource implements DataSource {
  id: string;
  name: string;
  type = 'beads' as const;

  private projectPath: string;

  constructor(projectPath: string, name?: string) {
    this.projectPath = projectPath;
    this.id = `beads-${projectPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
    this.name = name || `Beads (${projectPath})`;
  }

  async loadBoard(boardId: string): Promise<Board> {
    // TODO: Call Beads MCP to fetch issues
    // bd ready --json or bd list --json

    throw new Error('Beads integration not yet implemented. Install Beads MCP and complete Phase 8.');

    // Future implementation sketch:
    /*
    const issues = await this.fetchBeadsIssues();

    // Convert Beads issues to cards
    const cards: Record<string, Card> = {};
    issues.forEach(issue => {
      cards[issue.id] = this.beadsIssueToCard(issue);
    });

    // Create columns based on Beads status
    const columns: Record<string, Column> = {
      'col-ready': { id: 'col-ready', title: 'Ready', order: 0 },
      'col-in-progress': { id: 'col-in-progress', title: 'In Progress', order: 1 },
      'col-blocked': { id: 'col-blocked', title: 'Blocked', order: 2 },
      'col-done': { id: 'col-done', title: 'Done', order: 3 },
    };

    return {
      id: boardId,
      cards,
      columns,
      columnOrder: ['col-ready', 'col-in-progress', 'col-blocked', 'col-done'],
      metadata: {
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: `Beads: ${this.projectPath}`,
      },
      dataSourceId: this.id,
      externalId: this.projectPath,
    };
    */
  }

  async saveBoard(board: Board): Promise<void> {
    // TODO: Sync card changes back to Beads
    // bd update <issue-id> --status <status>

    throw new Error('Beads sync not yet implemented.');

    // Future implementation:
    /*
    for (const card of Object.values(board.cards)) {
      if (card.externalRef?.system === 'beads') {
        await this.syncCardToBeads(card);
      }
    }
    */
  }

  async listBoards(): Promise<BoardSummary[]> {
    // TODO: List Beads projects
    return [];
  }

  /**
   * Convert Beads issue to Card
   * Maps Beads fields to card structure
   */
  private beadsIssueToCard(beadsIssue: any): Card {
    return {
      id: `card-beads-${beadsIssue.id}`,
      title: beadsIssue.title,
      description: beadsIssue.description,
      columnId: this.mapBeadsStatusToColumn(beadsIssue.status),
      order: 0, // Will be calculated
      createdAt: new Date(beadsIssue.created_at),
      updatedAt: new Date(beadsIssue.updated_at),
      notes: [],

      // External reference
      externalRef: {
        system: 'beads',
        id: beadsIssue.id,
        url: `beads://${this.projectPath}/issues/${beadsIssue.id}`,
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        metadata: {
          beadsStatus: beadsIssue.status,
          beadsProject: this.projectPath,
        },
      },

      // Dependencies (Beads "blocks" relationships)
      dependencies: beadsIssue.blocks || [],
      tags: beadsIssue.tags || [],
    };
  }

  private mapBeadsStatusToColumn(status: string): string {
    switch (status) {
      case 'open':
        return 'col-ready';
      case 'in_progress':
        return 'col-in-progress';
      case 'blocked':
        return 'col-blocked';
      case 'closed':
        return 'col-done';
      default:
        return 'col-ready';
    }
  }
}
```

### Acceptance Criteria
- [ ] BeadsDataSource class exists with skeleton methods
- [ ] Clear TODO comments for Phase 8 implementation
- [ ] Type-safe integration with DataSource interface
- [ ] Helper methods for Beads → Card conversion (stubbed)

---

## Testing Plan

### Manual Testing Checklist
- [ ] Create card with external reference manually (edit localStorage)
- [ ] Card displays external system badge
- [ ] Add dependencies to card (edit localStorage)
- [ ] Card shows "Blocked by N" badge
- [ ] Hover over badge shows dependency list
- [ ] Create card that blocks others
- [ ] Card shows "Blocks N" badge
- [ ] Add tags to card
- [ ] Tags display below card content
- [ ] Set sync status to "pending" or "error"
- [ ] Sync status indicator appears

### Example Test Data

Add to localStorage for testing:

```json
{
  "id": "card-test-blocked",
  "title": "Implement payment gateway",
  "description": "Integrate Stripe for payments",
  "columnId": "col-todo",
  "order": 0,
  "createdAt": "2024-11-10T00:00:00Z",
  "updatedAt": "2024-11-10T18:00:00Z",
  "notes": [],
  "externalRef": {
    "system": "beads",
    "id": "issue-payment-123",
    "url": "beads://my-project/issues/payment-123",
    "syncStatus": "synced",
    "lastSyncedAt": "2024-11-10T17:00:00Z"
  },
  "dependencies": ["card-api-setup", "card-auth-complete"],
  "tags": ["backend", "payment", "high-priority"]
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `types/board.ts` | MODIFY | Add ExternalReference type, extend Card |
| `components/Card.tsx` | MODIFY | Add dependency badges, external ref indicators |
| `hooks/useBoardSelectors.ts` | MODIFY | Add dependency resolution helpers |
| `components/Column.tsx` | MODIFY | Pass dependencies to Card |
| `lib/datasources/beads.ts` | CREATE | Beads integration skeleton |

---

## Success Criteria

Phase 4 is complete when:
- ✅ Card type supports external references
- ✅ Dependency visualization works (badges, tooltips)
- ✅ External system badges display
- ✅ Sync status indicators show
- ✅ Tags render properly
- ✅ BeadsDataSource skeleton exists
- ✅ Build passes TypeScript checks
- ✅ Ready for Beads MCP integration (Phase 8)

---

## Future: Phase 8 - Full Beads Integration

When you're ready to actually connect to Beads:

1. Install Beads MCP in VS Code
2. Configure Beads project path
3. Implement BeadsDataSource methods:
   - `fetchBeadsIssues()` via MCP
   - `syncCardToBeads()` for bi-directional sync
4. Add "Sync with Beads" button
5. Real-time updates via Beads file watching

But that's for later. Phase 4 just prepares the data model and UI.
