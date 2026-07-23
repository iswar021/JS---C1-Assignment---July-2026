# Requirement Analysis

## Selected Project Option

**Support Ticket Management System** (Backend-heavy option), **Core tier**.
A small internal tool where staff create, update, comment on, search, and progress
support tickets through an enforced status lifecycle. Users are **seeded only** —
there is no user-management UI in Core.

## My Understanding (in my own words)

The heart of the system is a **ticket** that moves through a controlled lifecycle.
Anyone (an internal user) can raise a ticket, describe the problem, set a priority,
and assign it to a colleague. As work happens, the ticket's **status** advances, but
only along **explicitly allowed transitions** — you cannot, for example, jump a
brand-new `Open` ticket straight to `Resolved`, and you cannot reopen something that
is `Closed`. Conversations happen through **comments**. Users need to **find**
tickets quickly (keyword search + status filter). The data is real and must
**survive restarts**, so it lives in a database, not memory. The backend is the
authority: it validates input and enforces the state machine; the frontend makes the
rules visible and shows friendly errors when something is rejected.

The deliberately hard, high-signal part is the **state machine**. It is small but it
is where correctness and engineering judgment show — so it must be enforced in one
authoritative place on the server and covered by integration tests.

## Functional Requirements

| #  | Requirement | Notes |
| -- | ----------- | ----- |
| F1 | Create a ticket | title, description, priority required; status defaults to `Open`; `createdBy` and optional `assignedTo` reference seeded users |
| F2 | List tickets | return all tickets with key fields for a list view |
| F3 | View ticket details | single ticket incl. comments and assignee/creator info |
| F4 | Update ticket fields | title, description, priority, assignee — **not** status (status has its own path) |
| F5 | Change status via state machine | only allowed transitions; invalid → rejected with clear error |
| F6 | Add comment | message + author (createdBy) attached to a ticket |
| F7 | Keyword search | match against title/description |
| F8 | Filter by status | Open / In Progress / Resolved / Closed / Cancelled |
| F9 | Persist data | PostgreSQL; survives process/DB restart |
| F10| Backend validation | reject missing/invalid fields with structured errors |
| F11| UI error states | show validation and transition errors meaningfully |

### Status state machine (authoritative)

```
Open        -> In Progress | Cancelled
In Progress -> Resolved    | Cancelled
Resolved    -> Closed
Closed      -> (terminal)
Cancelled   -> (terminal)
```

Any transition not listed above is **invalid** and must be rejected by the backend.

## Non-Functional Requirements

- **Correctness first** on the state machine; enforced in a single service layer.
- **Reproducible setup** from the README on a clean machine (pinned Node 20,
  Docker Postgres, `.env.example`, migrations, seed).
- **Type safety** end-to-end (TypeScript on both tiers; Prisma-generated types).
- **Clear separation of concerns**: routes → controllers → services → data access.
- **Security**: no secrets committed; input validated server-side; least data shared
  with AI tools.
- **Maintainability & readability** over cleverness; consistent conventions.
- **Testability**: state-machine logic isolated so it can be integration-tested.

## Assumptions

1. **Users are seeded** (a small fixed set); the app does not register/manage users.
2. **No authentication** in Core; any request acts as an internal user. `createdBy`
   is supplied/selected from seeded users rather than derived from a session.
3. **Priority** is an enum: `Low | Medium | High | Urgent` (reasonable default set).
4. **Status** enum values: `Open | In Progress | Resolved | Closed | Cancelled`.
5. **Comments are immutable** once created (no edit/delete in Core).
6. **Status is changed only via a dedicated endpoint**, not the generic field update.
7. Keyword search is **case-insensitive** and matches title or description.
8. Single-user-at-a-time usage is acceptable; no optimistic-locking/concurrency
   requirement in Core.
9. Timestamps (`createdAt`, `updatedAt`) are managed by the database/ORM.

## Clarifications (questions I would ask a product owner)

1. Should a `Cancelled` or `Closed` ticket ever be reopened? (Assumed: no — terminal.)
2. Can a ticket be created already assigned, or is assignment always a later step?
   (Assumed: assignment optional at creation.)
3. Should search also match comment text or only the ticket title/description?
   (Assumed: title/description only in Core.)
4. Are there SLA/priority-based rules on transitions? (Assumed: none in Core.)
5. Who may change status vs. edit fields — any role, or restricted? (Assumed: any
   internal user, since auth/roles are out of Core scope.)
6. Is soft-delete of tickets required? (Assumed: no delete in Core.)

## Edge Cases

- Create ticket with missing/blank title or description → **400**, field errors.
- Invalid `priority`/`status` enum value → **400**.
- `assignedTo`/`createdBy` referencing a non-existent user → **400/422**.
- Status change to the **same** status → rejected (not a valid transition).
- Status change along an **unlisted** path (e.g. `Open → Resolved`,
  `Resolved → In Progress`, `Closed → *`) → **409 Conflict** with a clear message.
- Operating on a **non-existent** ticket id → **404**.
- Comment with empty message → **400**.
- Search with no matches → empty list (not an error).
- Filter with an invalid status value → **400**.
- Extremely long title/description → length validation (**400**).
