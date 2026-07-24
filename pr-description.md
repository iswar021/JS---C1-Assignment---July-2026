# Pull Request Description

## Title

`feat: Support Ticket Management System (Core) — full stack + assessment artifacts`

## Summary

Delivers the **Support Ticket Management System** for the JS AI Capability
Exercise (Core, backend-heavy), plus the full lifecycle documentation, prompt
history, and Cursor workflow pack.

- **Backend:** Express + TypeScript + Prisma — tickets, comments, users, search,
  filters, sort, pagination, assign, status state machine, consistent errors.
- **Frontend:** React + TypeScript + Tailwind — list/detail/create/edit, assign,
  comments, search/filter/pagination, loading/empty/error/success states.
- **Data:** PostgreSQL schema + migration + idempotent seed (Docker Compose).
- **Tests:** Jest + Supertest — **68 tests**, including mandatory valid/invalid
  status transitions.
- **Artifacts:** Part A tool workflow, planning/design docs, test strategy/results,
  debugging, review, reflection, AI usage summary, `ai-prompts/`,
  `tool-specific/cursor-workflow/`.

## Milestone commits (representative)

1. `docs: summarize assessment requirements and implementation roadmap`
2. `feat(api): implement create ticket endpoint`
3. `feat(api): implement ticket listing`
4. `feat(api): implement ticket details endpoint`
5. `feat(api): implement ticket update endpoint`
6. `feat(api): complete backend implementation`
7. `feat(frontend): complete ticket management interface`
8. `docs: finalize project and assessment deliverables`
9. _(this PR)_ remaining assessment docs: prompt history, Cursor workflow, root
   lifecycle filenames

## Test plan

- [ ] `cd backend && npm install && cp .env.example .env`
- [ ] `docker compose up -d db` (or `docker-compose up -d db`)
- [ ] `npm run prisma:generate && npm run prisma:migrate && npm run seed`
- [ ] `npm run build && npm run lint && npm test` → 68 passing
- [ ] `npm run dev` → `GET /health` returns `{ "status": "ok" }`
- [ ] `cd frontend && npm install && cp .env.example .env`
- [ ] `npm run build && npm run lint`
- [ ] `npm run dev` → open http://localhost:5173
- [ ] Create ticket → appear in list → change status along allowed path → add comment
- [ ] Attempt invalid status transition → UI/API show clear error (409)
- [ ] Search + status/priority/assignee filters + pagination behave as expected

## Risk / notes

- Auth is intentionally out of Core (“Acting as” user switcher stands in for
  `createdBy`).
- Frontend automated tests are Stretch; FE is verified via `tsc` + Vite build + ESLint.
- Live migrate/seed require Docker/Postgres on the reviewer’s machine.

## Docs index for reviewers

Start at `README.md` → `tool-workflow.md` → `docs/requirement-checklist.md` →
`reflection.md` → `final-ai-usage-summary.md`.
