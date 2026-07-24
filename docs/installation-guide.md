# Installation Guide

Step-by-step instructions to run the Support Ticket Management System locally.

## 1. Prerequisites

| Tool    | Version | Notes |
| ------- | ------- | ----- |
| Node.js | 20.x    | Pinned via `.nvmrc`; run `nvm use` in the repo root |
| npm     | 10.x    | Ships with Node 20 |
| Docker  | 20.10+  | Runs PostgreSQL without a native install |

Verify:

```bash
node -v      # v20.x
docker -v    # 20.10+
```

> If you use `nvm`: `nvm install 20 && nvm use`. The repo's `.nvmrc` selects Node 20.

## 2. Clone & select Node

```bash
git clone https://github.com/iswar021/JS---C1-Assignment---July-2026.git
cd JS---C1-Assignment---July-2026
nvm use
```

## 3. Start PostgreSQL (Docker)

The repo ships a `docker-compose.yml` with a PostgreSQL 16 service named `db`:

```bash
docker compose up -d db      # newer Docker
# or
docker-compose up -d db      # older Docker (v1 CLI)
```

This exposes PostgreSQL on `localhost:5432` with database `tickets`, user
`ticket`, password `ticket` (matching `backend/.env.example`).

> No Docker? Install PostgreSQL 16 natively, create a `tickets` database, and set
> `DATABASE_URL` accordingly in `backend/.env` (see
> [Environment Setup](environment-setup.md)).

## 4. Backend setup

```bash
cd backend
cp .env.example .env          # default DATABASE_URL targets the Docker DB
npm install
npm run prisma:generate       # generate the Prisma client
npm run prisma:migrate        # create tables (applies the init migration)
npm run seed                  # load 4 sample users + 3 sample tickets
npm run dev                   # API on http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/health      # {"status":"ok"}
curl http://localhost:4000/api/tickets # paginated ticket list
```

### Production-style run

```bash
npm run build && npm start    # compiles to dist/ and runs node dist/index.js
# Use prisma:deploy (not migrate dev) in non-dev environments:
npm run prisma:deploy
```

## 5. Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env          # VITE_API_URL defaults to http://localhost:4000/api
npm install
npm run dev                   # UI on http://localhost:5173
```

Open <http://localhost:5173>. Use the **"Acting as"** selector in the header to
choose which seeded user creates tickets and comments (the app has no auth in the
Core tier).

## 6. Verify the full stack

```bash
# Backend: type-check, lint, and integration/unit tests
cd backend && npm run build && npm run lint && npm test    # 68 tests pass

# Frontend: type-check + production build, then lint
cd frontend && npm run build && npm run lint
```

## 7. Common issues

| Symptom | Cause / fix |
| ------- | ----------- |
| `Environment variable not found: DATABASE_URL` | You skipped `cp .env.example .env` in `backend/`. |
| `Can't reach database server at localhost:5432` | PostgreSQL isn't running — start Docker (`docker compose up -d db`). |
| Frontend shows "Unable to reach the server" | Backend isn't running, or `VITE_API_URL` is wrong. |
| `unknown shorthand flag: 'd'` on `docker compose` | You have Docker v1 — use `docker-compose` (with hyphen). |
| Prisma client type errors after schema edits | Re-run `npm run prisma:generate`. |

See also: [Environment Setup](environment-setup.md) · [Testing Strategy](testing-strategy.md).
