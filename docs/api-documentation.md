# API Documentation

Base URL: `http://localhost:4000` · API prefix: `/api` · Content-Type:
`application/json`. This reflects the **implemented** API. See `api-contract.md`
(root) for the original contract.

## Conventions

- Resource ids are **UUID** path params.
- Timestamps are **ISO-8601** strings (serialized from `Date`).
- List filters/sort/pagination are **query params**.
- Status is changed **only** via `PATCH /tickets/:id/status` (never via `PATCH /tickets/:id`).
- All errors use a consistent shape (see [Errors](#errors)).

### Enums

| Enum      | Values |
| --------- | ------ |
| `Priority`| `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `Status`  | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED` |

### DTO shapes

```jsonc
// UserRef (embedded)         // User (GET /users)
{ "id": "uuid", "name": "…" }  { "id":"uuid","name":"…","email":"…","role":"…" }

// Ticket (detail)
{
  "id": "uuid",
  "title": "…",
  "description": "…",
  "priority": "HIGH",
  "status": "OPEN",
  "assignedTo": { "id": "uuid", "name": "…" } | null,
  "createdBy":  { "id": "uuid", "name": "…" },
  "createdAt": "2026-07-24T10:00:00.000Z",
  "updatedAt": "2026-07-24T10:00:00.000Z",
  "comments": [
    { "id":"uuid","message":"…","createdBy":{ "id":"uuid","name":"…" },"createdAt":"…" }
  ]
}
// TicketSummary (list rows) = Ticket without `comments`.
```

---

## Endpoints

### `GET /health`
Liveness probe. → `200 { "status": "ok" }`

### `GET /api/users`
List seeded users (for assignee/creator selectors), ordered by name.
→ `200 User[]`

---

### `GET /api/tickets`
List tickets with search, filtering, sorting, and pagination.

**Query parameters**

| Param        | Type   | Default      | Notes |
| ------------ | ------ | ------------ | ----- |
| `q`          | string | —            | Case-insensitive keyword across title + description |
| `status`     | enum   | —            | Filter by `Status` |
| `priority`   | enum   | —            | Filter by `Priority` |
| `assignedTo` | uuid   | —            | Filter by assignee id |
| `sortBy`     | enum   | `updatedAt`  | `createdAt \| updatedAt \| priority` |
| `sortOrder`  | enum   | `desc`       | `asc \| desc` |
| `page`       | int    | `1`          | 1-based; min 1 |
| `pageSize`   | int    | `20`         | 1–100 |

**Response** `200`

```jsonc
{
  "data": [ /* TicketSummary[] */ ],
  "pagination": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 }
}
```

Invalid query params → `400 VALIDATION_ERROR`.

---

### `POST /api/tickets`
Create a ticket. New tickets always start `OPEN` (status is not accepted here).

**Body**

```jsonc
{
  "title": "string (1–200)",
  "description": "string (1–5000)",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "createdById": "uuid (must exist)",
  "assignedToId": "uuid | null (optional)"
}
```

**Responses**

- `201` → created `Ticket` (with empty `comments`)
- `400 VALIDATION_ERROR` → schema error, or `createdById`/`assignedToId` references a non-existent user (field-scoped `details`)

---

### `GET /api/tickets/:id`
Fetch a single ticket with its comments (ordered oldest→newest).

- `200` → `Ticket`
- `400 VALIDATION_ERROR` → malformed (non-UUID) id
- `404 NOT_FOUND` → no such ticket

---

### `PATCH /api/tickets/:id`
Update editable fields. At least one field required. Unknown keys are rejected
(notably `status`). `assignedToId: null` unassigns.

**Body** (all optional, ≥ 1 required)

```jsonc
{ "title": "…", "description": "…", "priority": "HIGH", "assignedToId": "uuid | null" }
```

**Responses**

- `200` → updated `Ticket`
- `400 VALIDATION_ERROR` → empty body, unknown key, invalid value, or unknown `assignedToId`
- `404 NOT_FOUND` → no such ticket

---

### `PATCH /api/tickets/:id/assign`
Assign or unassign a ticket.

**Body**

```jsonc
{ "assignedToId": "uuid | null" }   // null = unassign
```

**Responses**

- `200` → updated `Ticket`
- `400 VALIDATION_ERROR` → unknown key, or `assignedToId` references a non-existent user
- `404 NOT_FOUND` → no such ticket

---

### `PATCH /api/tickets/:id/status`
Change status through the enforced state machine.

**Body**

```jsonc
{ "status": "IN_PROGRESS" }
```

**Allowed transitions**

| From \ To   | OPEN | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED |
| ----------- | :--: | :---------: | :------: | :----: | :-------: |
| OPEN        |  –   |     ✅      |    ❌    |   ❌   |    ✅     |
| IN_PROGRESS |  ❌  |     –       |    ✅    |   ❌   |    ✅     |
| RESOLVED    |  ❌  |     ❌      |    –     |   ✅   |    ❌     |
| CLOSED      |  ❌  |     ❌      |    ❌    |   –    |    ❌     |
| CANCELLED   |  ❌  |     ❌      |    ❌    |   ❌   |    –      |

**Responses**

- `200` → updated `Ticket`
- `400 VALIDATION_ERROR` → invalid/unknown status value
- `404 NOT_FOUND` → no such ticket
- `409 INVALID_TRANSITION` → transition not allowed from current status

---

### `POST /api/tickets/:id/comments`
Add a comment to a ticket.

**Body**

```jsonc
{ "message": "string (1–5000)", "createdById": "uuid (must exist)" }
```

**Responses**

- `201` → created `Comment`
- `400 VALIDATION_ERROR` → empty/oversized message, unknown key, or unknown `createdById`
- `404 NOT_FOUND` → no such ticket

---

## Errors

All errors share one shape:

```jsonc
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "title": ["Title is required"], "_errors": ["…"] }  // optional
  }
}
```

| HTTP | `code`               | When |
| ---- | -------------------- | ---- |
| 400  | `VALIDATION_ERROR`   | Schema failure or referential check (details are field-keyed) |
| 404  | `NOT_FOUND`          | Missing resource or unmatched route |
| 409  | `INVALID_TRANSITION` | Disallowed status transition |
| 409  | `CONFLICT`           | Unique-constraint violation (Prisma P2002) |
| 500  | `INTERNAL_ERROR`     | Unexpected error (logged server-side; no stack leaked) |

## Examples

```bash
# List HIGH-priority OPEN tickets, page 1
curl "http://localhost:4000/api/tickets?status=OPEN&priority=HIGH&page=1&pageSize=10"

# Create a ticket (createdById from GET /api/users)
curl -X POST http://localhost:4000/api/tickets \
  -H 'Content-Type: application/json' \
  -d '{"title":"Login fails","description":"500 on submit","priority":"HIGH","createdById":"<uuid>"}'

# Progress status OPEN → IN_PROGRESS
curl -X PATCH http://localhost:4000/api/tickets/<id>/status \
  -H 'Content-Type: application/json' -d '{"status":"IN_PROGRESS"}'

# Invalid transition (e.g. OPEN → CLOSED) → 409 INVALID_TRANSITION
```
