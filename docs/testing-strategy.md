# Testing Strategy

## 1. Philosophy

Test the **behavior that matters** at the layer where it's cheapest and most
reliable to assert:

- **Integration tests (Supertest)** exercise the real Express stack — routing,
  validation middleware, controllers, services, mappers, and the error handler —
  by making HTTP requests. Only the **repository layer is mocked**, so business
  rules and the HTTP contract are tested end-to-end without needing a live
  database. This keeps tests fast and deterministic while still covering the code
  paths that a real request travels.
- **Unit tests** cover the pure state-machine module directly (the highest-signal
  piece of domain logic).

## 2. Tooling & setup

- **Jest** + **ts-jest** (`tsconfig.test.json`), `--runInBand` for stable ordering.
- `tests/jest.setup.ts` sets `NODE_ENV=test` (silences the request logger) and a
  placeholder `DATABASE_URL` so `PrismaClient` can be constructed on import. **No
  real query runs** — repositories are mocked per suite.
- `clearMocks: true` isolates suites; each test seeds its own mock return values.

Run:

```bash
cd backend
npm test           # all suites
npm run test:watch # watch mode
```

## 3. Coverage map (11 suites · 68 tests, all passing)

| Suite | Focus |
| ----- | ----- |
| `statusMachine.test.ts` | Unit: every allowed transition true; disallowed/terminal/self false; `isTerminal` |
| `tickets.status.test.ts` | State machine over HTTP: 5 valid (200), 7 invalid (409 `INVALID_TRANSITION`), 404, 400 |
| `tickets.create.test.ts` | Create 201; 400 on missing/invalid fields; unknown user references |
| `tickets.list.test.ts` | Pagination shape, page/pageSize, default sort |
| `tickets.listfilters.test.ts` | Status/priority/assignee filters + sorting |
| `tickets.details.test.ts` | 200 with comments; 404 missing; 400 malformed id |
| `tickets.update.test.ts` | 200 update; 400 empty body / unknown key / invalid value / unknown assignee; 404 |
| `tickets.assign.test.ts` | Assign & unassign (200); 400 unknown assignee; 404 |
| `comments.create.test.ts` | 201 add comment; 400 empty message / unknown author; 404 ticket |
| `users.list.test.ts` | 200 list; consistent 404 for unmatched routes |
| `health.test.ts` | Liveness probe |

## 4. What the mandatory state-machine tests assert

The assessment explicitly requires proving valid transitions succeed and invalid
ones are rejected. `tickets.status.test.ts` does this exhaustively via `it.each`:

- **Valid (200):** `OPEN→IN_PROGRESS`, `OPEN→CANCELLED`, `IN_PROGRESS→RESOLVED`,
  `IN_PROGRESS→CANCELLED`, `RESOLVED→CLOSED` — and asserts the repository's
  `updateStatus` was called.
- **Invalid (409 `INVALID_TRANSITION`):** skips forward (`OPEN→RESOLVED/CLOSED`),
  self-transition (`OPEN→OPEN`), backward (`RESOLVED→IN_PROGRESS`), and moves out
  of terminal states (`CLOSED→OPEN`, `CANCELLED→IN_PROGRESS`) — and asserts the DB
  write **never** happens.
- **Guards:** `404` for a missing ticket, `400 VALIDATION_ERROR` for an invalid
  status value (rejected before any repository call).

## 5. Validation & error-contract coverage

Across suites, tests assert the consistent error shape and codes: `400
VALIDATION_ERROR` (with field-scoped `details`), `404 NOT_FOUND`, `409`
(`INVALID_TRANSITION` / `CONFLICT`). Referential checks (unknown `createdById` /
`assignedToId` / comment author) are verified to return `400` rather than leaking a
DB foreign-key error.

## 6. Frontend testing

The frontend is verified by the **TypeScript compiler + production build**
(`tsc && vite build`) and **ESLint** (0 warnings). Component/E2E tests
(React Testing Library / Playwright) are a documented **Stretch** improvement (see
[Design Decisions](design-decisions.md) and [Reflection](reflection.md)); they were
scoped out of Core to focus effort on the backend-authoritative logic the
assessment weights most.

## 7. Results snapshot

```
Test Suites: 11 passed, 11 total
Tests:       68 passed, 68 total
Time:        ~1.8 s
```

Reproduce: `cd backend && npm test`.
