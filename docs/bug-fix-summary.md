# Bug Fix Summary

Issues discovered and fixed across the project lifecycle, and the outcome of the
final review. Grouped by phase.

## Final-review phase (this milestone)

| # | Issue | Severity | Fix |
| - | ----- | -------- | --- |
| 1 | `README.md` referenced files that were never created (`tool-workflow.md`, `test-strategy.md`) and had an unfinished "commands added as milestones land" Quick Start. | Low (docs) | Rewrote README with verified commands, accurate structure, and a `docs/` index. |
| 2 | Documentation set required by the assessment was incomplete. | Medium (deliverable) | Added the full `docs/` set (installation, environment, architecture, API, database, testing, AI workflow, design decisions, review, bug fixes, reflection, AI summary, checklist). |

**Functional code:** the final review found **no must-fix defects** in backend or
frontend. Build, lint, type-check, tests (68), schema validation, and migration
drift all pass. Remaining items are optional enhancements (see
[Code Review Notes](code-review-notes.md) and [Reflection](reflection.md)).

## Earlier milestones (fixed as they arose)

| # | Issue | Fix |
| - | ----- | --- |
| 3 | Permissive CORS (`cors()` allowed all origins) — security risk. | Restricted to `CORS_ORIGIN` (comma-separated), defaulting to the Vite dev origin. |
| 4 | Zod object-level errors (e.g. "≥ 1 field required", unknown keys) were dropped — only field errors surfaced. | `formatZodError` now also returns `formErrors` under `_errors`. |
| 5 | `updateTicketSchema` uses `.refine()` (a `ZodEffects`), incompatible with the middleware's `AnyZodObject` typing. | `validate` middleware generalized to accept `ZodTypeAny`. |
| 6 | Tests failed because importing `app` constructed `PrismaClient` and demanded a real `DATABASE_URL`. | Added `tests/jest.setup.ts` (sets `NODE_ENV=test` + placeholder URL); repositories are mocked, so no query runs. |
| 7 | Referential integrity: unknown `createdById`/`assignedToId`/comment author would surface as a raw DB FK error. | Centralized `assertUserExists` guard → field-scoped `400 VALIDATION_ERROR`. |
| 8 | Express (newer) exposes `req.query` as read-only, breaking in-place assignment of validated/coerced query. | Store parsed `query`/`params` on `res.locals`. |
| 9 | Frontend build emitted `react-refresh/only-export-components` warnings and Prettier drift. | Moved a shared constant out of a component file; allowed context hook exports in the react-refresh rule; ran Prettier — build/lint now warning-free. |
| 10 | Prisma `P2025`/`P2002` errors returned generic 500s. | Error middleware maps them to `404`/`409`. |

## Environment/process issues (worked around, not code bugs)

| Issue | Handling |
| ----- | -------- |
| Docker daemon / local PostgreSQL unavailable in the sandbox. | Verified offline: `prisma validate`, `prisma migrate diff` (zero drift), mocked-repo integration tests. DB apply is a documented one-command step for the reviewer. |
| Personal Access Token pasted into chat. | **Refused to use it**; advised immediate revocation + rotation. No secret entered the repo. |
| `nvm` sourcing exit codes / Docker CLI v1 vs v2 flag differences. | Handled in command sequencing; documented `docker compose` vs `docker-compose` in the install guide. |
