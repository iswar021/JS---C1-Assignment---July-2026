# Cursor Workflow — Spec

Product specification used as Cursor context for implementation milestones.

## Entities

- **User** — id, name, email, role (seeded only).
- **Ticket** — id, title, description, priority, status, assignedTo, createdBy,
  createdAt, updatedAt.
- **Comment** — id, ticketId, message, createdBy, createdAt.

## Enums

- Priority: `LOW | MEDIUM | HIGH | URGENT`
- Status: `OPEN | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED`

## Status state machine (mandatory)

```
OPEN         → IN_PROGRESS | CANCELLED
IN_PROGRESS  → RESOLVED    | CANCELLED
RESOLVED     → CLOSED
CLOSED       → (terminal)
CANCELLED    → (terminal)
```

Invalid transitions → HTTP **409** `INVALID_TRANSITION`. Status changes **only**
via `PATCH /api/tickets/:id/status`.

## Features (Core)

1. Create ticket  
2. List tickets  
3. View ticket details (with comments)  
4. Update title/description/priority/assignee  
5. Assign / unassign  
6. Change status via state machine  
7. Add comments  
8. Keyword search + status (and priority/assignee) filters  
9. Persist data (PostgreSQL)  
10. Backend validation of required fields  
11. Meaningful UI error/loading/empty/success states  

## API conventions

- Prefix `/api`
- UUID path params
- Consistent error: `{ error: { code, message, details? } }`
- ISO-8601 timestamps

## UI routes

| Path | Screen |
| ---- | ------ |
| `/` | Ticket list (search, filters, pagination) |
| `/tickets/new` | Create |
| `/tickets/:id` | Detail (status, assign, comments) |
| `/tickets/:id/edit` | Edit |

## Auth stance

No auth in Core. Header “Acting as” selects the seeded user used as `createdBy`
for tickets and comments.
