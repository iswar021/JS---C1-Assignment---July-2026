# Support Ticket Management System

An AI-assisted full-stack application built for the **JS – AI Capability Exercise**
(Project option: **Support Ticket Management System — Backend-heavy**, Core tier).

Internal users create, update, comment on, search, and progress support tickets
through an enforced status lifecycle (state machine). This repository contains the
application **and** the full set of lifecycle artifacts (planning, design, testing,
debugging, review, reflection, and AI prompt history).

> Status: built incrementally in milestones. See `implementation-plan.md` for the
> milestone breakdown and current progress.

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | React + TypeScript + TailwindCSS (Vite)      |
| Backend   | Node.js + Express + TypeScript               |
| Database  | PostgreSQL + Prisma ORM                       |
| Testing   | Jest + Supertest (integration)                |
| Tooling   | Node 20 (`.nvmrc`), Docker (PostgreSQL)       |

## Repository Structure

```
.
├── README.md                     # This file
├── candidate-info.md             # Candidate & submission metadata
├── tool-workflow.md              # How AI is used across the lifecycle (Part A)
├── requirements-analysis.md      # Requirement breakdown
├── acceptance-criteria.md        # Testable acceptance criteria
├── implementation-plan.md        # Milestones, tasks, risks
├── design-notes.md               # Architecture & design decisions
├── data-model.md                 # Entities, relations, enums
├── api-contract.md               # REST endpoints, requests/responses
├── ui-flow.md                    # Frontend screens & flows
├── test-strategy.md              # What is tested and why
├── backend/                      # Express + TS API + Prisma (added in M2/M3)
├── frontend/                     # React + TS + Tailwind app (added in M5)
├── database/                     # Schema/migrations, seed, setup notes
├── ai-prompts/                   # Grouped prompt history (M6)
└── tool-specific/cursor-workflow # Cursor-specific workflow artifacts
```

> Note: the assessment template suggests `src/` and `tests/` at the root. This
> project uses a **monorepo** layout (`backend/`, `frontend/`) instead, because it
> cleanly separates two runtimes with their own `src/` and `tests/`. This is the
> only intentional deviation from the suggested structure.

## Prerequisites

- [Node.js 20](https://nodejs.org/) (`nvm use` respects `.nvmrc`)
- [Docker](https://www.docker.com/) (to run PostgreSQL locally without a native install)

## Quick Start

> Full, verified commands are added as each milestone lands. Intended flow:

```bash
# 1. Use the pinned Node version
nvm use            # Node 20

# 2. Start PostgreSQL (Docker)
docker compose up -d db

# 3. Backend
cd backend
cp .env.example .env
npm install
npm run prisma:migrate      # apply schema
npm run seed                # load sample users/tickets
npm run dev                 # http://localhost:4000

# 4. Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Documentation Index

Planning and lifecycle artifacts live at the repository root and under
`ai-prompts/` and `tool-specific/`. Start with `requirements-analysis.md` →
`design-notes.md` → `api-contract.md` → `test-strategy.md`.

## Security

No secrets are committed. Configuration is provided via environment variables;
see `backend/.env.example` for the required keys.
