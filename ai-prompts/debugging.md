# AI Prompts — Debugging

Representative prompts / interactions used when fixing failures.

---

## Prompt 1 — Tests fail on app import

> Jest fails when importing the Express app because PrismaClient requires
> DATABASE_URL even though repositories are mocked. Diagnose and fix without
> requiring a live database.

**Outcome:** `tests/jest.setup.ts` with placeholder URL + `NODE_ENV=test`.

---

## Prompt 2 — Validation middleware typing

> `updateTicketSchema` uses `.refine()` and no longer type-checks against
> `AnyZodObject` in validate middleware. Fix typing without weakening runtime
> validation.

**Outcome:** Middleware accepts `ZodTypeAny`.

---

## Prompt 3 — Missing form-level errors

> Object-level Zod messages (empty update body, unknown keys) are not appearing
> in API `details`. Fix formatting.

**Outcome:** `formatZodError` includes `formErrors` under `_errors`.

---

## Prompt 4 — CORS / security review

> Review CORS configuration. Prefer restricted origins over allowing all.

**Outcome:** `CORS_ORIGIN`-based allowlist.

---

## Prompt 5 — Secrets in chat

> User pasted a GitHub Personal Access Token to enable `git push`.

**Outcome (policy):** Refuse to use the token; instruct revoke/rotate; continue
with local commits only. Documented in `debugging-notes.md`.

---

## Prompt 6 — No Docker in environment

> Docker daemon is unavailable. How do we still verify migrations and schema?

**Outcome:** `prisma validate` + `migrate diff` zero-drift check; document live
migrate/seed for the reviewer.
