# API Contract

REST API for the Support Ticket Management System. Design document — defines the
contract the backend (M3) implements and the frontend (M5) consumes.

- **Base URL:** `http://localhost:4000/api`
- **Content type:** `application/json`
- **IDs:** UUID strings (path params)
- **Timestamps:** ISO-8601 UTC strings

## Common conventions

### Error shape (all non-2xx)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": { "title": "Required" }
  }
}
```

| HTTP | `code`             | When |
| ---- | ------------------ | ---- |
| 400  | `VALIDATION_ERROR` | Missing/invalid fields, bad enum, unknown referenced user |
| 404  | `NOT_FOUND`        | Ticket/user id does not exist |
| 409  | `INVALID_TRANSITION` | Status change not allowed by the state machine |
| 500  | `INTERNAL_ERROR`   | Unexpected server error |

### Enums
- `priority`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
- `status`: `OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED` | `CANCELLED`

---

## Health

### `GET /health`
Liveness probe (no `/api` prefix).
- **200** → `{ "status": "ok" }`

---

## Users

### `GET /api/users`
List seeded users (for assignee/creator selection in the UI).
- **200**
```json
[
  { "id": "uuid", "name": "Bob Agent", "email": "bob@example.com", "role": "AGENT" }
]
```

---

## Tickets

### `GET /api/tickets`
List tickets with optional keyword search, status filter, and pagination.
Results are ordered by `updatedAt` descending (newest first).

**Query params**
| Param        | Type   | Default      | Notes |
| ------------ | ------ | ------------ | ----- |
| `q`          | string | –            | Case-insensitive match on title OR description |
| `status`     | enum   | –            | Filter by exact status; invalid value → 400 |
| `priority`   | enum   | –            | Filter by priority; invalid value → 400 |
| `assignedTo` | uuid   | –            | Filter by assignee user id |
| `sortBy`     | enum   | `updatedAt`  | One of `createdAt` \| `updatedAt` \| `priority` |
| `sortOrder`  | enum   | `desc`       | `asc` \| `desc` |
| `page`       | int    | 1            | 1-based page number; `< 1` → 400 |
| `pageSize`   | int    | 20           | 1–100; out of range → 400 |

**200** — paginated envelope. List items are a light **summary** (no `comments`).
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Cannot log in",
      "description": "500 on submit",
      "priority": "HIGH",
      "status": "OPEN",
      "assignedTo": { "id": "uuid", "name": "Bob Agent" },
      "createdBy":  { "id": "uuid", "name": "Dave Requester" },
      "createdAt": "2026-07-23T18:00:00.000Z",
      "updatedAt": "2026-07-23T18:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}
```
No matches → `200` with `{ "data": [], "pagination": { ... "total": 0, "totalPages": 0 } }`.

---

### `POST /api/tickets`
Create a ticket. Status defaults to `OPEN`.

**Request**
```json
{
  "title": "Cannot log in",
  "description": "User gets a 500 on submit",
  "priority": "HIGH",
  "createdById": "uuid",
  "assignedToId": "uuid"
}
```
**Validation**
- `title`: required, 1–200 chars
- `description`: required, 1–5000 chars
- `priority`: required, valid enum
- `createdById`: required, must reference an existing user
- `assignedToId`: optional, must reference an existing user if present

**Responses**
- **201** → created ticket (same shape as list item, `comments: []`)
- **400** `VALIDATION_ERROR` (field details)

---

### `GET /api/tickets/:id`
Ticket detail including comments.

**200**
```json
{
  "id": "uuid",
  "title": "Cannot log in",
  "description": "500 on submit",
  "priority": "HIGH",
  "status": "OPEN",
  "assignedTo": { "id": "uuid", "name": "Bob Agent" },
  "createdBy":  { "id": "uuid", "name": "Dave Requester" },
  "createdAt": "…", "updatedAt": "…",
  "comments": [
    { "id": "uuid", "message": "Investigating.",
      "createdBy": { "id": "uuid", "name": "Bob Agent" },
      "createdAt": "…" }
  ]
}
```
- **404** `NOT_FOUND` if the id does not exist.

---

### `PATCH /api/tickets/:id`
Update ticket fields. **Does not change status** (use the status endpoint).

**Request** (all fields optional; at least one required)
```json
{
  "title": "New title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "assignedToId": "uuid-or-null"
}
```
**Validation**
- Same field rules as create; `assignedToId` may be `null` to unassign.
- `status` is **rejected** here (400) — status has a dedicated endpoint.

**Responses**
- **200** → updated ticket
- **400** `VALIDATION_ERROR`
- **404** `NOT_FOUND`

---

### `PATCH /api/tickets/:id/assign`
Assign or unassign a ticket. `assignedToId` is required but may be `null` to unassign.

**Request**
```json
{ "assignedToId": "uuid-or-null" }
```
**Responses**
- **200** → updated ticket
- **400** `VALIDATION_ERROR` — missing/invalid `assignedToId`, or assignee does not exist
- **404** `NOT_FOUND` — ticket does not exist

---

### `PATCH /api/tickets/:id/status`  ← state machine
Change a ticket's status through the enforced state machine.

**Request**
```json
{ "status": "IN_PROGRESS" }
```

**Allowed transitions**
```
OPEN        -> IN_PROGRESS | CANCELLED
IN_PROGRESS -> RESOLVED    | CANCELLED
RESOLVED    -> CLOSED
CLOSED      -> (none)
CANCELLED   -> (none)
```

**Responses**
- **200** → updated ticket (new status, refreshed `updatedAt`)
- **400** `VALIDATION_ERROR` — missing/invalid `status` value
- **404** `NOT_FOUND` — ticket does not exist
- **409** `INVALID_TRANSITION` — transition not allowed (incl. same-status and any
  move out of a terminal state)

**409 example**
```json
{ "error": { "code": "INVALID_TRANSITION",
  "message": "Cannot change status from RESOLVED to IN_PROGRESS." } }
```

---

## Comments

### `POST /api/tickets/:id/comments`
Add a comment to a ticket.

**Request**
```json
{ "message": "Reproduced on staging.", "createdById": "uuid" }
```
**Validation**
- `message`: required, 1–5000 chars
- `createdById`: required, must reference an existing user

**Responses**
- **201** → created comment (`{ id, message, createdBy, createdAt }`)
- **400** `VALIDATION_ERROR`
- **404** `NOT_FOUND` — ticket does not exist

---

## Endpoint ↔ requirement traceability

| Endpoint | Requirement |
| -------- | ----------- |
| `POST /tickets` | F1 Create |
| `GET /tickets` | F2 List, F7 Search, F8 Filter |
| `GET /tickets/:id` | F3 View details |
| `PATCH /tickets/:id` | F4 Update/reassign |
| `PATCH /tickets/:id/status` | F5 State machine |
| `POST /tickets/:id/comments` | F6 Comment |
| all | F10 Backend validation, F11 error states |
