# Cursor Workflow — Acceptance Criteria

Cursor-oriented checklist derived from `acceptance-criteria.md`.

## Backend

- [x] Create / list / get / update ticket
- [x] Assign / unassign ticket
- [x] Add comment
- [x] Search (`q`) + filter (status, priority, assignee) + sort + pagination
- [x] Status changes only via dedicated endpoint
- [x] Valid transitions succeed; invalid rejected with 409
- [x] Zod validation → 400 with field details
- [x] Unknown user references → 400 (not raw FK)
- [x] Missing ticket → 404
- [x] Consistent `{ error }` shape
- [x] Prisma migration + seed
- [x] Jest + Supertest covering transitions and endpoints

## Frontend

- [x] List with search, filters, pagination
- [x] Detail with status actions, assign, comments
- [x] Create + edit forms with validation
- [x] Loading / empty / error / success states
- [x] Responsive layout + basic a11y
- [x] Builds with no TS errors / no Vite warnings

## Artifacts

- [x] README with setup
- [x] `tool-workflow.md` (Part A)
- [x] Planning / design docs
- [x] `test-strategy.md` + `test-results.md`
- [x] `debugging-notes.md`, `code-review-notes.md`, `review-fixes.md`
- [x] `pr-description.md`, `reflection.md`, `final-ai-usage-summary.md`
- [x] `ai-prompts/*`
- [x] `tool-specific/cursor-workflow/*`

## Reviewer smoke test

- [ ] Docker DB up → migrate → seed → API + UI run
- [ ] Invalid status transition visibly rejected
