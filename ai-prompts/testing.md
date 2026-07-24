# AI Prompts — Testing

Representative prompts used to define and implement the test suite.

---

## Prompt 1 — Strategy

> Write a test strategy for Core: Jest + Supertest integration tests must prove
> valid status transitions succeed and invalid ones are rejected. Prefer fast,
> deterministic tests. Document what is unit-tested vs integration-tested and
> what is deferred as Stretch.

**Outcome:** `test-strategy.md`, `docs/testing-strategy.md`.

---

## Prompt 2 — Transition matrix tests

> Add integration tests for `PATCH /api/tickets/:id/status` covering every valid
> transition (200) and representative invalid transitions (409 INVALID_TRANSITION),
> plus 404 and 400 cases. Prefer `it.each`. Assert the repository write does not
> happen on invalid transitions.

**Outcome:** `backend/tests/tickets.status.test.ts` + `statusMachine.test.ts`.

---

## Prompt 3 — Endpoint coverage

> Write integration tests for create, list, filters, details, update, assign,
> comments, and users list. Mock repositories; exercise the real Express stack.

**Outcome:** 11 suites, 68 passing tests.

---

## Prompt 4 — Record results

> Capture the latest `npm test` output and schema verification in `test-results.md`.

**Outcome:** `test-results.md`.
