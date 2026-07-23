# Data Model

The database is **PostgreSQL**, modelled with **Prisma**. Schema source of truth:
`backend/prisma/schema.prisma`; migrations live in `backend/prisma/migrations/`.

## Entities & Relationships

```
User 1───< Ticket (createdBy)      A user creates many tickets
User 1───< Ticket (assignedTo)     A user is assigned many tickets (optional)
User 1───< Comment (createdBy)     A user authors many comments
Ticket 1───< Comment               A ticket has many comments (cascade delete)
```

## Enums

| Enum       | Values                                             | Display notes |
| ---------- | -------------------------------------------------- | ------------- |
| `Priority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT`                  | Shown as Low / Medium / High / Urgent |
| `Status`   | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED` | `IN_PROGRESS` shown as "In Progress" |

## Tables

### User (seeded only)
| Field | Type   | Notes |
| ----- | ------ | ----- |
| id    | String (uuid) | PK |
| name  | String | required |
| email | String | required, **unique** |
| role  | String | e.g. ADMIN / AGENT / USER |

### Ticket
| Field        | Type            | Notes |
| ------------ | --------------- | ----- |
| id           | String (uuid)   | PK |
| title        | String          | required |
| description  | String          | required |
| priority     | Priority        | default `MEDIUM` |
| status       | Status          | default `OPEN`; changed only via state machine |
| assignedToId | String?         | FK → User (nullable) |
| createdById  | String          | FK → User (required) |
| createdAt    | DateTime        | default now() |
| updatedAt    | DateTime        | auto-updated |

Indexes: `status`, `assignedToId` (support filtering).

### Comment
| Field       | Type          | Notes |
| ----------- | ------------- | ----- |
| id          | String (uuid) | PK |
| ticketId    | String        | FK → Ticket, **cascade delete** |
| message     | String        | required |
| createdById | String        | FK → User (author) |
| createdAt   | DateTime      | default now() |

Index: `ticketId`.

## Status State Machine (enforced in backend, M3)

```
OPEN         -> IN_PROGRESS | CANCELLED
IN_PROGRESS  -> RESOLVED    | CANCELLED
RESOLVED     -> CLOSED
CLOSED       -> (terminal)
CANCELLED    -> (terminal)
```

Any other transition is rejected by the API (409). Status is **not** editable via
the generic ticket-update endpoint; it has a dedicated status-change endpoint.

## Design decisions

- **UUID primary keys** — avoid guessable sequential ids and simplify seeding/tests.
- **Nullable `assignedTo`** — a ticket can exist before being assigned.
- **Cascade delete on comments** — comments have no meaning without their ticket.
- **Enums in the DB** — invalid priority/status values are rejected at the DB layer
  in addition to request validation.
- **`updatedAt`** — managed by Prisma for audit/ordering.
