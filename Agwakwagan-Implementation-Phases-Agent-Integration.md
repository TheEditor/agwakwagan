# Agwakwagan - Implementation Phases: Agent Integration

**Project:** Agwakwagan Kanban Board  
**Document Type:** Implementation Roadmap - Part 2  
**Version:** 1.1  
**Created:** November 5, 2025  
**Status:** Future Planning (Post-MVP)

---

## Document Purpose

This document extends the core Implementation Phases with **Phase 7-8: Agent Integration**. These are post-MVP phases that add API and agent task protocol capabilities.

**Read Core Implementation Phases First:** [Agwakwagan-Implementation-Phases.md](./Agwakwagan-Implementation-Phases.md)

**See Also:** [Agwakwagan-Architecture-Design-Agent-Integration.md](./Agwakwagan-Architecture-Design-Agent-Integration.md)

---

## Phase 7: API Foundation (Post-MVP)

**Goal:** REST API for programmatic board access  
**Duration:** 12-16 hours  
**Prerequisites:** Phase 4 MVP complete (can skip Phases 5-6)  
**Status:** NOT STARTED

### Overview

Create Next.js API routes to enable external agents/services to interact with boards programmatically. This phase focuses on basic CRUD operations and authentication.

### Tasks

#### 7.1 Setup API Route Structure
**Estimated Time:** 30 minutes

Create Next.js API route files:
```bash
app/api/
├── boards/
│   ├── route.ts                    # List/create boards
│   └── [boardId]/
│       ├── route.ts                # Get/update/delete board
│       └── cards/
│           ├── route.ts            # List/create cards
│           └── [cardId]/
│               └── route.ts        # Get/update/delete card
```

#### 7.2 Implement Board CRUD Endpoints
**Estimated Time:** 2-3 hours

```typescript
// app/api/boards/[boardId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/middleware/auth';
import { loadBoard, saveBoard } from '@/lib/boardStorage';

export async function GET(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  try {
    const board = await loadBoard(params.boardId);
    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { error: 'Board not found' },
      { status: 404 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  try {
    const board = await req.json();
    
    // Validate board structure
    if (!board.id || board.id !== params.boardId) {
      return NextResponse.json(
        { error: 'Invalid board data' },
        { status: 400 }
      );
    }

    await saveBoard(board);
    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  try {
    await deleteBoard(params.boardId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
```

#### 7.3 Implement Card CRUD Endpoints
**Estimated Time:** 2-3 hours

```typescript
// app/api/boards/[boardId]/cards/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  const board = await loadBoard(params.boardId);
  const cards = Object.values(board.cards);
  
  // Optional filtering
  const columnId = req.nextUrl.searchParams.get('columnId');
  const filtered = columnId
    ? cards.filter(c => c.columnId === columnId)
    : cards;
  
  return NextResponse.json(filtered);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  const cardData = await req.json();
  const board = await loadBoard(params.boardId);
  
  // Validate columnId exists
  if (!board.columns[cardData.columnId]) {
    return NextResponse.json(
      { error: 'Invalid columnId' },
      { status: 400 }
    );
  }

  // Create card with generated ID
  const newCard: Card = {
    id: generateId('card'),
    title: cardData.title,
    description: cardData.description,
    columnId: cardData.columnId,
    order: getNextOrder(board.cards, cardData.columnId),
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: []
  };

  board.cards[newCard.id] = newCard;
  await saveBoard(board);
  
  return NextResponse.json(newCard, { status: 201 });
}

// Similar for PATCH and DELETE on individual cards
```

#### 7.4 Create API Key Authentication
**Estimated Time:** 1-2 hours

```typescript
// middleware/auth.ts
interface AuthResult {
  agentId: string;
  permissions: string[];
}

interface AuthError {
  error: string;
  status: number;
}

export async function authenticateApiKey(
  req: NextRequest
): Promise<AuthResult | AuthError> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing API key', status: 401 };
  }

  const apiKey = authHeader.substring(7);
  
  // Phase 7: Simple validation against environment variables
  // Later: Database-backed key management with permissions
  const validKeys = (process.env.API_KEYS || '').split(',');
  
  if (!validKeys.includes(apiKey)) {
    return { error: 'Invalid API key', status: 401 };
  }

  // Check board access if applicable
  const url = new URL(req.url);
  const boardId = url.pathname.match(/\/boards\/([^\/]+)/)?.[1];
  
  if (boardId) {
    // For Phase 7: All valid keys have access to all boards
    // Later: Check key permissions for specific board
  }

  return {
    agentId: `agent-${apiKey.substring(0, 8)}`,
    permissions: ['*']
  };
}
```

Add to `.env.local`:
```bash
API_KEYS=your-secret-key-1,your-secret-key-2
```

#### 7.5 Add Rate Limiting
**Estimated Time:** 1-2 hours

```typescript
// middleware/rateLimit.ts
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const requests = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  apiKey: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = requests.get(apiKey);
  
  // No record or window expired - reset
  if (!record || record.resetAt < now) {
    const resetAt = now + windowMs;
    requests.set(apiKey, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  
  // Check limit
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  // Increment
  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.resetAt
  };
}

// Use in API routes:
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status });

  const rateLimit = checkRateLimit(auth.agentId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'X-RateLimit-Reset': String(rateLimit.resetAt) } }
    );
  }

  // ... rest of handler
}
```

#### 7.6 Create Board Storage Abstraction
**Estimated Time:** 2 hours

```typescript
// lib/boardStorage.ts
import { Board } from '@/types/board';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'boards');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory exists
  }
}

export async function loadBoard(boardId: string): Promise<Board> {
  await ensureDataDir();
  
  const filePath = path.join(DATA_DIR, `${boardId}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const board = JSON.parse(data);
    
    // Convert date strings back to Date objects
    board.metadata.createdAt = new Date(board.metadata.createdAt);
    board.metadata.updatedAt = new Date(board.metadata.updatedAt);
    
    Object.values(board.cards).forEach((card: any) => {
      card.createdAt = new Date(card.createdAt);
      card.updatedAt = new Date(card.updatedAt);
      card.notes.forEach((note: any) => {
        note.createdAt = new Date(note.createdAt);
      });
    });
    
    return board;
  } catch (error) {
    throw new Error(`Board ${boardId} not found`);
  }
}

export async function saveBoard(board: Board): Promise<void> {
  await ensureDataDir();
  
  const filePath = path.join(DATA_DIR, `${board.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(board, null, 2));
}

export async function deleteBoard(boardId: string): Promise<void> {
  const filePath = path.join(DATA_DIR, `${boardId}.json`);
  await fs.unlink(filePath);
}

export async function getAllBoardIds(): Promise<string[]> {
  await ensureDataDir();
  
  const files = await fs.readdir(DATA_DIR);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}
```

Add to `.gitignore`:
```
/data/boards/*.json
```

#### 7.7 Create API Client Library
**Estimated Time:** 2-3 hours

```typescript
// lib/apiClient.ts
import { Board, Card } from '@/types/board';

export class AgwakwaganClient {
  constructor(
    private apiKey: string,
    private baseUrl: string = 'http://localhost:3000/api'
  ) {}

  private async request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Board operations
  async getBoard(boardId: string): Promise<Board> {
    return this.request(`/boards/${boardId}`);
  }

  async updateBoard(board: Board): Promise<Board> {
    return this.request(`/boards/${board.id}`, {
      method: 'PUT',
      body: JSON.stringify(board)
    });
  }

  async deleteBoard(boardId: string): Promise<void> {
    await this.request(`/boards/${boardId}`, { method: 'DELETE' });
  }

  // Card operations
  async getCards(boardId: string, columnId?: string): Promise<Card[]> {
    const query = columnId ? `?columnId=${columnId}` : '';
    return this.request(`/boards/${boardId}/cards${query}`);
  }

  async getCard(boardId: string, cardId: string): Promise<Card> {
    return this.request(`/boards/${boardId}/cards/${cardId}`);
  }

  async createCard(
    boardId: string,
    card: Pick<Card, 'title' | 'description' | 'columnId'>
  ): Promise<Card> {
    return this.request(`/boards/${boardId}/cards`, {
      method: 'POST',
      body: JSON.stringify(card)
    });
  }

  async updateCard(boardId: string, card: Card): Promise<Card> {
    return this.request(`/boards/${boardId}/cards/${card.id}`, {
      method: 'PATCH',
      body: JSON.stringify(card)
    });
  }

  async deleteCard(boardId: string, cardId: string): Promise<void> {
    await this.request(`/boards/${boardId}/cards/${cardId}`, {
      method: 'DELETE'
    });
  }
}

// Example usage
const client = new AgwakwaganClient(process.env.API_KEY!);
const board = await client.getBoard('board-default');
const cards = await client.getCards('board-default', 'col-todo');
```

#### 7.8 Write API Documentation
**Estimated Time:** 2-3 hours

Create `docs/API.md`:
```markdown
# Agwakwagan API Documentation

## Authentication

All API requests require an API key in the Authorization header:

\`\`\`
Authorization: Bearer your-api-key-here
\`\`\`

## Rate Limiting

- 100 requests per minute per API key
- Returns 429 status when exceeded
- X-RateLimit-Reset header indicates reset time

## Endpoints

### Get Board
\`\`\`
GET /api/boards/:boardId
\`\`\`

Returns complete board state.

**Response:**
\`\`\`json
{
  "id": "board-abc123",
  "cards": { ... },
  "columns": { ... },
  "columnOrder": [...],
  "metadata": { ... }
}
\`\`\`

[... continue with all endpoints ...]
```

### Acceptance Criteria
- [ ] All CRUD endpoints work for boards
- [ ] All CRUD endpoints work for cards
- [ ] API key authentication blocks unauthorized requests
- [ ] Rate limiting prevents abuse (>100 req/min)
- [ ] Storage abstraction works (filesystem)
- [ ] API client library works
- [ ] Documentation complete with examples

### Definition of Done
- [ ] API tested with Postman/curl
- [ ] Example requests in documentation
- [ ] Error handling for all edge cases
- [ ] Rate limiting tested and enforced
- [ ] API client tested programmatically
- [ ] Can manage board entirely through API

---

## Phase 8: Agent Task Protocol (Post-MVP)

**Goal:** Task claiming and agent-specific workflow  
**Duration:** 8-12 hours  
**Prerequisites:** Phase 7 complete  
**Status:** NOT STARTED

### Overview

Extend the API with agent-specific operations: task claiming, progress updates, and completion. Add UI indicators for agent activity.

### Tasks

#### 8.1 Extend Card Type with Agent Fields
**Estimated Time:** 30 minutes

```typescript
// types/board.ts - Update Card interface
export interface Card {
  // ... existing fields
  
  // Agent fields (Phase 8)
  assignedTo?: string;           // "human:dave" or "agent:gpt-researcher"
  claimedBy?: string;             // Who's currently working on it
  claimedAt?: Date;               // When claimed (for timeout detection)
  status?: TaskStatus;            // Task lifecycle status
  progress?: number;              // 0-1 for agent progress updates
  agentMetadata?: Record<string, any>; // Agent-specific data
}

export type TaskStatus = 
  | 'available'
  | 'claimed'
  | 'in_progress'
  | 'blocked'
  | 'completed';
```

Update DEFAULT_BOARD and ensure backwards compatibility.

#### 8.2 Implement Task Claiming Endpoint
**Estimated Time:** 2-3 hours

```typescript
// app/api/boards/[boardId]/tasks/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/middleware/auth';
import { loadBoard, saveBoard } from '@/lib/boardStorage';
import { Card } from '@/types/board';

function isClaimStale(card: Card): boolean {
  if (!card.claimedAt) return true;
  const ageMinutes = (Date.now() - new Date(card.claimedAt).getTime()) / 60000;
  return ageMinutes > 30; // 30 minute timeout
}

export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  try {
    const { columnId, filter } = await req.json();
    const board = await loadBoard(params.boardId);
    
    // Find first available card in specified column
    const cards = Object.values(board.cards)
      .filter(card => 
        card.columnId === columnId &&
        (!card.claimedBy || isClaimStale(card)) &&
        (card.status === 'available' || !card.status)
      )
      .sort((a, b) => a.order - b.order);

    // Apply optional filters (e.g., by tags)
    let availableCard = cards[0];
    if (filter?.tags && availableCard) {
      availableCard = cards.find(c => 
        filter.tags.some((t: string) => c.tags?.includes(t))
      ) || availableCard;
    }

    if (!availableCard) {
      return NextResponse.json(
        { message: 'No tasks available' },
        { status: 404 }
      );
    }

    // Atomically claim it
    availableCard.claimedBy = auth.agentId;
    availableCard.claimedAt = new Date();
    availableCard.status = 'claimed';

    board.metadata.updatedAt = new Date();
    await saveBoard(board);
    
    return NextResponse.json(availableCard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to claim task' },
      { status: 500 }
    );
  }
}
```

#### 8.3 Implement Progress Update Endpoint
**Estimated Time:** 1-2 hours

```typescript
// app/api/boards/[boardId]/cards/[cardId]/progress/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string; cardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  try {
    const { progress, message } = await req.json();
    const board = await loadBoard(params.boardId);
    const card = board.cards[params.cardId];

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Only agent who claimed can update progress
    if (card.claimedBy !== auth.agentId) {
      return NextResponse.json(
        { error: 'Not authorized to update this card' },
        { status: 403 }
      );
    }

    // Update progress
    card.progress = Math.max(0, Math.min(1, progress));
    card.status = 'in_progress';
    card.updatedAt = new Date();
    
    // Add progress note if message provided
    if (message) {
      card.notes.push({
        id: generateId('note'),
        text: `[${auth.agentId}] ${message}`,
        createdAt: new Date()
      });
    }

    board.metadata.updatedAt = new Date();
    await saveBoard(board);
    
    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
```

#### 8.4 Implement Task Completion Endpoint
**Estimated Time:** 1-2 hours

```typescript
// app/api/boards/[boardId]/cards/[cardId]/complete/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string; cardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  try {
    const { targetColumnId, notes, metadata } = await req.json();
    const board = await loadBoard(params.boardId);
    const card = board.cards[params.cardId];

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Only agent who claimed can complete
    if (card.claimedBy !== auth.agentId) {
      return NextResponse.json(
        { error: 'Not authorized to complete this card' },
        { status: 403 }
      );
    }

    // Validate target column exists
    if (!board.columns[targetColumnId]) {
      return NextResponse.json(
        { error: 'Invalid target column' },
        { status: 400 }
      );
    }

    // Move to target column
    const oldColumnId = card.columnId;
    card.columnId = targetColumnId;
    card.order = getNextOrder(board.cards, targetColumnId);
    
    // Update status
    card.status = 'completed';
    card.progress = 1.0;
    card.claimedBy = undefined;
    card.claimedAt = undefined;
    card.updatedAt = new Date();
    
    // Store agent completion metadata
    if (metadata) {
      card.agentMetadata = {
        ...card.agentMetadata,
        completedBy: auth.agentId,
        completedAt: new Date(),
        ...metadata
      };
    }
    
    // Add completion note
    if (notes) {
      card.notes.push({
        id: generateId('note'),
        text: `[${auth.agentId}] Completed: ${notes}`,
        createdAt: new Date()
      });
    }

    board.metadata.updatedAt = new Date();
    await saveBoard(board);
    
    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}
```

#### 8.5 Implement Release Task Endpoint
**Estimated Time:** 1 hour

```typescript
// app/api/boards/[boardId]/cards/[cardId]/release/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string; cardId: string } }
) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) {
    return NextResponse.json(auth, { status: auth.status });
  }

  try {
    const { reason } = await req.json();
    const board = await loadBoard(params.boardId);
    const card = board.cards[params.cardId];

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Release claim
    card.claimedBy = undefined;
    card.claimedAt = undefined;
    card.status = 'available';
    card.progress = undefined;
    card.updatedAt = new Date();
    
    // Add release note
    if (reason) {
      card.notes.push({
        id: generateId('note'),
        text: `[${auth.agentId}] Released: ${reason}`,
        createdAt: new Date()
      });
    }

    board.metadata.updatedAt = new Date();
    await saveBoard(board);
    
    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to release task' },
      { status: 500 }
    );
  }
}
```

#### 8.6 Add Stale Claim Cleanup Job
**Estimated Time:** 1-2 hours

```typescript
// lib/cleanupJobs.ts
import { loadBoard, saveBoard, getAllBoardIds } from './boardStorage';
import { Card } from '@/types/board';

function isClaimStale(card: Card): boolean {
  if (!card.claimedAt) return true;
  const ageMinutes = (Date.now() - new Date(card.claimedAt).getTime()) / 60000;
  return ageMinutes > 30;
}

export async function releaseStaleClaimsexport() {
  console.log('[Cleanup] Checking for stale claims...');
  
  try {
    const boardIds = await getAllBoardIds();
    let totalReleased = 0;
    
    for (const boardId of boardIds) {
      const board = await loadBoard(boardId);
      let hasChanges = false;
      
      for (const card of Object.values(board.cards)) {
        if (card.claimedBy && isClaimStale(card)) {
          console.log(`[Cleanup] Releasing stale claim: ${card.id} (${card.title})`);
          
          card.claimedBy = undefined;
          card.claimedAt = undefined;
          card.status = 'available';
          card.progress = undefined;
          
          // Add note about timeout
          card.notes.push({
            id: generateId('note'),
            text: '[System] Task auto-released after 30 minute timeout',
            createdAt: new Date()
          });
          
          hasChanges = true;
          totalReleased++;
        }
      }
      
      if (hasChanges) {
        board.metadata.updatedAt = new Date();
        await saveBoard(board);
      }
    }
    
    if (totalReleased > 0) {
      console.log(`[Cleanup] Released ${totalReleased} stale claims`);
    }
  } catch (error) {
    console.error('[Cleanup] Error releasing stale claims:', error);
  }
}

// Run cleanup every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(releaseStaleClaimsexport, 5 * 60 * 1000);
  console.log('[Cleanup] Stale claim cleanup job started (5 min interval)');
}
```

Add to your Next.js server startup or create a separate background worker.

#### 8.7 Add Agent UI Indicators
**Estimated Time:** 2-3 hours

Update Card component to show agent activity:

```typescript
// components/Card.tsx additions
import { formatDistanceToNow } from 'date-fns';

function Card({ card, index, onUpdate, onDelete }: CardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isClaimedByAgent = card.claimedBy?.startsWith('agent:');
  const isClaimedByHuman = card.claimedBy && !isClaimedByAgent;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => !isEditing && setIsExpanded(!isExpanded)}
          className={`
            bg-white dark:bg-[var(--color-surface)]
            border rounded-lg p-3 shadow-sm hover:shadow-md
            transition-all cursor-pointer
            ${snapshot.isDragging ? 'opacity-50 rotate-2' : ''}
            ${isClaimedByAgent ? 'border-l-4 border-l-blue-500' : ''}
            ${isClaimedByHuman ? 'border-l-4 border-l-purple-500' : ''}
          `}
        >
          {/* Card Title */}
          <h3 className="text-sm font-medium text-[var(--color-text)]">
            {card.title}
          </h3>
          
          {/* Agent Claim Badge */}
          {isClaimedByAgent && (
            <div className="flex items-center gap-2 text-xs text-blue-600 mt-2 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
              <span>🤖</span>
              <span className="font-medium">
                {card.claimedBy.replace('agent:', '')}
              </span>
              {card.claimedAt && (
                <span className="text-gray-500">
                  • {formatDistanceToNow(new Date(card.claimedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          )}
          
          {/* Human Claim Badge */}
          {isClaimedByHuman && (
            <div className="flex items-center gap-2 text-xs text-purple-600 mt-2 bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1">
              <span>👤</span>
              <span className="font-medium">
                {card.claimedBy.replace('human:', '')}
              </span>
            </div>
          )}
          
          {/* Progress Bar */}
          {card.status === 'in_progress' && card.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${card.progress * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-600">
                  {Math.round(card.progress * 100)}% complete
                </span>
                {card.status && (
                  <span className="text-xs text-gray-500 capitalize">
                    {card.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          {card.status && card.status !== 'available' && (
            <div className="mt-2">
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${card.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                ${card.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${card.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                ${card.status === 'blocked' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {card.status.replace('_', ' ')}
              </span>
            </div>
          )}
          
          {/* Expanded view - existing code */}
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {/* ... existing expanded content ... */}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
```

Add agent filter to Column component:
```typescript
// components/Column.tsx additions
function Column({ column, onAddCard }: ColumnProps) {
  const [showAgentOnly, setShowAgentOnly] = useState(false);
  
  const filteredCards = showAgentOnly
    ? column.cards.filter(c => c.claimedBy?.startsWith('agent:'))
    : column.cards;

  return (
    <div className="flex-shrink-0 w-80">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{column.title}</h2>
        <button
          onClick={() => setShowAgentOnly(!showAgentOnly)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showAgentOnly ? '🤖 Agents only' : 'All cards'}
        </button>
      </div>
      
      {/* ... rest of column ... */}
    </div>
  );
}
```

#### 8.8 Extend API Client for Agent Operations
**Estimated Time:** 1 hour

```typescript
// lib/apiClient.ts - Add agent methods
export class AgwakwaganClient {
  // ... existing methods ...

  // Agent-specific methods
  async claimTask(
    boardId: string,
    columnId: string,
    filter?: { tags?: string[] }
  ): Promise<Card | null> {
    try {
      return await this.request(`/boards/${boardId}/tasks/claim`, {
        method: 'POST',
        body: JSON.stringify({ columnId, filter })
      });
    } catch (error) {
      if (error.message.includes('No tasks available')) {
        return null;
      }
      throw error;
    }
  }

  async updateProgress(
    boardId: string,
    cardId: string,
    progress: number,
    message?: string
  ): Promise<Card> {
    return this.request(`/boards/${boardId}/cards/${cardId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress, message })
    });
  }

  async completeTask(
    boardId: string,
    cardId: string,
    targetColumnId: string,
    notes?: string,
    metadata?: Record<string, any>
  ): Promise<Card> {
    return this.request(`/boards/${boardId}/cards/${cardId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ targetColumnId, notes, metadata })
    });
  }

  async releaseTask(
    boardId: string,
    cardId: string,
    reason?: string
  ): Promise<Card> {
    return this.request(`/boards/${boardId}/cards/${cardId}/release`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
}
```

#### 8.9 Create Example Agent
**Estimated Time:** 2 hours

```typescript
// examples/simpleAgent.ts
import { AgwakwaganClient } from '../lib/apiClient';

const API_KEY = process.env.AGENT_API_KEY!;
const BOARD_ID = process.env.BOARD_ID || 'board-default';
const QUEUE_COLUMN = process.env.QUEUE_COLUMN || 'agent-queue';
const DONE_COLUMN = process.env.DONE_COLUMN || 'done';

const client = new AgwakwaganClient(API_KEY);

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function doWork(task: any): Promise<string> {
  console.log(`  Processing: ${task.title}`);
  
  // Simulate work with progress updates
  for (let i = 0; i <= 100; i += 20) {
    await client.updateProgress(
      BOARD_ID,
      task.id,
      i / 100,
      `Progress: ${i}%`
    );
    await sleep(2000);
  }
  
  return `Completed task: ${task.title}`;
}

async function runAgent() {
  console.log('🤖 Agent starting...');
  console.log(`   Board: ${BOARD_ID}`);
  console.log(`   Queue Column: ${QUEUE_COLUMN}`);
  
  while (true) {
    try {
      // Try to claim a task
      const task = await client.claimTask(BOARD_ID, QUEUE_COLUMN);
      
      if (!task) {
        console.log('No tasks available, waiting 30s...');
        await sleep(30000);
        continue;
      }
      
      console.log(`\n✓ Claimed task: ${task.title} (${task.id})`);
      
      // Do the work
      const result = await doWork(task);
      
      // Complete task
      await client.completeTask(
        BOARD_ID,
        task.id,
        DONE_COLUMN,
        result
      );
      
      console.log(`✓ Task completed and moved to ${DONE_COLUMN}\n`);
      
    } catch (error) {
      console.error('❌ Agent error:', error);
      await sleep(10000);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Agent shutting down...');
  process.exit(0);
});

runAgent().catch(console.error);
```

Run with:
```bash
AGENT_API_KEY=your-key BOARD_ID=board-default npm run agent
```

#### 8.10 Write Agent Integration Guide
**Estimated Time:** 2-3 hours

Create `docs/AGENT_INTEGRATION.md`:
```markdown
# Agent Integration Guide

## Quick Start

### 1. Get API Key
Contact admin for API key or generate in settings.

### 2. Install Client
\`\`\`bash
npm install @your-org/agwakwagan-client
\`\`\`

### 3. Create Agent
\`\`\`typescript
import { AgwakwaganClient } from '@your-org/agwakwagan-client';

const client = new AgwakwaganClient(process.env.API_KEY);

async function runAgent() {
  while (true) {
    const task = await client.claimTask('board-id', 'queue-column');
    if (!task) {
      await sleep(30000);
      continue;
    }
    
    // Do work...
    await client.completeTask('board-id', task.id, 'done-column');
  }
}
\`\`\`

## Task Claiming Protocol

[... detailed documentation ...]

## Best Practices

[... best practices ...]

## Troubleshooting

[... common issues ...]
```

### Acceptance Criteria
- [ ] Agent can claim tasks via API
- [ ] Agent can update progress (0-1 scale)
- [ ] Agent can complete tasks
- [ ] Agent can release tasks
- [ ] Stale claims automatically released (30min)
- [ ] UI shows agent activity with badges/progress
- [ ] Example agent runs successfully
- [ ] Multiple agents don't conflict (proper claiming)
- [ ] Documentation complete

### Definition of Done
- [ ] All agent endpoints tested
- [ ] Example agent code works end-to-end
- [ ] Documentation complete with examples
- [ ] UI indicators visible and helpful
- [ ] Tested with 2+ simultaneous agents
- [ ] No race conditions in claim logic
- [ ] Stale claim cleanup tested
- [ ] Agent integration guide reviewed

---

## Testing Strategy

### API Testing (Phase 7)
- Test all endpoints with Postman/Insomnia/curl
- Test rate limiting behavior (100 req/min)
- Test authentication failure cases
- Test invalid data handling
- Test concurrent requests

### Agent Testing (Phase 8)
- Test task claiming (available, stale, conflicts)
- Test progress updates
- Test task completion
- Test task release
- Test stale claim cleanup
- Test concurrent agent access
- Test agent UI indicators

### Integration Testing
- Test human + agent collaboration
- Test board state consistency
- Test export/import with agent fields
- Test migration from pre-agent schema

---

## Success Criteria

**Phase 7 Complete When:**
- ✅ Can create/read/update/delete boards via API
- ✅ Can create/read/update/delete cards via API
- ✅ API key authentication works
- ✅ Rate limiting prevents abuse
- ✅ API client library works
- ✅ API documentation complete

**Phase 8 Complete When:**
- ✅ Agent can claim task via API
- ✅ Agent can update task progress
- ✅ Agent can complete task
- ✅ Agent can release task
- ✅ Stale claims automatically released
- ✅ UI shows agent activity clearly
- ✅ Example agent runs successfully
- ✅ No conflicts when multiple agents claim
- ✅ Documentation complete

**Combined Phases 7-8 Success:**
- ✅ Can manage board entirely through API
- ✅ Agents can autonomously claim and complete tasks
- ✅ Human/agent collaboration visible in UI
- ✅ No data loss or corruption
- ✅ Production-ready security (rate limiting, auth)

---

**End of Agent Integration Implementation Phases**

These phases extend the core MVP with programmatic access and agent collaboration capabilities.
