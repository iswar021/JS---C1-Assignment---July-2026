# Test Strategy

Testing approach and coverage rationale for the Support Ticket Management System.

Expanded narrative: `docs/testing-strategy.md`. Results: `test-results.md`.

---

## 1. Goals

1. Prove the **status state machine** — valid transitions succeed; invalid ones are
   rejected with a clear `409 INVALID_TRANSITION` (assessment-mandatory).
2. Prove the **HTTP contract** — status codes, error shape, validation details.
3. Keep tests **fast and deterministic** without requiring a live database in CI.

## 2. Approach

| Tier | Tooling | What it covers | What is mocked |
| ---- | ------- | -------------- | -------------- |
| Unit | Jest | Pure `statusMachine` (allowed / disallowed / terminal) | Nothing (pure) |
| Integration (HTTP) | Jest + Supertest | Routes → validate → controller → service → mapper → error handler | Repository layer only |

**Why mock repositories?** Exercising the real Express stack still validates
business rules and the API contract. Skipping a live DB keeps tests runnable in
sandboxes without Docker and keeps runtime ~2s for 68 tests.

## 3. What we deliberately test

- Every **allowed** status transition (200 + `updateStatus` called).
- Representative **invalid** transitions: skip-ahead, self-transition, reverse,
  leave-terminal (409 + no DB write).
- Schema validation (400 + field `details`).
- Referential validation (unknown user ids → 400, not raw FK errors).
- Not-found paths (404) and unmatched routes.
- List filters, sort, pagination shape.
- Create / update / assign / comment happy paths and failure paths.

## 4. What we deferred (Stretch)

- Frontend unit / component tests (RTL).
- End-to-end browser tests (Playwright).
- DB-backed integration tests (Testcontainers) alongside the mocked suite.

Rationale: Core judgment weights **backend state-machine behaviour** and
**visible AI workflow artifacts**. Frontend automated tests are listed as
optional score-raisers in `docs/requirement-checklist.md`.

## 5. How to run

```bash
cd backend
npm test           # 11 suites, 68 tests
npm run test:watch
```

Frontend verification (compile + lint, not unit tests):

```bash
cd frontend
npm run build && npm run lint
```
