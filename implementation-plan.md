# Implementation Plan

## Overview

Build the **Support Ticket Management System (Core)** as a TypeScript monorepo and,
alongside it, produce the full set of lifecycle artifacts the assessment requires.
Work proceeds in **reviewable milestones**; each milestone is built, reviewed,
committed with a meaningful message, and pushed before the next begins.

**Stack:** React + TypeScript + TailwindCSS (Vite) · Node.js + Express + TypeScript ·
PostgreSQL + Prisma · Jest + Supertest · Node 20 · Docker (Postgres).

**Guiding principles**
- Backend is authoritative for validation and the status state machine.
- The state machine lives in one isolated, unit-/integration-testable service.
- Setup must be reproducible from the README on a clean machine.
- No secrets committed; config via `.env` (`.env.example` checked in).
- Artifacts and prompt history are first-class, not an afterthought.

## Architecture (target)

```
Browser (React + Tailwind)
        │  HTTP/JSON
        ▼
Express API (TypeScript)
  routes → controllers → services → Prisma
                         │
                         ▼
                   PostgreSQL (Docker)
```

- **Controllers**: parse/validate requests, shape responses.
- **Services**: business logic, incl. `statusMachine` (allowed transitions).
- **Data access**: Prisma client; migrations define the schema.
- **Validation**: schema validation at the edge (e.g. zod) → 400 with details.
- **Errors**: centralized error middleware → consistent `{ error: {...} }` shape.

## Task Breakdown

### M1 — Foundation & assessment docs  ← current
- Repo tooling: `.nvmrc` (Node 20), `.gitignore`.
- Assessment summary, requirement analysis, acceptance criteria, this roadmap.
- README skeleton, candidate info.
- **Build/verify:** N/A (docs only). **Exit:** committed + pushed.

### M2 — Backend foundation
- `backend/` Express + TS scaffold (`tsconfig`, scripts, structure).
- Prisma schema: `User`, `Ticket`, `Comment`, enums `Priority`, `Status`.
- `docker-compose.yml` for PostgreSQL; `.env.example`.
- First migration + seed script (seeded users + sample tickets/comments).
- **Build/verify:** `npm run build`, `prisma migrate`, `npm run seed` succeed.
- **Docs:** `data-model.md`, `database/setup-notes.md`.

### M3 — Backend API
- CRUD: create/list/get/update ticket; add/list comments.
- Dedicated `PATCH /tickets/:id/status` enforcing the state machine.
- Input validation + centralized error handling + consistent error shape.
- Keyword search + status filter on list endpoint.
- **Build/verify:** manual API checks (curl/HTTP), build passes.
- **Docs:** `api-contract.md`, `design-notes.md`.

### M4 — Backend tests
- Jest + Supertest integration tests against a test database.
- **Mandatory:** valid transitions succeed; invalid transitions rejected (409).
- Validation/404 tests for good measure.
- **Build/verify:** `npm test` green.
- **Docs:** `test-strategy.md`, `test-results.md`.

### M5 — Frontend
- Vite React + TS + Tailwind scaffold; API client.
- Screens: ticket list (with search + status filter), ticket detail (fields,
  comments, status control), create ticket, edit/reassign.
- Meaningful error + loading states; invalid-transition messaging.
- **Build/verify:** `npm run build`; manual end-to-end click-through.
- **Docs:** `ui-flow.md`.

### M6 — Remaining artifacts & prompt history
- `debugging-notes.md`, `code-review-notes.md`, `review-fixes.md`,
  `pr-description.md`, `reflection.md`, `final-ai-usage-summary.md`.
- `ai-prompts/` (planning, design, implementation, testing, debugging,
  code-review, documentation).
- `tool-specific/cursor-workflow/` (project-context, spec, tasks,
  acceptance-criteria, cursor rules).
- **Exit:** repo matches required structure; final review.

## Milestones (summary)

| Milestone | Deliverable | Definition of done | Commit prefix |
| --------- | ----------- | ------------------ | ------------- |
| M1 | Docs + roadmap + tooling | Committed & pushed | `docs:` |
| M2 | Backend + DB foundation | Build + migrate + seed OK | `feat(backend):` |
| M3 | REST API + state machine | Endpoints work, errors consistent | `feat(api):` |
| M4 | Integration tests | `npm test` green | `test:` |
| M5 | Frontend app | Build OK, flows work | `feat(frontend):` |
| M6 | Artifacts + prompts | Structure complete | `docs:` |

## AI Usage Plan (how Cursor is used per phase)

- **Planning/design:** draft requirement breakdown, challenge assumptions, propose
  the state-machine model; I review and correct.
- **Implementation:** generate scaffolds and handlers from the spec; I verify types,
  edge cases, and naming against conventions.
- **Testing:** generate Supertest cases from acceptance criteria; I ensure invalid
  transitions and validation are actually covered.
- **Debugging:** paste errors/stack traces for hypotheses; I validate the real fix.
- **Review:** ask for a critical review of diffs; accept/reject with reasons logged
  in `code-review-notes.md`.
- **Responsible AI:** share only code/schema needed; never real secrets or private
  data. Documented in `tool-workflow.md`.

## Risks & Mitigation

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| Default Node is v14 (too old) | Tooling breaks | Pin Node 20 via `.nvmrc`; document `nvm use` |
| No local PostgreSQL | Can't run/persist | Provide Docker Compose Postgres + setup notes |
| State-machine bugs (core signal) | Fails key criterion | Isolate logic; integration tests first (M4) |
| Frontend/backend contract drift | Integration bugs | Freeze `api-contract.md` before frontend (M3) |
| Over-building the app | Neglected artifacts | Core-only scope; artifacts tracked per milestone |
| Secrets leakage | Fails Core criterion | `.env` git-ignored; `.env.example` only |
| Branch confusion (master vs main) | Bad push | Confirm branch per milestone; show commands first |

## Definition of Done (project)

Working frontend + backend + persistent DB, reproducible setup from README,
seed data, backend validation, enforced state machine with passing integration
tests, search/filter, full artifacts and prompt history, and no committed secrets.
