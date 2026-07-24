# Test Results

Snapshot of the latest verification run for this submission.

## Backend — Jest + Supertest

```text
Command:  cd backend && npm test
Result:   PASS

Test Suites: 11 passed, 11 total
Tests:       68 passed, 68 total
Time:        ~1.8–2.0 s
```

### Suites

| Suite | Result |
| ----- | ------ |
| `statusMachine.test.ts` | PASS |
| `tickets.status.test.ts` | PASS |
| `tickets.create.test.ts` | PASS |
| `tickets.list.test.ts` | PASS |
| `tickets.listfilters.test.ts` | PASS |
| `tickets.details.test.ts` | PASS |
| `tickets.update.test.ts` | PASS |
| `tickets.assign.test.ts` | PASS |
| `comments.create.test.ts` | PASS |
| `users.list.test.ts` | PASS |
| `health.test.ts` | PASS |

### Mandatory state-machine coverage

| Case | Expected | Covered |
| ---- | -------- | :-----: |
| `OPEN → IN_PROGRESS` | 200 | ✅ |
| `OPEN → CANCELLED` | 200 | ✅ |
| `IN_PROGRESS → RESOLVED` | 200 | ✅ |
| `IN_PROGRESS → CANCELLED` | 200 | ✅ |
| `RESOLVED → CLOSED` | 200 | ✅ |
| Invalid / terminal / self-transitions | 409 `INVALID_TRANSITION` | ✅ |
| Missing ticket | 404 | ✅ |
| Invalid status value | 400 | ✅ |

## Frontend — type-check + build + lint

```text
Command:  cd frontend && npm run build && npm run lint
Result:   PASS (no TypeScript errors, no build warnings, 0 lint problems)
```

## Schema / migrations

```text
prisma validate                         → valid
migrate diff (schema vs empty) vs SQL   → zero drift vs committed migration
```

Live `prisma migrate deploy` + `npm run seed` require a running PostgreSQL
instance (see `docs/installation-guide.md`). They were verified offline for
correctness; apply them locally when Docker is available.

## Notes

- Repositories are mocked in HTTP tests; see `test-strategy.md` for rationale.
- No flaky tests observed; suites run with `--runInBand`.
