# Database Setup Notes

PostgreSQL via Docker + Prisma migrations. No native Postgres install required.

## Prerequisites
- Docker (running)
- Node 20 (`nvm use` — see repo `.nvmrc`)

## 1. Start PostgreSQL
From the repository root:
```bash
docker compose up -d db
```
This starts Postgres 16 on `localhost:5432` with local dev credentials
(`ticket` / `ticket`, database `tickets`). Data persists in the `pgdata` volume.

## 2. Configure the backend environment
```bash
cd backend
cp .env.example .env
```
The default `DATABASE_URL` already matches the Docker service.

## 3. Install dependencies & generate the Prisma client
```bash
npm install
npm run prisma:generate
```

## 4. Apply migrations (creates tables)
```bash
npm run prisma:migrate        # dev: prisma migrate dev
# or, for a non-interactive/CI apply:
npm run prisma:deploy         # prisma migrate deploy
```
Migrations are stored in `backend/prisma/migrations/`.

## 5. Seed sample data
```bash
npm run seed
```
Seeds 4 users and 3 sample tickets (with comments). The seed is **idempotent**:
users are upserted by email and tickets are only created when the table is empty.

## Reset the database
```bash
# from repo root
docker compose down -v && docker compose up -d db
# then re-run migrate + seed
```

## Persistence check (acceptance criterion)
Data survives restart:
```bash
docker compose restart db      # or: docker compose down && up -d db
```
Tickets created before the restart remain available afterwards (stored in the volume).

## Schema / migration artifacts location
- Schema: `backend/prisma/schema.prisma`
- Migrations: `backend/prisma/migrations/`
- Seed: `backend/prisma/seed.ts`
