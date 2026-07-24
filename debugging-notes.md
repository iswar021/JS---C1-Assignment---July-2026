# Debugging Notes

Notable issues encountered during development, how they were diagnosed, and how
they were resolved. Companion: `review-fixes.md`, `docs/bug-fix-summary.md`.

---

## 1. PrismaClient construction breaks tests without a DB

**Symptom:** Importing `createApp()` in Jest threw because `PrismaClient` required
`DATABASE_URL` even though repositories were mocked.

**Diagnosis:** Module-level `new PrismaClient()` runs at import time, before mocks
apply to query methods.

**Fix:** `tests/jest.setup.ts` sets `NODE_ENV=test` and a placeholder
`DATABASE_URL`. No queries run against it because repositories are mocked.

**Lesson:** Separate client construction from query execution; bootstrap env in
`setupFiles` before any app import.

---

## 2. Zod `.refine()` incompatible with `AnyZodObject` middleware typing

**Symptom:** TypeScript error wiring `updateTicketSchema` into `validateBody`.

**Diagnosis:** `.refine()` yields `ZodEffects`, not `ZodObject`.

**Fix:** Middleware accepts `ZodTypeAny` instead of `AnyZodObject`.

---

## 3. Object-level Zod errors invisible to the client

**Symptom:** “At least one field required” / unknown-key messages missing from
API `details`.

**Diagnosis:** `error.flatten()` splits `fieldErrors` and `formErrors`; only
field errors were forwarded.

**Fix:** `formatZodError` merges form errors under `_errors`.

---

## 4. Express `req.query` is read-only

**Symptom:** Assigning coerced/defaulted query values back onto `req.query`
failed or was typed incorrectly.

**Fix:** Store validated query/params on `res.locals.query` / `res.locals.params`;
controllers read from there.

---

## 5. Permissive CORS in early scaffold

**Symptom:** `cors()` with no options allowed any origin.

**Fix:** Restrict to `CORS_ORIGIN` (comma-separated), default
`http://localhost:5173`. Documented in `.env.example`.

---

## 6. Docker / PostgreSQL unavailable in the agent sandbox

**Symptom:** `docker compose` / daemon access denied; no local Postgres.

**Workaround:** Offline verification — `prisma validate`, `migrate diff` (zero
drift), mocked-repository tests. Hand live migrate/seed to the developer machine
via `docs/installation-guide.md`.

---

## 7. Tooling quirks (nvm exit codes, Docker CLI v1 vs v2)

**Symptom:** `source nvm.sh` exit code 3 broke `&&` chains; `docker compose -d`
failed on older CLI expecting `docker-compose`.

**Fix:** Separate commands; document both CLI forms in the install guide.

---

## 8. Security: Personal Access Token pasted into chat

**Symptom:** User shared a GitHub PAT for push auth.

**Response:** Refused to use or store the token; advised immediate revocation and
rotation; continued with local commits only. User pushed manually after auth was
fixed on their side.

**Lesson:** Treat chat input as untrusted; never handle secrets in the agent.

---

## 9. Frontend react-refresh / Prettier noise

**Symptom:** Lint warnings on context hook exports; Prettier drift after large
frontend write.

**Fix:** Allow `useToast` / `useCurrentUser` in ESLint rule; move shared constants
out of component-only modules; run Prettier. Build/lint returned to zero warnings.

---

## Debugging workflow with AI

1. Reproduce with the smallest failing command (`npm test`, `tsc`, curl).
2. Ask the agent for a **hypothesis + plan** before edits.
3. Apply a minimal fix; re-run the same verification.
4. Record the issue here so Part C can point to a concrete “AI mistake fixed”
   moment (e.g. Zod flatten / Prisma test bootstrap).
