# Agwakwagan - Architecture Design: Agent Integration

**Project:** Agwakwagan Kanban Board  
**Document Type:** Architecture Design - Part 2  
**Version:** 1.1  
**Created:** November 5, 2025  
**Status:** Future Planning

---

## Document Purpose

This document extends the core Architecture Design with specifications for agent/API integration. This is **future functionality** (Phase 7-8, post-MVP) but architectural decisions are made now to avoid breaking changes later.

**Read Core Architecture First:** [Agwakwagan-Architecture-Design.md](./Agwakwagan-Architecture-Design.md)

---

## 8. Agent Integration Strategy

### 8.1 Vision: Agent Task Clearinghouse

**Goal:** Enable AI agents to claim, execute, and complete tasks from the kanban board programmatically.

**Use Case Example:**
```
1. Human adds card to "Research Queue" column
2. Agent polls API, sees available task
3. Agent claims task (moves to "Agent Working")
4. Agent completes research, updates card with findings
5. Agent moves card to "Review" column
6. Human reviews and approves
```

**Key Principles:**
- **API-first:** All board operations available via REST
- **Stateless:** Agents don't hold board state
- **Claim-based:** Explicit task claiming prevents conflicts
- **Timeout-safe:** Stale claims auto-release after 30min
- **Auditable:** All agent actions logged

---

### 8.2 Architecture Changes Required Now (Phase 0)

These changes must be made during initial development to avoid breaking changes later.

#### Change 1: Add Board ID to Data Model

**Current Problem:** Single board has no identifier  
**Future Need:** Multi-board support, API scoping, agent permissions

**Modify `Board` interface:**
```typescript
interface Board {
  id: string;  // ADD THIS - Required for API routing
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
  metadata: BoardMetadata;
}
```

**Update DEFAULT_BOARD:**
```typescript
// utils/constants.ts
export const DEFAULT_BOARD: Board = {
  id: 'board-default',  // NEW
  cards: {},
  columns: { /* ... */ },
  columnOrder: ['col-todo', 'col-progress', 'col-done'],
  metadata: { /* ... */ }
};
```

**Add Board ID Generator:**
```typescript
// utils/ids.ts
export function generateBoardId(): string {
  return generateId('board');
}
```

**Why Critical:**
- Agents need board scope: "Agent X can access board Y"
- API routes structured as `/api/boards/:boardId/...`
- Enables future multi-board support
- Breaking change if added later (all storage keys change)

---

#### Change 2: Create Storage Adapter Interface

**Current Problem:** Direct coupling to localStorage  
**Future Need:** Swap storage backend (localStorage → API client)

**Create `hooks/useStorageAdapter.ts`:**
```typescript
export interface StorageAdapter {
  loadBoard(boardId: string): Promise<Board>;
  saveBoard(board: Board): Promise<void>;
  subscribeToChanges?(callback: (board: Board) => void): () => void;
}

// LocalStorage implementation (Phase 0-6)
export function useLocalStorageAdapter(): StorageAdapter {
  return {
    loadBoard: async (boardId: string) => {
      try {
        const key = `agwakwagan-${boardId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : { ...DEFAULT_BOARD, id: boardId };
      } catch (error) {
        console.error('Error loading board:', error);
        return { ...DEFAULT_BOARD, id: boardId };
      }
    },
    
    saveBoard: async (board: Board) => {
      try {
        const key = `agwakwagan-${board.id}`;
        localStorage.setItem(key, JSON.stringify(board));
      } catch (error) {
        console.error('Error saving board:', error);
        throw error;
      }
    }
  };
}

// API client implementation (Phase 7+)
export function useApiStorageAdapter(apiKey: string): StorageAdapter {
  return {
    loadBoard: async (boardId: string) => {
      const response = await fetch(`/api/boards/${boardId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.json();
    },
    
    saveBoard: async (board: Board) => {
      await fetch(`/api/boards/${board.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(board)
      });
    },
    
    subscribeToChanges: (callback) => {
      // WebSocket or polling implementation
      const eventSource = new EventSource(`/api/boards/${board.id}/stream`);
      eventSource.onmessage = (e) => callback(JSON.parse(e.data));
      return () => eventSource.close();
    }
  };
}
```

**Update `useBoardState` to use adapter:**
```typescript
// hooks/useBoardState.ts
export function useBoardState(boardId: string = 'board-default') {
  const adapter = useLocalStorageAdapter(); // Swap this in Phase 7
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    adapter.loadBoard(boardId).then(b => {
      setBoard(b);
      setIsLoaded(true);
    });
  }, [boardId]);

  const saveBoard = useCallback((newBoard: Board) => {
    setBoard(newBoard);
    adapter.saveBoard(newBoard);
  }, [adapter]);

  return { board, setBoard: saveBoard, isLoaded };
}
```

**Why Critical:**
- Decouples storage from business logic
- Enables API backend without rewriting hooks
- Testable (mock adapter for tests)
- Single place to switch modes (local vs API)

---

#### Change 3: Reserve Agent-Related Fields

**Don't implement yet, but document as reserved:**

```typescript
interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];
  
  // RESERVED FOR FUTURE (Phase 8) - Don't use these names
  // assignedTo?: string;      // "human:dave" or "agent:gpt-researcher"
  // claimedBy?: string;        // Who's currently working on it
  // claimedAt?: Date;          // When claimed (for timeout detection)
  // status?: TaskStatus;       // 'available' | 'claimed' | 'in_progress' | 'blocked'
  // agentMetadata?: Record<string, any>; // Agent-specific data
}

// Future type (Phase 8)
// type TaskStatus = 'available' | 'claimed' | 'in_progress' | 'blocked' | 'completed';
```

**Add comment in `types/board.ts`:**
```typescript
/**
 * RESERVED FIELDS FOR FUTURE AGENT INTEGRATION (Phase 8):
 * Do not use these field names for other purposes:
 * - assignedTo, claimedBy, claimedAt, status, agentMetadata
 */
```

---

### 8.3 Future API Design (Phase 7)

This is **not implemented now**, but designing upfront ensures data model supports it.

#### REST Endpoints

**Board Operations:**
```typescript
GET    /api/boards/:boardId
  → Returns full board state

PUT    /api/boards/:boardId
  → Update entire board (used by UI)

POST   /api/boards
  → Create new board
```

**Card Operations:**
```typescript
GET    /api/boards/:boardId/cards
  → List all cards (with optional filters)

GET    /api/boards/:boardId/cards/:cardId
  → Get single card

POST   /api/boards/:boardId/cards
  → Create card (used by UI and agents)

PATCH  /api/boards/:boardId/cards/:cardId
  → Update card fields (partial update)

DELETE /api/boards/:boardId/cards/:cardId
  → Delete card
```

**Agent-Specific Operations (Phase 8):**
```typescript
POST   /api/boards/:boardId/tasks/claim
  Body: { columnId: "agent-queue" }
  → Returns next available card from specified column
  → Sets claimedBy, claimedAt
  → Optionally moves to "In Progress" column

POST   /api/boards/:boardId/cards/:cardId/complete
  Body: { targetColumnId: "done", notes: "..." }
  → Mark task complete
  → Move to specified column
  → Clear claimedBy
  → Add completion metadata

POST   /api/boards/:boardId/cards/:cardId/release
  → Agent abandons task
  → Move back to original column
  → Clear claimedBy

POST   /api/boards/:boardId/cards/:cardId/update-progress
  Body: { progress: 0.5, message: "Halfway done..." }
  → Update task progress (doesn't move card)
```

#### Example Agent Workflow

```typescript
// Agent code (pseudo-code)
const API_KEY = process.env.AGENT_API_KEY;
const BOARD_ID = 'board-research-tasks';

// 1. Claim next task
const task = await fetch(`/api/boards/${BOARD_ID}/tasks/claim`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}` },
  body: JSON.stringify({ columnId: 'research-queue' })
}).then(r => r.json());

if (!task) {
  console.log('No tasks available');
  return;
}

console.log(`Claimed task: ${task.id} - ${task.title}`);

// 2. Do the work
const results = await doResearch(task.title);

// 3. Update with progress
await fetch(`/api/boards/${BOARD_ID}/cards/${task.id}/update-progress`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}` },
  body: JSON.stringify({
    progress: 1.0,
    message: 'Research complete'
  })
});

// 4. Complete task
await fetch(`/api/boards/${BOARD_ID}/cards/${task.id}/complete`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}` },
  body: JSON.stringify({
    targetColumnId: 'review',
    notes: JSON.stringify(results)
  })
});

console.log('Task completed and moved to review');
```

---

### 8.4 Authentication & Authorization (Phase 7)

**API Key Based Auth:**

```typescript
// API key format
{
  key: "agw_live_abc123def456",
  agentId: "gpt-researcher-01",
  permissions: ["board:read", "card:claim", "card:update"],
  boardAccess: ["board-research-tasks", "board-dev-tasks"],
  rateLimit: 100 // requests per minute
}
```

**Middleware (Next.js API route):**
```typescript
// middleware/auth.ts
export async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing API key', status: 401 };
  }

  const apiKey = authHeader.substring(7);
  const keyData = await validateApiKey(apiKey); // Check against database
  
  if (!keyData) {
    return { error: 'Invalid API key', status: 401 };
  }

  // Check board access
  const boardId = req.url.match(/\/boards\/([^\/]+)/)?.[1];
  if (boardId && !keyData.boardAccess.includes(boardId)) {
    return { error: 'No access to this board', status: 403 };
  }

  return { agentId: keyData.agentId, permissions: keyData.permissions };
}
```

---

### 8.5 Task Claiming Protocol (Phase 8)

**Problem:** Multiple agents might try to claim same task  
**Solution:** Atomic claim operation with timeout

**Claim Logic:**
```typescript
// API endpoint: POST /api/boards/:boardId/tasks/claim
export async function claimTask(boardId: string, columnId: string, agentId: string) {
  const board = await loadBoard(boardId);
  
  // Find first available card in column
  const availableCard = Object.values(board.cards)
    .filter(card => 
      card.columnId === columnId &&
      (!card.claimedBy || isClaimStale(card))
    )
    .sort((a, b) => a.order - b.order)[0];

  if (!availableCard) {
    return null; // No tasks available
  }

  // Atomically claim it
  availableCard.claimedBy = agentId;
  availableCard.claimedAt = new Date();
  availableCard.status = 'claimed';

  await saveBoard(board);
  
  return availableCard;
}

function isClaimStale(card: Card): boolean {
  if (!card.claimedAt) return true;
  const ageMinutes = (Date.now() - card.claimedAt.getTime()) / 60000;
  return ageMinutes > 30; // 30 minute timeout
}
```

**Stale Claim Cleanup (Background job):**
```typescript
// Runs every 5 minutes
async function releaseStaleClaimsexport() {
  const boards = await loadAllBoards();
  
  for (const board of boards) {
    const staleClaims = Object.values(board.cards).filter(isClaimStale);
    
    for (const card of staleClaims) {
      card.claimedBy = undefined;
      card.claimedAt = undefined;
      card.status = 'available';
      
      // Optionally move back to original column
      // or add note about timeout
    }
    
    if (staleClaims.length > 0) {
      await saveBoard(board);
    }
  }
}
```

---

### 8.6 UI Changes for Agent Visibility (Phase 8)

**Show agent activity in UI:**

```typescript
// Card component additions
interface CardProps {
  card: Card;
  // ... existing props
}

function Card({ card }: CardProps) {
  const isClaimedByAgent = card.claimedBy?.startsWith('agent:');
  
  return (
    <div className={`card ${isClaimedByAgent ? 'claimed-by-agent' : ''}`}>
      <h3>{card.title}</h3>
      
      {isClaimedByAgent && (
        <div className="agent-badge">
          🤖 {card.claimedBy.replace('agent:', '')}
          <span className="claim-time">
            {formatRelative(card.claimedAt)}
          </span>
        </div>
      )}
      
      {card.status === 'in_progress' && (
        <div className="progress-bar">
          <div style={{ width: `${card.progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}
```

**Agent-specific columns:**
```typescript
// Suggested column setup for agent workflow
const AGENT_COLUMNS = [
  { id: 'agent-queue', title: '🤖 Agent Queue', order: 0 },
  { id: 'agent-working', title: '⚙️ Agent Working', order: 1 },
  { id: 'agent-review', title: '👁️ Human Review', order: 2 },
  { id: 'done', title: '✅ Done', order: 3 }
];
```

---

### 8.7 Data Migration Strategy

**Phase 0-6 (MVP):** No board ID in storage
**Phase 7+:** Board ID required

**Migration on first API access:**
```typescript
// Check if board needs migration
function migrateToV1_1(boardData: any): Board {
  // Old format: no board ID
  if (!boardData.id) {
    return {
      id: 'board-default', // Assign default ID
      ...boardData
    };
  }
  
  return boardData;
}
```

**No data loss:** Old localStorage data automatically migrates on load.

---

### 8.8 Decision Points

#### Question 1: Shared Board or Separate Boards?

**Option A: Shared Board (Recommended)**
- Humans and agents work on same board
- Agent-specific columns (Queue, Working, Review)
- Easier coordination
- Simpler architecture

**Option B: Separate Boards**
- "Personal Board" vs "Agent Board"
- Cleaner separation
- More complex sync
- Harder to see full picture

**Recommendation:** Option A for Phase 7-8. Can add Option B later if needed.

---

#### Question 2: Real-time Sync or Polling?

**Option A: WebSocket/Server-Sent Events**
- Real-time updates when agents modify cards
- More complex infrastructure
- Requires backend process

**Option B: Polling**
- Agents check API every 30-60 seconds
- Simple HTTP requests
- Good enough for task clearinghouse

**Recommendation:** Option B (polling) for Phase 7-8. Agents poll, humans see updates on refresh. Can add real-time later.

---

#### Question 3: Where to Run Agents?

**Option A: External (Recommended)**
- Agents run on your machine/server
- Call Agwakwagan API over network
- More flexible (agents in any language)

**Option B: Embedded**
- Agents run inside Agwakwagan
- Tighter integration
- Limited to JavaScript

**Recommendation:** Option A. Agents are separate processes that call your API.

---

### 8.9 Security Considerations

**API Key Management:**
- Store keys in database (hashed)
- Rotate keys periodically
- Scope keys to specific boards
- Rate limiting per key

**Authorization Levels:**
```typescript
type Permission = 
  | 'board:read'        // View board
  | 'board:write'       // Modify board structure
  | 'card:read'         // View cards
  | 'card:create'       // Create cards
  | 'card:update'       // Modify cards
  | 'card:delete'       // Delete cards
  | 'task:claim'        // Claim tasks
  | 'task:complete';    // Complete tasks

// Agent typical permissions
const AGENT_PERMISSIONS: Permission[] = [
  'board:read',
  'card:read',
  'card:update',
  'task:claim',
  'task:complete'
];

// Human API key (full access)
const HUMAN_PERMISSIONS: Permission[] = [
  'board:read', 'board:write',
  'card:read', 'card:create', 'card:update', 'card:delete',
  'task:claim', 'task:complete'
];
```

**Audit Logging:**
```typescript
interface AuditLog {
  timestamp: Date;
  agentId: string;
  action: string;
  boardId: string;
  cardId?: string;
  success: boolean;
  errorMessage?: string;
}

// Log every agent action
async function logAction(log: AuditLog) {
  await db.auditLogs.insert(log);
}
```

---

### 8.10 Implementation Timeline

**Phase 7: API Foundation** (12-16 hours, post-MVP)
- Create Next.js API routes structure
- Implement board CRUD endpoints
- Implement card CRUD endpoints
- Add API key authentication
- Add rate limiting middleware
- Create API client library (for agents)
- Write API documentation

**Phase 8: Agent Task Protocol** (8-12 hours, after Phase 7)
- Extend Card type with agent fields
- Implement task claiming endpoint
- Implement task completion endpoint
- Add claim timeout/release logic
- Create agent-specific UI indicators
- Add audit logging
- Write agent integration guide
- Create example agent code

**Total:** ~20-28 hours for full agent integration

---

### 8.11 Success Criteria

**Phase 7 Complete When:**
- ✅ Can create/read/update/delete boards via API
- ✅ Can create/read/update/delete cards via API
- ✅ API key authentication works
- ✅ Rate limiting prevents abuse
- ✅ API documentation complete

**Phase 8 Complete When:**
- ✅ Agent can claim task via API
- ✅ Agent can update task progress
- ✅ Agent can complete task
- ✅ Stale claims automatically released
- ✅ UI shows agent activity
- ✅ Example agent runs successfully
- ✅ No conflicts when multiple agents claim

---

### 8.12 Testing Strategy

**API Tests:**
```typescript
describe('Task Claiming API', () => {
  it('should claim first available task', async () => {
    const task = await claimTask('board-1', 'queue', 'agent-1');
    expect(task).toBeDefined();
    expect(task.claimedBy).toBe('agent-1');
  });

  it('should not claim already claimed task', async () => {
    await claimTask('board-1', 'queue', 'agent-1');
    const task2 = await claimTask('board-1', 'queue', 'agent-2');
    expect(task2.id).not.toBe(task1.id); // Gets different task
  });

  it('should release stale claim after 30 minutes', async () => {
    const task = await claimTask('board-1', 'queue', 'agent-1');
    
    // Advance time 31 minutes
    jest.advanceTimersByTime(31 * 60 * 1000);
    
    const task2 = await claimTask('board-1', 'queue', 'agent-2');
    expect(task2.id).toBe(task.id); // Same task, now available
  });
});
```

---

## Summary: Changes Needed Now vs Later

### ✅ Implement in Phase 0 (NOW)

1. **Add `board.id` field** to Board interface
2. **Create Storage Adapter interface** and useLocalStorageAdapter
3. **Update useBoardState** to use adapter
4. **Reserve agent field names** in types (document, don't implement)
5. **Update DEFAULT_BOARD** with ID

**Impact:** ~30 minutes of additional work in Phase 0  
**Benefit:** No breaking changes later, clean migration path

---

### 📋 Implement in Phase 7-8 (LATER)

1. Next.js API routes
2. API authentication
3. Task claiming protocol
4. Agent UI indicators
5. Agent documentation

**Impact:** ~20-28 hours post-MVP  
**Benefit:** Agents can interact with your kanban programmatically

---

**End of Agent Integration Architecture**

This ensures your current architecture supports future agent integration without requiring rewrites.
