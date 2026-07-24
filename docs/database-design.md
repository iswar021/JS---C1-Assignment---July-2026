# Database Design

PostgreSQL via Prisma ORM. Schema: `backend/prisma/schema.prisma`; migrations:
`backend/prisma/migrations/`; seed: `backend/prisma/seed.ts`. See also
`data-model.md` (root) for the design-time narrative.

## 1. Entities

### User (seeded)
Internal users. There is no user-management UI in the Core tier — users are seeded
and referenced by tickets/comments.

| Column  | Type   | Constraints            |
| ------- | ------ | ---------------------- |
| `id`    | uuid   | PK, default `uuid()`   |
| `name`  | text   | not null               |
| `email` | text   | not null, **unique**   |
| `role`  | text   | not null               |

### Ticket
The central entity; moves through the status state machine.

| Column         | Type       | Constraints                         |
| -------------- | ---------- | ----------------------------------- |
| `id`           | uuid       | PK, default `uuid()`                |
| `title`        | text       | not null (1–200 enforced in API)    |
| `description`  | text       | not null (1–5000 enforced in API)   |
| `priority`     | `Priority` | not null, default `MEDIUM`          |
| `status`       | `Status`   | not null, default `OPEN`            |
| `assignedToId` | uuid?      | FK → User (nullable), `ON DELETE SET NULL` |
| `createdById`  | uuid       | FK → User, `ON DELETE RESTRICT`     |
| `createdAt`    | timestamp  | default `now()`                     |
| `updatedAt`    | timestamp  | `@updatedAt` (auto)                 |

Indexes: `@@index([status])`, `@@index([assignedToId])`.

### Comment
A message attached to a ticket. Immutable once created (Core).

| Column        | Type      | Constraints                        |
| ------------- | --------- | ---------------------------------- |
| `id`          | uuid      | PK, default `uuid()`               |
| `ticketId`    | uuid      | FK → Ticket, `ON DELETE CASCADE`   |
| `message`     | text      | not null (1–5000 enforced in API)  |
| `createdById` | uuid      | FK → User, `ON DELETE RESTRICT`    |
| `createdAt`   | timestamp | default `now()`                    |

Index: `@@index([ticketId])`.

## 2. Enums

- `Priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT` (definition order = ascending
  severity, so sorting by `priority` yields a meaningful order).
- `Status`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`.

## 3. Relationships

```
User 1 ──< Ticket   (createdBy,  relation "TicketCreatedBy",  RESTRICT)
User 1 ──< Ticket   (assignedTo, relation "TicketAssignedTo", SET NULL, nullable)
User 1 ──< Comment  (author,     RESTRICT)
Ticket 1 ──< Comment (CASCADE — deleting a ticket removes its comments)
```

**Referential-action rationale**

| FK                     | Action      | Why |
| ---------------------- | ----------- | --- |
| `Ticket.createdById`   | RESTRICT    | Preserve provenance; a creator can't be deleted out from under a ticket |
| `Ticket.assignedToId`  | SET NULL    | Unassigning on user removal is safe and expected |
| `Comment.ticketId`     | CASCADE     | Comments have no meaning without their ticket |
| `Comment.createdById`  | RESTRICT    | Preserve comment authorship |

## 4. Indexing & performance

- `Ticket.status` and `Ticket.assignedToId` are indexed — the two most common list
  filters.
- Keyword search uses case-insensitive `contains` on `title`/`description`.
- List queries run `findMany` + `count` in a single `prisma.$transaction`, and use
  a stable secondary sort (`id asc`) so pagination is deterministic.
- Relation includes use `select: { id, name }` to fetch only what the DTO needs.

> Optional future optimization (noted, not applied to avoid a schema/migration
> change that can't be DB-verified in this environment): add `@@index([priority])`
> and/or a composite index for the most common sort, and a trigram/full-text index
> if keyword search volume grows.

## 5. Migrations

- Single initial migration: `prisma/migrations/20260724000000_init/migration.sql`.
- Verified consistent with the schema: `prisma migrate diff --from-empty
  --to-schema-datamodel` produces SQL **byte-for-byte identical** to the committed
  migration (zero drift), and `prisma validate` passes.
- Apply locally with `npm run prisma:migrate` (dev) or `npm run prisma:deploy`
  (non-dev). See [Installation Guide](installation-guide.md).

## 6. Seed data

`npm run seed` is **idempotent**:
- Users are **upserted by unique email** (safe to re-run).
- Sample tickets/comments are created **only when the ticket table is empty**.

Seeded: 4 users (Alice/Bob/Carol/Dave with ADMIN/AGENT/USER roles) and 3 tickets
spanning `OPEN`, `IN_PROGRESS`, and `RESOLVED` with sample comments.
