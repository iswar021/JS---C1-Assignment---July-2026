# Support Ticket Management System

An AI-assisted full-stack application built for the **JS – AI Capability Exercise**
(Project option: **Support Ticket Management System — Backend-heavy**, Core tier).

Internal users create, update, comment on, search, filter, and progress support
tickets through an enforced status lifecycle (state machine). This repository
contains the application **and** the full set of lifecycle artifacts (planning,
design, testing, review, reflection, and AI-usage documentation).

> **Status: complete.** Backend and frontend are implemented, verified, and
> committed. See `implementation-plan.md` for the milestone history and
> `docs/` for the full assessment deliverables.

## Tech Stack

| Layer    | Technology                                |
| -------- | ----------------------------------------- |
| Frontend | React + TypeScript + TailwindCSS (Vite)   |
| Backend  | Node.js + Express + TypeScript            |
| Database | PostgreSQL + Prisma ORM                   |
| Testing  | Jest + Supertest (integration & unit)     |
| Tooling  | Node 20 (`.nvmrc`), Docker (PostgreSQL)   |

## Feature Overview

- Create, view, update, and edit tickets (title, description, priority, assignee)
- Assign / unassign tickets to seeded users
- Add comments to tickets
- Search (keyword) + filter (status, priority, assignee) + sort + pagination
- Enforced status state machine (`OPEN → IN_PROGRESS → RESOLVED → CLOSED`, plus
  `CANCELLED`), authoritative on the backend, mirrored in the UI for UX
- Consistent JSON error contract; loading / empty / error / success UI states
- Backend-authoritative validation (Zod) with field-level error details

## Repository Structure

```
.
├── README.md                     # This file — start here
├── candidate-info.md             # Candidate & submission metadata
├── assessment-summary.md         # Assessment requirements summary
├── requirements-analysis.md      # Functional / non-functional requirements
├── acceptance-criteria.md        # Testable acceptance criteria
├── implementation-plan.md        # Milestones, tasks, risks
├── design-notes.md               # Original architecture & design document
├── data-model.md                 # Entities, relations, enums
├── api-contract.md               # REST endpoint contract
├── ui-flow.md                    # Frontend screens & flows
├── docs/                         # Final assessment deliverables (see index below)
├── backend/                      # Express + TS API + Prisma
├── frontend/                     # React + TS + Tailwind app
├── database/                     # Setup notes (schema/migrations live in backend/prisma)
└── docker-compose.yml            # Local PostgreSQL
```

> **Layout note:** the assessment template suggests `src/` and `tests/` at the
> root. This project uses a **monorepo** layout (`backend/`, `frontend/`) so each
> runtime owns its own `src/` and `tests/`. This is the only intentional
> deviation from the suggested structure.

## Prerequisites

- [Node.js 20](https://nodejs.org/) — run `nvm use` to respect `.nvmrc`
- [Docker](https://www.docker.com/) — to run PostgreSQL locally without a native install

## Quick Start

```bash
# 1. Use the pinned Node version
nvm use                        # Node 20

# 2. Start PostgreSQL (Docker)
docker compose up -d db        # or: docker-compose up -d db

# 3. Backend  (terminal 1)
cd backend
cp .env.example .env           # DATABASE_URL points at the Docker DB by default
npm install
npm run prisma:generate        # generate Prisma client
npm run prisma:migrate         # apply schema (creates tables)
npm run seed                   # load sample users + tickets
npm run dev                    # API on http://localhost:4000

# 4. Frontend (terminal 2)
cd frontend
cp .env.example .env           # VITE_API_URL defaults to http://localhost:4000/api
npm install
npm run dev                    # UI on http://localhost:5173
```

Detailed steps and troubleshooting: **[docs/installation-guide.md](docs/installation-guide.md)**
and **[docs/environment-setup.md](docs/environment-setup.md)**.

## Verification

```bash
# Backend
cd backend && npm run build && npm run lint && npm test   # 68 tests

# Frontend
cd frontend && npm run build && npm run lint
```

## Documentation Index

Final assessment deliverables live in **`docs/`**:

| Document | Description |
| -------- | ----------- |
| [Installation Guide](docs/installation-guide.md) | Step-by-step local setup |
| [Environment Setup](docs/environment-setup.md) | Env vars, Docker, Node, tooling |
| [Project Architecture](docs/architecture.md) | As-built architecture & layering |
| [API Documentation](docs/api-documentation.md) | Endpoints, requests, responses, errors |
| [Database Design](docs/database-design.md) | Schema, relations, indexes, migrations |
| [Testing Strategy](docs/testing-strategy.md) | What is tested and why + results |
| [AI Usage Workflow](docs/ai-usage-workflow.md) | How AI was used across the lifecycle |
| [Design Decisions](docs/design-decisions.md) | Key decisions and trade-offs |
| [Code Review Notes](docs/code-review-notes.md) | Final review findings |
| [Bug Fix Summary](docs/bug-fix-summary.md) | Issues found and fixed |
| [Reflection](docs/reflection.md) | What worked, what I'd change |
| [Final AI Usage Summary](docs/final-ai-usage-summary.md) | Consolidated AI-usage report |
| [Requirement Checklist](docs/requirement-checklist.md) | Assessment coverage checklist |

Supporting planning artifacts at the repository root: `requirements-analysis.md`,
`acceptance-criteria.md`, `design-notes.md`, `data-model.md`, `api-contract.md`,
`ui-flow.md`.

## Security

No secrets are committed. Configuration is provided via environment variables
(`backend/.env.example`, `frontend/.env.example`). CORS is restricted to the
configured frontend origin; validation is backend-authoritative; client errors
never leak stack traces.
