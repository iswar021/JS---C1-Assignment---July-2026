# Project Architecture (As-Built)

This document describes the architecture **as implemented and verified**. For the
original design rationale see `design-notes.md` at the repo root.

## 1. High-level view

A three-tier, single-repo (monorepo) application:

```
┌──────────────────────────────┐     HTTP / JSON      ┌───────────────────────────────┐
│  Frontend (React + TS)       │  ──────────────────► │  Backend API (Express + TS)   │
│  Vite · TailwindCSS          │  ◄────────────────── │  routes → controllers →       │
│  pages · components · api/   │     JSON responses   │  services → repositories      │
└──────────────────────────────┘                      └───────────────┬───────────────┘
                                                                       │ Prisma Client
                                                                       ▼
                                                             ┌────────────────────┐
                                                             │ PostgreSQL (Docker) │
                                                             └────────────────────┘
```

- **Frontend** holds no business rules — it renders state, collects input, and
  calls the API. It mirrors the status state machine only for UX (offering valid
  actions); the backend remains authoritative.
- **Backend** is the single source of truth: it validates every request and
  enforces the status state machine and referential integrity.
- **Database** provides durable persistence and enum/FK-level integrity.

## 2. Backend layering (module-per-resource)

```
backend/src/
├── config/env.ts            # Zod-validated environment (fail-fast at startup)
├── lib/prisma.ts            # PrismaClient singleton
├── middleware/
│   ├── validate.ts          # body/query/params validation (Zod) → 400 + details
│   ├── error.ts             # centralized error handler + notFoundHandler
│   └── logger.ts            # request logger (silent in tests)
├── services/
│   └── statusMachine.ts     # pure state-machine module (allowed transitions)
├── modules/
│   ├── tickets/  { schema, repository, service, mapper, controller, routes }
│   ├── comments/ { schema, repository, service, mapper, controller, routes }
│   └── users/    { repository, service, mapper, guards, controller, routes }
├── errors/AppError.ts       # typed errors: AppError, Validation, NotFound, Conflict
├── app.ts                   # app assembly (cors, json, logger, routes, error mw)
└── index.ts                 # server bootstrap
```

### Request lifecycle

```
Request
  → route
  → validate middleware (Zod)         # schema errors → 400 with field details
  → controller (thin: req/res only)
  → service (business rules)          # referential checks, state machine
  → repository (Prisma data access)
  → response
        │
        └─ any thrown AppError ─► error middleware ─► consistent { error } JSON
```

**Responsibilities per layer**

| Layer       | Responsibility | Does NOT do |
| ----------- | -------------- | ----------- |
| Route       | Wire path + validators + controller | Logic |
| Controller  | Read validated input, call service, send response | Business rules, DB access |
| Service     | Business rules, orchestration, state machine, referential checks | HTTP concerns, raw SQL |
| Repository  | Prisma queries, includes, pagination | Business rules |
| Mapper      | Prisma entity → API DTO shape | Data access |

This is a clean, layered architecture with a one-way dependency flow
(routes → controllers → services → repositories), keeping HTTP concerns out of
business logic and business logic out of data access.

## 3. Frontend structure (as-built)

```
frontend/src/
├── api/
│   ├── client.ts            # fetch wrapper; normalizes errors → typed ApiError
│   ├── tickets.ts           # list/get/create/update/assign/status/comment
│   └── users.ts             # list seeded users
├── context/
│   ├── CurrentUserContext.tsx  # "acting as" user (supplies createdBy)
│   └── ToastContext.tsx        # success/error notifications (aria-live)
├── hooks/
│   ├── useTickets.ts        # filter-driven list fetch + refetch
│   ├── useTicket.ts         # single ticket + 404 flag
│   └── useDebounce.ts       # debounced search input
├── lib/
│   ├── format.ts            # labels (status/priority), date formatting
│   └── statusMachine.ts     # client mirror of allowed transitions (UX only)
├── components/
│   ├── ui/ { Button, Spinner, fields }   # primitives
│   ├── StatusBadge, PriorityBadge
│   ├── states.tsx           # LoadingState / ErrorState / EmptyState
│   ├── SearchFilterBar, Pagination, TicketCard
│   ├── TicketForm           # shared by Create + Edit
│   ├── CommentList, CommentForm
│   ├── StatusChanger, AssigneeControl
│   └── Layout               # header + "acting as" switcher
├── pages/ { TicketListPage, TicketDetailPage, CreateTicketPage, EditTicketPage }
├── types/index.ts           # DTO types mirroring the API
├── App.tsx                  # providers + routes
└── main.tsx                 # entry (BrowserRouter)
```

**State management:** local component state + custom hooks + two small contexts
(current user, toasts). No Redux — appropriate for the Core scope. Data is fetched
per page via hooks; mutations either update state in place (status/assign return
the updated ticket) or refetch (comments).

**UI state coverage:** every data view has loading, error (with retry), and empty
states; every mutation surfaces a success or error toast.

## 4. Cross-cutting concerns

- **Type safety end-to-end:** TypeScript both tiers; Prisma-generated types on the
  backend; DTO types on the frontend mirror the API contract.
- **Validation:** Zod at the backend edge (authoritative) + lightweight client-side
  form validation (UX). See [API Documentation](api-documentation.md).
- **Error handling:** typed `AppError` hierarchy + one centralized middleware →
  consistent `{ error: { code, message, details? } }`. The frontend `ApiError`
  mirrors this and drives inline field errors + toasts.
- **Security:** restricted CORS, no secrets committed, no stack traces to clients,
  backend-authoritative validation. See [Design Decisions](design-decisions.md).
- **Performance:** indexed filter columns, `$transaction` for list+count, `select`
  narrowing on relation includes, debounced search, paginated lists.

## 5. The status state machine (signature piece)

A single pure module (`services/statusMachine.ts`) maps each status to its allowed
successors. The service calls `canTransition(from, to)` before persisting; any
disallowed pair (including same-status and any move out of a terminal state) throws
a `ConflictError` → HTTP 409. The frontend imports an equivalent mirror to only
offer valid actions, but never bypasses the backend check.

```
OPEN ──► IN_PROGRESS ──► RESOLVED ──► CLOSED (terminal)
  │            │
  └──► CANCELLED (terminal) ◄──┘
```

Full transition matrix: `design-notes.md` §6 and [API Documentation](api-documentation.md).
