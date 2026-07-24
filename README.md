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
├── tool-workflow.md              # Part A — how Cursor was used
├── assessment-summary.md         # Assessment requirements summary
├── requirements-analysis.md      # Functional / non-functional requirements
├── acceptance-criteria.md        # Testable acceptance criteria
├── implementation-plan.md        # Milestones, tasks, risks
├── design-notes.md               # Original architecture & design document
├── data-model.md · api-contract.md · ui-flow.md
├── test-strategy.md · test-results.md
├── debugging-notes.md · code-review-notes.md · review-fixes.md
├── pr-description.md · reflection.md · final-ai-usage-summary.md
├── docs/                         # As-built guides (install, API, architecture, …)
├── ai-prompts/                   # Grouped prompt history by lifecycle phase
├── tool-specific/cursor-workflow/# Cursor context, spec, tasks, rules
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

### Assessment lifecycle (repository root — Part A / Part C)

| Document | Description |
| -------- | ----------- |
| [Tool Workflow](tool-workflow.md) | Part A — Cursor usage across the lifecycle |
| [Test Strategy](test-strategy.md) | Testing approach & rationale |
| [Test Results](test-results.md) | Latest suite / build verification snapshot |
| [Debugging Notes](debugging-notes.md) | Issues found and how they were fixed |
| [Code Review Notes](code-review-notes.md) | Self-review across quality dimensions |
| [Review Fixes](review-fixes.md) | Fixes applied from review / QA |
| [PR Description](pr-description.md) | Submission PR summary & test plan |
| [Reflection](reflection.md) | What worked / what I'd change |
| [Final AI Usage Summary](final-ai-usage-summary.md) | Consolidated AI-usage report |
| [AI Prompts](ai-prompts/) | Prompt history by phase |
| [Cursor Workflow](tool-specific/cursor-workflow/) | Project context, spec, tasks, rules |

### As-built guides (`docs/`)

| Document | Description |
| -------- | ----------- |
| [Installation Guide](docs/installation-guide.md) | Step-by-step local setup |
| [Environment Setup](docs/environment-setup.md) | Env vars, Docker, Node, tooling |
| [Project Architecture](docs/architecture.md) | As-built architecture & layering |
| [API Documentation](docs/api-documentation.md) | Endpoints, requests, responses, errors |
| [Database Design](docs/database-design.md) | Schema, relations, indexes, migrations |
| [Testing Strategy](docs/testing-strategy.md) | Expanded coverage map |
| [AI Usage Workflow](docs/ai-usage-workflow.md) | Detailed AI lifecycle narrative |
| [Design Decisions](docs/design-decisions.md) | Key decisions and trade-offs |
| [Requirement Checklist](docs/requirement-checklist.md) | Assessment coverage checklist |
| [Chat History](docs/chat-history.md) | Sanitized Cursor session dialogue |
| [Chat History Index](docs/chat-history-index.md) | User-prompt table of contents |

Planning artifacts: `assessment-summary.md`, `requirements-analysis.md`,
`acceptance-criteria.md`, `implementation-plan.md`, `design-notes.md`,
`data-model.md`, `api-contract.md`, `ui-flow.md`.

## Security

No secrets are committed. Configuration is provided via environment variables
(`backend/.env.example`, `frontend/.env.example`). CORS is restricted to the
configured frontend origin; validation is backend-authoritative; client errors
never leak stack traces.
