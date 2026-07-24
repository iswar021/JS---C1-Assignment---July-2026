# Environment Setup

How configuration, tooling, and environment variables are managed. **No secrets
are committed** — every runtime reads configuration from environment variables,
with committed `.env.example` templates.

## 1. Node & package management

- Node version is pinned in `.nvmrc` (`20`). Run `nvm use` before any npm command.
- Each runtime has its own `package.json` and lockfile:
  - `backend/package.json` + `backend/package-lock.json`
  - `frontend/package.json` + `frontend/package-lock.json`
- Install with `npm install` inside each directory (versions are pinned in the
  lockfiles for reproducible builds).

## 2. Backend environment variables

Template: `backend/.env.example` → copy to `backend/.env` (git-ignored).

| Variable       | Required | Default (dev)                                                   | Purpose |
| -------------- | :------: | --------------------------------------------------------------- | ------- |
| `PORT`         | no       | `4000`                                                          | API server port |
| `NODE_ENV`     | no       | `development`                                                  | `development \| test \| production` |
| `CORS_ORIGIN`  | no       | `http://localhost:5173`                                        | Comma-separated allowed origins for CORS |
| `DATABASE_URL` | **yes**  | `postgresql://ticket:ticket@localhost:5432/tickets?schema=public` | PostgreSQL connection string |

Configuration is validated at startup by `src/config/env.ts` using Zod. If a
required variable is missing or malformed, the process **fails fast** with a clear
error rather than starting in a broken state.

```ts
// backend/src/config/env.ts (excerpt)
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});
```

## 3. Frontend environment variables

Template: `frontend/.env.example` → copy to `frontend/.env` (git-ignored).

| Variable       | Required | Default                        | Purpose |
| -------------- | :------: | ------------------------------ | ------- |
| `VITE_API_URL` | no       | `http://localhost:4000/api`    | Base URL of the backend API |

Vite only exposes variables prefixed with `VITE_` to the client bundle. The API
client (`src/api/client.ts`) falls back to the default if the variable is unset.

## 4. Database (Docker)

`docker-compose.yml` defines a PostgreSQL 16 service:

```bash
docker compose up -d db        # start
docker compose logs -f db      # follow logs
docker compose down            # stop (add -v to also drop the volume/data)
```

- Host/port: `localhost:5432`
- Credentials: user `ticket`, password `ticket`, database `tickets`
- Data persists in a named Docker volume across restarts.

The default `DATABASE_URL` in `backend/.env.example` matches these values, so no
edits are needed for the standard Docker workflow.

## 5. CORS

CORS is **restricted**, not open. `src/app.ts` reads `CORS_ORIGIN` (comma-separated)
and only allows those origins. In development this is the Vite dev server
(`http://localhost:5173`). For deployment, set `CORS_ORIGIN` to the deployed
frontend origin.

## 6. Tooling configuration

| Concern     | Backend                        | Frontend |
| ----------- | ------------------------------ | -------- |
| TypeScript  | `backend/tsconfig.json` (+ `tsconfig.test.json`) | `frontend/tsconfig.json` |
| Lint        | `backend/.eslintrc.cjs`        | `frontend/.eslintrc.cjs` |
| Format      | root `.prettierrc.json` / `.prettierignore` | same (shared) |
| Tests       | `backend/jest.config.js` (+ `tests/jest.setup.ts`) | — |
| Build       | `tsc` → `dist/`                | `tsc && vite build` → `dist/` |

## 7. Secrets policy

- `.env`, `.env.*`, `node_modules/`, `dist/`, and Prisma generated files are
  git-ignored (see root `.gitignore`).
- Only `.env.example` templates are committed.
- No API keys, tokens, or passwords appear in source, tests, or docs.
