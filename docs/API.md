# Agwakwagan External Command API

## Overview

Agwakwagan exposes a REST API for external actors (Beads, CI/CD pipelines, AI agents, custom automation scripts) to control the kanban board programmatically.

**Key Principle:** Agwakwagan is the **source of truth for identity**. External actors create resources and receive kanban-assigned hashes to reference them. They do NOT provide their own IDs.

## Authentication

All API requests require authentication via Bearer token:

```http
Authorization: Bearer <API_KEY>
```

API keys are configured via environment variables in `.env.local`:
```bash
BEADS_API_KEY=beads-key-abc123...
CI_API_KEY=ci-key-xyz789...
```

**Security Notes:**
- Keys should be at least 32 characters long
- Use different keys per service
- Store securely in production (AWS Secrets Manager, HashiCorp Vault, etc.)
- Never commit `.env.local` to version control

## Base URL

```
http://localhost:3000/api/boards/[boardId]
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Card Endpoints

### 1. List Cards

Get all cards from a board.

```http
GET /api/boards/:boardId/cards
Authorization: Bearer <API_KEY>
```

**Response (200):**
```json
{
  "cards": [
    {
      "cardHash": "card-a3f2",
      "title": "Implement authentication",
      "description": "Add OAuth flow",
      "columnHash": "col-b8d3",
      "columnName": "todo",
      "createdAt": "2024-11-11T00:00:00Z",
      "updatedAt": "2024-11-11T00:00:00Z"
    }
  ]
}
```

---

### 2. Create Card

Create a new card and receive a kanban-assigned hash.

```http
POST /api/boards/:boardId/cards
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "title": "Implement authentication",
  "description": "Add OAuth flow",
  "columnName": "todo"
}
```

**Request Parameters:**
- `title` (required) - Card title (1-500 chars)
- `description` (optional) - Card description
- `columnName` or `columnHash` (optional) - Target column (defaults to first column)

**Response (201):**
```json
{
  "cardHash": "card-a3f2",
  "title": "Implement authentication",
  "description": "Add OAuth flow",
  "columnHash": "col-b8d3",
  "columnName": "todo",
  "createdAt": "2024-11-11T00:00:00Z",
  "updatedAt": "2024-11-11T00:00:00Z"
}
```

**Error Response (400):**
```json
{
  "error": "title is required"
}
```

---

### 3. Get Card

Retrieve a card by its hash.

```http
GET /api/boards/:boardId/cards/:cardHash
Authorization: Bearer <API_KEY>
```

**Response (200):**
```json
{
  "cardHash": "card-a3f2",
  "title": "Implement authentication",
  "description": "Add OAuth flow",
  "columnHash": "col-b8d3",
  "columnName": "todo",
  "createdAt": "2024-11-11T00:00:00Z",
  "updatedAt": "2024-11-11T12:30:00Z"
}
```

**Error Response (404):**
```json
{
  "error": "Card not found"
}
```

---

### 4. Update Card

Update card content or move to a different column.

```http
PUT /api/boards/:boardId/cards/:cardHash
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "title": "Implement OAuth 2.0",
  "columnName": "in-progress"
}
```

**Request Parameters:**
- `title` (optional) - New card title
- `description` (optional) - New card description
- `columnName` or `columnHash` (optional) - Move to column

**Response (200):**
```json
{
  "cardHash": "card-a3f2",
  "title": "Implement OAuth 2.0",
  "columnHash": "col-c9e4",
  "columnName": "in-progress",
  "updatedAt": "2024-11-11T13:00:00Z"
}
```

---

### 5. Delete Card

Remove a card from the board.

```http
DELETE /api/boards/:boardId/cards/:cardHash
Authorization: Bearer <API_KEY>
```

**Response (204):** No content

**Error Response (404):**
```json
{
  "error": "Card not found"
}
```

---

## Column Endpoints

### 6. List Columns

Get all columns from a board.

```http
GET /api/boards/:boardId/columns
Authorization: Bearer <API_KEY>
```

**Response (200):**
```json
{
  "columns": [
    {
      "columnHash": "col-b8d3",
      "name": "todo",
      "title": "To Do",
      "order": 0
    },
    {
      "columnHash": "col-c9e4",
      "name": "in-progress",
      "title": "In Progress",
      "order": 1
    },
    {
      "columnHash": "col-d1f5",
      "name": "done",
      "title": "Done",
      "order": 2
    }
  ]
}
```

---

### 7. Create Column

Create a new column and receive a kanban-assigned hash.

```http
POST /api/boards/:boardId/columns
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "title": "Review",
  "insertAfter": "col-c9e4"
}
```

**Request Parameters:**
- `title` (required) - Column title (1-100 chars)
- `insertAfter` (optional) - Column hash to insert after (appends to end if omitted)

**Response (201):**
```json
{
  "columnHash": "col-e2g6",
  "name": "review",
  "title": "Review",
  "order": 2
}
```

---

### 8. Delete Column

Remove an empty column from the board.

```http
DELETE /api/boards/:boardId/columns/:columnHash
Authorization: Bearer <API_KEY>
```

**Response (204):** No content (if empty)

**Error Response (400 - column not empty):**
```json
{
  "error": "Cannot delete column with cards. Column contains 3 card(s)."
}
```

**Error Response (404):**
```json
{
  "error": "Column not found"
}
```

---

## Hash Reference

### Card Hash Format

```
card-{xxxx}
```

Where `xxxx` is a 4-character base36 string (0-9, a-z).

Examples: `card-a3f2`, `card-7b2k`, `card-9qq0`

**Uniqueness:** 36^4 = 1,679,616 possible combinations

### Column Hash Format

```
col-{xxxx}
```

Where `xxxx` is a 4-character base36 string (0-9, a-z).

Examples: `col-x9k2`, `col-m4n7`, `col-iic8`

**Uniqueness:** 36^4 = 1,679,616 possible combinations

---

## Usage Examples

### Example 1: Create Card and Update Status

```bash
# 1. Create a card
curl -X POST http://localhost:3000/api/boards/board-default/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "title": "Implement feature",
    "description": "Build new dashboard",
    "columnName": "todo"
  }'

# Response: { "cardHash": "card-a3f2", ... }

# 2. Move card to "in-progress"
curl -X PUT http://localhost:3000/api/boards/board-default/cards/card-a3f2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "columnName": "in-progress"
  }'

# 3. Move card to "done"
curl -X PUT http://localhost:3000/api/boards/board-default/cards/card-a3f2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "columnName": "done"
  }'

# 4. Delete the card
curl -X DELETE http://localhost:3000/api/boards/board-default/cards/card-a3f2 \
  -H "Authorization: Bearer ${BEADS_API_KEY}"
```

### Example 2: Create Column and Add Cards

```bash
# 1. Get existing columns
curl http://localhost:3000/api/boards/board-default/columns \
  -H "Authorization: Bearer ${BEADS_API_KEY}"

# 2. Create new column after "in-progress"
curl -X POST http://localhost:3000/api/boards/board-default/columns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "title": "Review",
    "insertAfter": "col-c9e4"
  }'

# Response: { "columnHash": "col-e2g6", ... }

# 3. Create card in new "Review" column
curl -X POST http://localhost:3000/api/boards/board-default/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BEADS_API_KEY}" \
  -d '{
    "title": "Review pull request",
    "columnHash": "col-e2g6"
  }'
```

### Example 3: List and Query

```bash
# List all cards
curl http://localhost:3000/api/boards/board-default/cards \
  -H "Authorization: Bearer ${BEADS_API_KEY}" | jq '.cards'

# Get specific card details
curl http://localhost:3000/api/boards/board-default/cards/card-a3f2 \
  -H "Authorization: Bearer ${BEADS_API_KEY}"

# List all columns
curl http://localhost:3000/api/boards/board-default/columns \
  -H "Authorization: Bearer ${BEADS_API_KEY}"
```

---

## Addressing Cards and Columns

### By Hash (Recommended)

Use the kanban-assigned hash:

```bash
# By cardHash
PUT /api/boards/:boardId/cards/card-a3f2

# By columnHash
DELETE /api/boards/:boardId/columns/col-b8d3
```

### By Name (Column Only)

For columns, you can also use the human-readable name:

```json
{
  "columnName": "todo",
  "title": "To Do",
  "columnName": "in-progress"
}
```

Column names are automatically derived from titles (lowercase, spaces as hyphens):
- "To Do" → "todo"
- "In Progress" → "in-progress"
- "Code Review" → "code-review"

---

## Integration Examples

### With Beads

**Note:** `br` is non-invasive and never executes git commands. After `br sync --flush-only`, you must manually run `git add .beads/ && git commit`.

```bash
# Create a kanban card from Beads issue

br create "Implement auth" --link-to-kanban

# Move kanban card when Beads issue changes

# (Custom integration needed)
```

### With CI/CD

```bash
# Pipeline creates a build status card
curl -X POST http://localhost:3000/api/boards/board-ci/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CI_API_KEY}" \
  -d '{
    "title": "Build #1234",
    "columnName": "in-progress"
  }'

# Move card when build completes
curl -X PUT http://localhost:3000/api/boards/board-ci/cards/card-abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CI_API_KEY}" \
  -d '{
    "columnName": "done"
  }'
```

### With Custom Scripts

```javascript
// Node.js example
const API_KEY = process.env.AGWAKWAGAN_API_KEY;
const BASE_URL = 'http://localhost:3000/api/boards/board-default';

async function createCard(title, columnName) {
  const response = await fetch(`${BASE_URL}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ title, columnName }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create card: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const card = await createCard('New task', 'todo');
console.log(`Created card: ${card.cardHash}`);
```

---

## FAQ

**Q: Can I use my own IDs instead of kanban-assigned hashes?**
A: No. Agwakwagan is the source of truth. External actors must store and reference the hashes provided by the API.

**Q: What if I lose track of a card hash?**
A: You can list all cards to find it again. Hashes are stable and never change.

**Q: Can I move cards between boards?**
A: No. Each board is independent. Use the API to create a new card on the target board.

**Q: Is there pagination for list endpoints?**
A: Not yet. Future versions will support pagination for large boards.

**Q: Can I batch create/update cards?**
A: Not yet. Process cards one at a time for now.

---

## Migration

To add hashes to existing boards without hashes:

```bash
npx tsx scripts/migrate-add-hashes.ts
```

This is safe to run multiple times (idempotent).

---

## Version History

- **v1.0** (2024-11-13)
  - Initial release
  - 8 core endpoints (5 card, 3 column)
  - API key authentication
  - FileSystem persistence