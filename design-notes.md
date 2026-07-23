# Design Notes

Complete software architecture for the Support Ticket Management System (Core).
This is a **design document** — no implementation is described as done here; it
defines the structure the implementation milestones will follow.

Related docs: `data-model.md` (schema), `api-contract.md` (endpoints),
`ui-flow.md` (screens), `test-strategy.md` (testing).

---

## 1. Architecture Overview

A classic three-tier, single-repo (monorepo) application:

```
┌─────────────────────────────┐        HTTP / JSON        ┌──────────────────────────────┐
│  Frontend (React + TS)      │  ───────────────────────► │  Backend API (Express + TS)  │
│  Vite · TailwindCSS         │  ◄─────────────────────── │  routes→controllers→services │
│  Pages, components, api/    │        JSON responses     │  Prisma data access          │
└─────────────────────────────┘                           └───────────────┬──────────────┘
                                                                           │ Prisma Client
                                                                           ▼
                                                                 ┌────────────────────┐
                                                                 │ PostgreSQL (Docker) │
                                                                 └────────────────────┘
```

- **Frontend** renders tickets, handles search/filter UI, and surfaces error states.
  It holds **no business rules** — it only reflects and requests state.
- **Backend** is the single **source of truth**: it validates input and enforces the
  status state machine. Invalid input → 400; invalid transition → 409.
- **Database** provides durable persistence (data survives restart) and enum-level
  integrity for `Priority`/`Status`.

**Cross-cutting principles**
- Type safety end-to-end (TypeScript both tiers; Prisma-generated types on backend).
- Clear separation of concerns via a layered backend.
- Backend-authoritative validation; frontend validation is UX only.
- No secrets in the repo; configuration via environment variables.

---

## 2. Frontend Design

**Stack:** React + TypeScript + TailwindCSS, built with Vite.

**Structure (feature-light, page-oriented):**
```
frontend/src/
├── api/
│   ├── client.ts          # fetch wrapper: base URL, JSON, error normalization
│   ├── tickets.ts         # ticket endpoints (list/get/create/update/status/comment)
│   └── users.ts           # list seeded users (assignee/creator dropdowns)
├── components/
│   ├── TicketCard.tsx     # summary row in the list
│   ├── StatusBadge.tsx    # colored status pill (maps IN_PROGRESS → "In Progress")
│   ├── PriorityBadge.tsx
│   ├── SearchFilterBar.tsx# keyword input + status filter dropdown
│   ├── CommentList.tsx / CommentForm.tsx
│   ├── StatusChanger.tsx  # shows only VALID next transitions; handles 409 errors
│   ├── ErrorState.tsx / LoadingState.tsx / EmptyState.tsx
├── pages/
│   ├── TicketListPage.tsx # list + search + status filter
│   ├── TicketDetailPage.tsx # fields, comments, status control
│   └── CreateTicketPage.tsx # create form
├── types/ticket.ts        # shared DTO types mirroring the API contract
├── lib/statusTransitions.ts # client mirror of allowed transitions (UX only)
├── App.tsx                # routes
└── main.tsx               # entry
```

**State management:** local component state + a thin API layer (no Redux needed for
Core). Data is fetched per page; mutations refetch or update in place.

**Error/loading strategy (UI):** every data view has three states — loading, error
(with retry), and empty. Validation errors from the API are shown inline per field;
an invalid status transition (409) shows a clear, non-technical message near the
status control. The client keeps a mirror of allowed transitions so it only offers
valid next statuses — but the backend remains authoritative.

---

## 3. Backend Design

**Stack:** Node.js + Express + TypeScript + Prisma.

**Layered structure (module-per-resource):**
```
backend/src/
├── config/env.ts          # validated env (zod)
├── lib/prisma.ts          # PrismaClient singleton
├── middleware/
│   ├── validate.ts        # zod schema validation → 400
│   └── error.ts           # centralized error handler → consistent error shape
├── services/
│   └── statusMachine.ts   # allowed transitions + canTransition()/assertTransition()
├── modules/
│   ├── tickets/
│   │   ├── ticket.schema.ts     # zod request schemas
│   │   ├── ticket.service.ts    # business logic (uses statusMachine, prisma)
│   │   ├── ticket.controller.ts # req/res handling
│   │   └── ticket.routes.ts     # route wiring
│   ├── comments/ (schema, service, controller, routes)
│   └── users/    (list seeded users)
├── errors/AppError.ts     # typed application errors (NotFound, Validation, Conflict)
├── app.ts                 # express app assembly (json, cors, routes, error mw)
└── index.ts               # server bootstrap
```

**Request lifecycle:**
```
Request → route → validate middleware (zod) → controller → service (rules + Prisma)
       → response  |  any thrown AppError → error middleware → consistent JSON error
```

**Why this shape:** each resource is self-contained (schema/service/controller/routes),
business rules live in services (testable in isolation), and the state machine is a
single pure module — the highest-signal piece — so it can be unit- and
integration-tested directly.

---

## 4. Database Design

Full detail in `data-model.md`. Summary:

- **PostgreSQL** via **Prisma**; schema in `backend/prisma/schema.prisma`, migrations
  in `backend/prisma/migrations/`, seed in `backend/prisma/seed.ts`.
- Entities: **User** (seeded), **Ticket**, **Comment**.
- Enums: **Priority** (`LOW/MEDIUM/HIGH/URGENT`), **Status**
  (`OPEN/IN_PROGRESS/RESOLVED/CLOSED/CANCELLED`).
- Relations: User 1─<Ticket (createdBy, assignedTo), Ticket 1─<Comment (cascade).
- Indexes on `Ticket.status` and `Ticket.assignedToId` for filtering.
- UUID primary keys; `createdAt`/`updatedAt` managed by Prisma.

---

## 5. API Design

Full contract in `api-contract.md`. Summary of endpoints (prefix `/api`):

| Method | Path                      | Purpose |
| ------ | ------------------------- | ------- |
| GET    | `/health`                 | Liveness |
| GET    | `/users`                  | List seeded users |
| GET    | `/tickets`                | List + `?q=` search + `?status=` filter |
| POST   | `/tickets`                | Create ticket |
| GET    | `/tickets/:id`            | Ticket detail (with comments) |
| PATCH  | `/tickets/:id`            | Update fields (title, description, priority, assignee) |
| PATCH  | `/tickets/:id/status`     | Change status via state machine |
| POST   | `/tickets/:id/comments`   | Add comment |

**Conventions:** JSON in/out; resource ids are UUID path params; list filters are
query params; timestamps are ISO-8601. Status is changed **only** via the dedicated
status endpoint (never via `PATCH /tickets/:id`).

**Consistent error shape:**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": { "title": "Required" } } }
```
Status codes: `200`, `201`, `400` (validation), `404` (not found),
`409` (invalid transition), `500` (unexpected).

---

## 6. Status State Machine (signature piece)

Allowed transitions (everything else is rejected with `409`):

```
        ┌───────────────┐
        │     OPEN      │
        └──┬────────┬───┘
   IN_PROGRESS   CANCELLED (terminal)
        │
        ├──────────────► CANCELLED (terminal)
        ▼
   ┌───────────┐
   │ RESOLVED  │ ──────► CLOSED (terminal)
   └───────────┘
```

| From \ To   | OPEN | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED |
| ----------- | :--: | :---------: | :------: | :----: | :-------: |
| OPEN        |  –   |     ✅      |    ❌    |   ❌   |    ✅     |
| IN_PROGRESS |  ❌  |     –       |    ✅    |   ❌   |    ✅     |
| RESOLVED    |  ❌  |     ❌      |    –     |   ✅   |    ❌     |
| CLOSED      |  ❌  |     ❌      |    ❌    |   –    |    ❌     |
| CANCELLED   |  ❌  |     ❌      |    ❌    |   ❌   |    –      |

**Design:** a single pure module maps each status to its allowed successors.
`assertTransition(from, to)` throws a `ConflictError` (→ 409) for any pair not in the
map (including same-status and any move out of a terminal state). The service layer
calls it before persisting a status change. This keeps the rule in one place, easy to
read, and directly testable — the mandatory integration tests assert every valid and
representative invalid transition.

---

## 7. Validation Strategy

- **Schema validation at the edge** with zod (`validate` middleware) for body/params/
  query → `400` with field-level `details`.
- **Referential checks** in the service (e.g. `assignedTo`/`createdBy` must exist) →
  `400`/`422`.
- **State-machine validation** in the service before status writes → `409`.
- **DB-level integrity** via enums, unique email, and FKs as a final backstop.
- The **frontend mirrors** required fields and allowed transitions for UX, but never
  as the authority.

---

## 8. Error Handling Strategy

- A small set of typed errors (`ValidationError`, `NotFoundError`, `ConflictError`)
  extend a base `AppError` carrying an HTTP status + machine-readable `code`.
- Controllers/services `throw`; a **single error middleware** converts errors to the
  consistent `{ error: {...} }` shape and status code, logging unexpected `500`s.
- No stack traces or internal details leak to clients.
- Frontend `api/client.ts` normalizes non-2xx responses into a typed error the UI can
  render (inline field errors, transition messages, retryable error states).

---

## 9. Complete Folder Structure (target)

```
JS---C1-Assignment---July-2026/
├── README.md
├── candidate-info.md
├── assessment-summary.md
├── requirements-analysis.md
├── acceptance-criteria.md
├── implementation-plan.md
├── design-notes.md              ← this file
├── data-model.md
├── api-contract.md
├── ui-flow.md
├── test-strategy.md
├── test-results.md              (M4/M6)
├── debugging-notes.md           (M6)
├── code-review-notes.md         (M6)
├── review-fixes.md              (M6)
├── pr-description.md            (M6)
├── reflection.md                (M6)
├── final-ai-usage-summary.md    (M6)
├── docker-compose.yml
├── backend/
│   ├── package.json  tsconfig.json  .env.example
│   ├── prisma/{ schema.prisma, seed.ts, migrations/ }
│   ├── src/{ config, lib, middleware, services, modules, errors, app.ts, index.ts }
│   └── tests/{ *.test.ts }
├── frontend/
│   ├── package.json  tsconfig.json  vite.config.ts  tailwind.config.js  index.html
│   └── src/{ api, components, pages, types, lib, App.tsx, main.tsx }
├── database/
│   ├── (schema/migrations live under backend/prisma)
│   ├── seed-data → backend/prisma/seed.ts
│   └── setup-notes.md
├── ai-prompts/{ planning, design, implementation, testing, debugging, code-review, documentation }.md
└── tool-specific/cursor-workflow/{ project-context, spec, tasks, acceptance-criteria, cursor-rules-or-instructions }.md
```

> Deviation from the suggested `src/`+`tests/` root: a monorepo (`backend/`,
> `frontend/`) is used so each runtime owns its own `src/`/`tests/`.

---

## 10. Testing Strategy Link

See `test-strategy.md`. Core mandatory tier: **Jest + Supertest integration tests**
that prove valid status transitions succeed and invalid ones are rejected, plus
validation/404 coverage. Unit tests for `statusMachine` and edge cases are planned
Stretch.
