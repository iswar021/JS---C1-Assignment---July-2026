# Cursor Workflow — Project Context

Standing context for Cursor agents working in this repository.

## Product

Support Ticket Management System (Core tier, backend-heavy) for the JS AI
Capability Exercise. Internal users create/list/view/update tickets, assign them,
add comments, search/filter, and progress status through an enforced state machine.

## Stack

| Layer | Tech |
| ----- | ---- |
| Frontend | React 18 + TypeScript + TailwindCSS + Vite + React Router |
| Backend | Node 20 + Express + TypeScript + Zod + Prisma |
| DB | PostgreSQL 16 (Docker Compose) |
| Tests | Jest + Supertest |

## Repository layout

```
backend/          Express API + Prisma + tests
frontend/         React app
database/         setup-notes (schema lives in backend/prisma)
docs/             As-built guides
ai-prompts/       Grouped prompt history
tool-specific/    Cursor workflow pack (this folder)
*.md (root)       Assessment lifecycle artifacts
```

Monorepo is an intentional deviation from a single root `src/`.

## Non-goals (Core)

- Authentication / authorization (use “Acting as” user switcher instead)
- User CRUD UI (users are seeded)
- Real-time / websockets
- Multi-tenancy

## Agent rules

1. Explain plan before coding.
2. Incremental milestones; do not regenerate the whole app.
3. Prefer smallest change that solves the request.
4. No secrets in repo or chat consumption of pasted tokens.
5. After code changes: build + lint (+ tests for backend) before claiming done.
6. Commit only when asked; stage only milestone-related files.
