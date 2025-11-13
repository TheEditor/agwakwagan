# Phase 4: External Command API - Part 2: Security & Testing

**Prerequisites:** Phase 4 Part 1 Complete
**Estimated Time:** 1.5 hours (Tasks 4.3-4.5 + Testing)
**Priority:** HIGH (Required for external process control)

---

## Task 4.3: API Authentication (1 hour)

### Problem

External actors need secure access to the API. Without authentication:
- Anyone can modify the board
- No audit trail of who did what
- Can't restrict access per board

### Solution: Abstracted Authentication Provider

**Architecture:**
- `AuthProvider` interface - defines authentication contract
- `ApiKeyAuthProvider` - current simple implementation
- `middleware.ts` - uses provider via dependency injection
- Future providers (JWT, OAuth) implement same interface

**File: `app/api/auth/provider.ts`** (NEW)

```typescript
import { NextRequest } from 'next/server';

/**
 * Authentication provider interface
 * Implement this interface to add new auth strategies
 */
export interface AuthProvider {
  /**
   * Authenticate request for given board
   * @returns true if authenticated, false otherwise
   */
  authenticate(request: NextRequest, boardId: string): Promise<boolean>;
}
```

**File: `app/api/auth/apiKeyProvider.ts`** (NEW)

```typescript
import { NextRequest } from 'next/server';
import { AuthProvider } from './provider';

interface ApiKeyConfig {
  name: string;
  boards: string[];
}

/**
 * Simple API key authentication provider
 * Keys loaded from environment variables
 */
export class ApiKeyAuthProvider implements AuthProvider {
  private keys: Map<string, ApiKeyConfig>;

  constructor() {
    // Load API keys from environment
    this.keys = new Map<string, ApiKeyConfig>();

    // Load from environment variables
    if (process.env.BEADS_API_KEY) {
      this.keys.set(process.env.BEADS_API_KEY, {
        name: 'Beads Agent',
        boards: ['*'], // Access to all boards
      });
    }

    if (process.env.CI_API_KEY) {
      this.keys.set(process.env.CI_API_KEY, {
        name: 'CI/CD Pipeline',
        boards: ['board-ci'], // Restricted to specific board
      });
    }

    // Add more keys from environment as needed
    // Pattern: {SERVICE}_API_KEY environment variable
  }

  async authenticate(request: NextRequest, boardId: string): Promise<boolean> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer "
    const keyConfig = this.keys.get(apiKey);

    if (!keyConfig) {
      return false;
    }

    // Check if this key has access to this board
    if (keyConfig.boards.includes('*') || keyConfig.boards.includes(boardId)) {
      return true;
    }

    return false;
  }
}
```

**File: `app/api/auth/jwtProvider.ts`** (NEW - Skeleton for future)

```typescript
import { NextRequest } from 'next/server';
import { AuthProvider } from './provider';

/**
 * JWT authentication provider (future implementation)
 * Validates JWT tokens and checks permissions
 */
export class JwtAuthProvider implements AuthProvider {
  async authenticate(request: NextRequest, boardId: string): Promise<boolean> {
    // TODO: Implement JWT validation
    // 1. Extract JWT from Authorization header
    // 2. Verify signature
    // 3. Check expiration
    // 4. Validate board access claims
    throw new Error('JWT authentication not yet implemented');
  }
}
```

**File: `app/api/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AuthProvider } from './auth/provider';
import { ApiKeyAuthProvider } from './auth/apiKeyProvider';

// Dependency injection: Swap provider here to change auth strategy
// Options:
//   - new ApiKeyAuthProvider() (current)
//   - new JwtAuthProvider() (future)
//   - new OAuth2Provider() (future)
const authProvider: AuthProvider = new ApiKeyAuthProvider();

/**
 * Helper to wrap authenticated routes
 * Auth logic delegated to provider - no changes needed when swapping strategies
 */
export function withAuth(
  handler: (req: NextRequest, params: any) => Promise<NextResponse>,
  boardIdParam: string = 'boardId'
) {
  return async (request: NextRequest, context: any) => {
    const boardId = context.params[boardIdParam];

    // Delegate to provider
    const isAuthenticated = await authProvider.authenticate(request, boardId);

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, context);
  };
}
```

### Update API Routes to Use Auth

**File: `app/api/boards/[boardId]/cards/route.ts`**

```typescript
import { withAuth } from '@/app/api/middleware';

// Wrap handlers
export const GET = withAuth(async (request, { params }) => {
  // ... existing GET logic
});

export const POST = withAuth(async (request, { params }) => {
  // ... existing POST logic
});
```

### Environment Configuration

**File: `.env.local`** (example)

```bash
# API Keys - loaded by ApiKeyAuthProvider
# Pattern: {SERVICE}_API_KEY
BEADS_API_KEY=beads-key-abc123-xyz789-secure-token
CI_API_KEY=ci-key-xyz789-abc123-secure-token

# Add more keys as needed:
# AGENT_API_KEY=...
# WEBHOOK_API_KEY=...
```

**Security Notes:**
- API keys should be long, random strings (32+ characters)
- Use different keys per service/actor
- Store in secure secret manager for production (AWS Secrets Manager, HashiCorp Vault, etc.)
- Never commit `.env.local` to version control

### Switching Authentication Providers

To switch from API keys to another auth strategy, change ONE line in `middleware.ts`:

```typescript
// Current: API Key authentication
const authProvider: AuthProvider = new ApiKeyAuthProvider();

// Switch to JWT (future):
const authProvider: AuthProvider = new JwtAuthProvider();

// Switch to OAuth 2.0 (future):
const authProvider: AuthProvider = new OAuth2Provider();
```

**No other code changes needed** - all routes continue working unchanged.

**Future Providers to Implement:**
- **JWT tokens**: Stateless, scalable, includes claims
- **OAuth 2.0**: Industry standard, user delegation
- **Service account credentials**: Google Cloud, AWS IAM-style
- **Role-based access control (RBAC)**: Fine-grained permissions

**Provider Pattern Benefits:**
- ✅ Zero coupling between auth strategy and business logic
- ✅ Easy A/B testing of auth methods
- ✅ Can run multiple providers simultaneously (check each in sequence)
- ✅ Simple to mock for testing

### Acceptance Criteria
- [ ] AuthProvider interface defined
- [ ] ApiKeyAuthProvider implements AuthProvider
- [ ] JwtAuthProvider skeleton exists (throws "not implemented")
- [ ] API keys loaded from environment variables
- [ ] API requires `Authorization: Bearer <key>` header
- [ ] Invalid/missing keys return 401 Unauthorized
- [ ] Keys can be scoped to specific boards
- [ ] Keys stored securely in environment (not in code)
- [ ] withAuth() delegates to provider (no hardcoded auth logic)

---

## Task 4.4: Event Notifications (Optional - 30 min)

### Problem

External actors may want to know when cards change (e.g., human moves card in UI, trigger external sync).

### Solution: Webhook Notifications

**File: `app/api/boards/[boardId]/webhooks/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface Webhook {
  url: string;
  events: ('card.created' | 'card.updated' | 'card.deleted' | 'column.created')[];
}

// In-memory webhook registry (persist in production)
const webhooks = new Map<string, Webhook[]>();

/**
 * POST /api/boards/:boardId/webhooks
 * Register webhook
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const body = await request.json();

  if (!body.url || !body.events) {
    return NextResponse.json(
      { error: 'url and events are required' },
      { status: 400 }
    );
  }

  const boardWebhooks = webhooks.get(params.boardId) || [];
  boardWebhooks.push({ url: body.url, events: body.events });
  webhooks.set(params.boardId, boardWebhooks);

  return NextResponse.json({ success: true }, { status: 201 });
}

/**
 * Send webhook notification
 */
export async function notifyWebhooks(
  boardId: string,
  event: string,
  data: any
) {
  const boardWebhooks = webhooks.get(boardId) || [];

  for (const webhook of boardWebhooks) {
    if (webhook.events.includes(event as any)) {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, boardId, data }),
        });
      } catch (error) {
        console.error(`Failed to notify webhook ${webhook.url}:`, error);
      }
    }
  }
}
```

### Call Webhooks from Card Operations

Add to card create/update/delete handlers:

```typescript
import { notifyWebhooks } from '@/app/api/boards/[boardId]/webhooks/route';

// After successful card creation:
await notifyWebhooks(params.boardId, 'card.created', {
  cardHash: newCard.cardHash,
  title: newCard.title,
  columnHash: column.columnHash,
  columnName: getColumnName(column),
});
```

### Acceptance Criteria (Optional)
- [ ] Can register webhooks via POST /webhooks
- [ ] Webhooks fire on card.created, card.updated, card.deleted, column.created
- [ ] Webhook payloads include cardHash/columnHash and event data

---

## Task 4.5: Migration for Existing Boards (30 min)

### Problem

Existing boards have cards/columns without hashes. Need migration to assign hashes.

### Solution: Migration Script

**File: `scripts/migrate-add-hashes.ts`**

```typescript
import { LocalStorageDataSource } from '@/lib/datasources/localStorage';
import { generateCardHash, generateColumnHash } from '@/utils/hash';

/**
 * Migrate existing boards to add cardHash and columnHash
 */
async function migrate() {
  const dataSource = new LocalStorageDataSource();
  
  try {
    const board = await dataSource.loadBoard('board-default');
    
    let changed = false;

    // Add hashes to columns (format: col-xxxx)
    Object.values(board.columns).forEach(column => {
      if (!column.columnHash) {
        column.columnHash = generateColumnHash();
        changed = true;
        console.log(`Added columnHash to "${column.title}": ${column.columnHash}`);
      }
    });

    // Add hashes to cards (format: card-xxxx)
    Object.values(board.cards).forEach(card => {
      if (!card.cardHash) {
        card.cardHash = generateCardHash();
        changed = true;
        console.log(`Added cardHash to "${card.title}": ${card.cardHash}`);
      }
    });

    if (changed) {
      board.metadata.updatedAt = new Date();
      await dataSource.saveBoard(board);
      console.log('Migration complete!');
    } else {
      console.log('No migration needed - all resources already have hashes');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
```

**Run migration:**
```bash
npx tsx scripts/migrate-add-hashes.ts
```

### Acceptance Criteria
- [ ] Migration script assigns hashes to existing cards/columns
- [ ] Migration is idempotent (safe to run multiple times)
- [ ] Logs show which resources received hashes
- [ ] Existing boards work with API after migration

---

## Testing Plan

### Manual Testing with curl

#### 1. Create Card (Receive Hash)
```bash
curl -X POST http://localhost:3000/api/boards/board-default/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "title": "Implement authentication",
    "description": "Add OAuth flow",
    "columnName": "todo"
  }'

# Response should include:
# {
#   "cardHash": "card-a3f2",  ← Store this!
#   "title": "Implement authentication",
#   "columnHash": "col-b8d3",
#   ...
# }
```

#### 2. Get Card (Using Kanban-Assigned Hash)
```bash
curl http://localhost:3000/api/boards/board-default/cards/card-a3f2 \
  -H "Authorization: Bearer ${BEADS_API_KEY}"
```

#### 3. Update Card (Move to In Progress Using Hash)
```bash
curl -X PUT http://localhost:3000/api/boards/board-default/cards/card-a3f2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "columnName": "in-progress"
  }'
```

#### 4. Delete Card
```bash
curl -X DELETE http://localhost:3000/api/boards/board-default/cards/card-a3f2 \
  -H "Authorization: Bearer ${BEADS_API_KEY}"
```

#### 5. List Columns (Get Hashes)
```bash
curl http://localhost:3000/api/boards/board-default/columns \
  -H "Authorization: Bearer ${BEADS_API_KEY}"

# Response:
# {
#   "columns": [
#     { "columnHash": "col-b8d3", "name": "todo", "title": "To Do", ... },
#     { "columnHash": "col-c9e4", "name": "in-progress", ... },
#     ...
#   ]
# }
```

#### 6. Create Column (Receive Hash)
```bash
curl -X POST http://localhost:3000/api/boards/board-default/columns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "title": "Review",
    "insertAfter": "col-c9e4"
  }'

# Response:
# {
#   "columnHash": "col-e2g6",  ← Store this!
#   "name": "review",
#   ...
# }
```

#### 7. Delete Empty Column
```bash
curl -X DELETE http://localhost:3000/api/boards/board-default/columns/col-e2g6 \
  -H "Authorization: Bearer ${BEADS_API_KEY}"

# Response 204 if empty
# Response 400 if contains cards:
# {
#   "error": "Cannot delete column with cards. Column contains 3 card(s)."
# }
```

### Manual Testing Checklist
- [ ] Create card via API → receives cardHash → appears in UI
- [ ] Update card via API using cardHash → UI reflects change
- [ ] Move card via API using columnHash → UI updates
- [ ] Move card via API using columnName → UI updates
- [ ] Delete card via API using cardHash → removed from UI
- [ ] Create column via API → receives columnHash → appears in UI
- [ ] Delete empty column via API → removed from UI
- [ ] Delete non-empty column via API → returns 400 error
- [ ] Move card in UI → API GET shows new columnHash
- [ ] Missing auth returns 401
- [ ] Invalid boardId returns 500 or 404
- [ ] Invalid cardHash/columnHash returns 404
- [ ] Migration script adds hashes to existing data

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `types/board.ts` | MODIFY | Add `cardHash?: string` to Card, `columnHash?: string` to Column |
| `utils/hash.ts` | CREATE | Hash generation utilities |
| `utils/cardLookup.ts` | CREATE | Helper to find cards/columns by hash |
| `app/api/boards/[boardId]/cards/route.ts` | CREATE | List/create cards (returns cardHash) |
| `app/api/boards/[boardId]/cards/[cardHash]/route.ts` | CREATE | Get/update/delete card by cardHash |
| `app/api/boards/[boardId]/columns/route.ts` | CREATE | List/create columns (returns columnHash) |
| `app/api/boards/[boardId]/columns/[columnHash]/route.ts` | CREATE | Delete empty column by columnHash |
| `app/api/auth/provider.ts` | CREATE | AuthProvider interface (abstraction) |
| `app/api/auth/apiKeyProvider.ts` | CREATE | API key authentication implementation |
| `app/api/auth/jwtProvider.ts` | CREATE | JWT provider skeleton (future) |
| `app/api/middleware.ts` | CREATE | Auth wrapper using provider pattern |
| `app/api/boards/[boardId]/webhooks/route.ts` | CREATE | Webhook registration (optional) |
| `scripts/migrate-add-hashes.ts` | CREATE | Migration script for existing boards |
| `.env.local` | CREATE | API key configuration |

---

## Success Criteria

Phase 4 is complete when:
- ✅ Card type includes `cardHash?: string`
- ✅ Column type includes `columnHash?: string`
- ✅ Hash generation utilities exist
- ✅ All 8 API endpoints work (cards: list, create, get, update, delete; columns: list, create, delete)
- ✅ POST /cards returns kanban-assigned `cardHash`
- ✅ POST /columns returns kanban-assigned `columnHash`
- ✅ DELETE /columns/:columnHash only works on empty columns
- ✅ DELETE /columns/:columnHash returns 400 if column contains cards
- ✅ External actors can CRUD cards using only kanban-assigned hashes
- ✅ Column names AND hashes both work for addressing
- ✅ API requires authentication (Bearer token)
- ✅ Cards created via API appear in UI immediately
- ✅ Cards moved in UI reflect in API queries
- ✅ Migration script adds hashes to existing data
- ✅ Build passes TypeScript checks
- ✅ Manual curl tests pass

---

## What This Enables

After Phase 4, external systems can:
- **Beads**: Sync issues to kanban
  - `bd create` → POST /cards → receive cardHash → store in `.beads/cards.json`
  - `bd update` → PUT /cards/{cardHash} → move column
  - Beads owns issue ID, kanban owns cardHash, mapping stored locally
- **CI/CD**: Report build status
  - Pipeline creates card → receives cardHash → moves through stages
- **AI Agents**: Claim work items
  - Agent creates card for task → receives cardHash → updates progress
- **Custom Scripts**: Automate task management
  - Script queries ready work → receives cardHashes → updates as complete

**Key Difference from Original Spec:**
- External actors **receive** IDs from kanban (single source of truth)
- No ID coordination problems
- Retry-safe operations
- Simpler external implementation

---

## Future Phases

### Phase 5: Advanced Features
- Real-time WebSocket updates
- Batch operations
- Advanced querying (filter by column, date range)
- Audit log (who changed what when)
- Idempotency keys for duplicate request handling

But those are future concerns. Phase 4 focuses on **core command API with kanban-assigned identity**.

---

## Beads Issues Breakdown Reference

This document (Part 2) covers **Issues 4, 5, 6, and 7** from the breakdown:

### Issues Covered in Part 2

**Issue 4: Task 4.3 - Authentication Provider Pattern** (~1 hour)
- ✅ Covered in Task 4.3 section above
- Create AuthProvider interface and implementations
- Wrap routes with `withAuth()`

**Issue 5: Task 4.5 - Migration Script** (~30 min)
- ✅ Covered in Task 4.5 section above
- Add hashes to existing cards/columns
- Idempotent migration

**Issue 6: Task 4.4 - Event Notifications (Optional)** (~30 min)
- ✅ Covered in Task 4.4 section above
- Webhook registration and delivery
- Optional feature

**Issue 7: Phase 4 - Manual Testing & Validation** (~30 min)
- ✅ Covered in Testing Plan section above
- Run all curl tests
- Verify acceptance criteria

### Full Issues List

For the complete breakdown of all 10 issues (including Issues 1-3 for implementation), see the **Beads Issues Breakdown** section in Part 1.

### Implementation Dependencies

When creating Beads issues:
- Issue 4 (auth) **depends on** Issues 2 & 3 (API routes must exist)
- Issue 5 (migration) **depends on** Issue 1 (hash utilities must exist)
- Issue 6 (webhooks) **depends on** Issues 2 & 3 (routes must exist)
- Issue 7 (testing) **depends on** Issues 1-5 complete

### Critical Reminder for AI Assistants

**DO NOT combine Issues 2 & 3 into a single issue.**
- Issue 2 (Card APIs): 5 endpoints, 1.5 hours
- Issue 3 (Column APIs): 3 endpoints, 1 hour

These are separate concerns with different complexity levels. Keeping them separate:
- ✅ Enables parallel development
- ✅ Provides better progress tracking
- ✅ Creates logical commit boundaries
- ✅ Reduces cognitive load per task
