# Requirement Checklist

Confirms coverage of the assessment requirements. Legend: ✅ done · 🟡 optional /
stretch. See `acceptance-criteria.md` (root) for the testable criteria.

## Functional requirements

| # | Requirement | Status | Where |
| - | ----------- | :----: | ----- |
| 1 | Create ticket (title, description, priority) | ✅ | `POST /api/tickets`; CreateTicketPage |
| 2 | List tickets | ✅ | `GET /api/tickets`; TicketListPage |
| 3 | View ticket details (with comments) | ✅ | `GET /api/tickets/:id`; TicketDetailPage |
| 4 | Update ticket fields | ✅ | `PATCH /api/tickets/:id`; EditTicketPage |
| 5 | Assign / unassign ticket | ✅ | `PATCH /api/tickets/:id/assign`; AssigneeControl |
| 6 | Add comment | ✅ | `POST /api/tickets/:id/comments`; CommentForm |
| 7 | Search (keyword) | ✅ | `?q=`; debounced search in SearchFilterBar |
| 8 | Filter (status, priority, assignee) | ✅ | query filters; SearchFilterBar |
| 9 | Sort + pagination | ✅ | `sortBy/sortOrder/page/pageSize`; Pagination |
| 10 | Status lifecycle via state machine | ✅ | `PATCH /api/tickets/:id/status`; statusMachine |
| 11 | Reject invalid transitions | ✅ | `409 INVALID_TRANSITION`; StatusChanger offers valid only |

## Backend quality

| Requirement | Status | Notes |
| ----------- | :----: | ----- |
| Node + Express + TypeScript | ✅ | Strict TS |
| PostgreSQL + Prisma | ✅ | Schema, migration, idempotent seed |
| Layered architecture | ✅ | routes → controllers → services → repositories |
| Input validation | ✅ | Zod at edge + referential checks in services |
| Consistent error handling | ✅ | Typed errors + centralized middleware |
| State machine enforced server-side | ✅ | Pure module; authoritative |
| Integration tests (Jest + Supertest) | ✅ | 11 suites / 68 tests |
| Transition tests (valid + invalid) | ✅ | Exhaustive `it.each` |

## Frontend quality

| Requirement | Status | Notes |
| ----------- | :----: | ----- |
| React + TypeScript + TailwindCSS | ✅ | Vite |
| All pages implemented | ✅ | List, Detail, Create, Edit |
| Loading / empty / error states | ✅ | `states.tsx` used across views |
| Success notifications | ✅ | ToastContext |
| Form validation | ✅ | Client-side + server error mapping |
| Responsive UI | ✅ | Tailwind responsive layouts |
| Accessibility | ✅ | Labels, aria-invalid/describedby, roles, aria-live |
| Connected to backend APIs | ✅ | `api/` + hooks |
| Builds without warnings | ✅ | `tsc && vite build`; ESLint 0 warnings |

## Engineering & process

| Requirement | Status | Notes |
| ----------- | :----: | ----- |
| No secrets committed | ✅ | `.env` ignored; templates only |
| Restricted CORS | ✅ | `CORS_ORIGIN` |
| Reproducible installs | ✅ | Pinned Node (`.nvmrc`) + lockfiles |
| Meaningful, milestone-scoped commits | ✅ | See git history |
| Documentation | ✅ | Root lifecycle docs + `docs/` as-built guides |
| Prompt history (`ai-prompts/`) | ✅ | planning → documentation phases |
| Cursor workflow pack | ✅ | `tool-specific/cursor-workflow/` |
| Part A tool workflow | ✅ | `tool-workflow.md` |

## Verification (this phase)

| Check | Result |
| ----- | ------ |
| Backend `npm run build` | ✅ pass |
| Backend `npm run lint` | ✅ 0 problems |
| Backend `npm test` | ✅ 68/68 |
| Frontend `npm run build` | ✅ no TS errors, no warnings |
| Frontend `npm run lint` | ✅ 0 problems |
| `prisma validate` | ✅ valid |
| Migration drift (`migrate diff`) | ✅ zero drift |
| DB `migrate deploy` + `seed` (live) | 🟡 not run in-session (no Docker/DB); documented one-command steps for the reviewer |

## Optional improvements to raise the score

1. **Frontend tests** — React Testing Library (forms, StatusChanger, hooks) + a
   Playwright happy-path E2E. Biggest remaining coverage gap.
2. **DB-backed integration tests** — run Supertest suites against real Postgres
   (Testcontainers) in CI alongside the fast mocked variant.
3. **CI pipeline** — build + lint + test both runtimes on every push.
4. **React Query** — caching, background refetch, optimistic updates.
5. **Security hardening (beyond Core)** — auth/authorization, `helmet`, rate limiting.
6. **DB indexing at scale** — `@@index([priority])` / composite sort index;
   trigram/full-text search for large keyword volumes.
7. **Observability** — structured request logging + error tracking.
8. **OpenAPI/Swagger** generated from the Zod schemas for live API docs.
