# Cursor Workflow — Tasks

Milestone task board as executed (and remaining wrap-up).

## Completed

| Milestone | Tasks | Status |
| --------- | ----- | :----: |
| M1 Foundation docs | assessment summary, requirements, acceptance, plan, README, candidate-info | ✅ |
| M2 Backend foundation | Express/TS scaffold, Prisma schema, Docker Compose, migration, seed | ✅ |
| M3 API increments | create, list, details, update | ✅ |
| M4 Backend complete + tests | assign, comments, search/filter/sort/pagination, state machine, 68 tests | ✅ |
| M5 Frontend | full ticket UI + API wiring + a11y + clean build | ✅ |
| M6a Final docs pack | `docs/*` as-built guides, README rewrite | ✅ |
| M6b Assessment filenames | root lifecycle docs, `ai-prompts/`, Cursor workflow pack | ✅ (this) |

## Standing verification tasks (every code milestone)

- [ ] `cd backend && npm run build && npm run lint && npm test`
- [ ] `cd frontend && npm run build && npm run lint` (when FE touched)
- [ ] `prisma validate` when schema changes
- [ ] Update relevant docs if contract/behaviour changes

## Optional Stretch (not required for Core submission)

- [ ] Frontend RTL + Playwright
- [ ] Testcontainers DB-backed tests
- [ ] CI pipeline
- [ ] Auth + protected routes
- [ ] OpenAPI/Swagger
