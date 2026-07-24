# Reflection

## What went well

- **Incremental milestones held up.** Planning before coding and committing one
  reviewable slice at a time kept the diff surface small and the build always green.
  Each milestone ended in a known-good state (build + lint + tests).
- **Backend-authoritative design paid off.** Putting validation and the state
  machine on the server, with a thin client mirror for UX, made the rules easy to
  test exhaustively and impossible to bypass from the UI.
- **The state machine as a pure module** was the highest-leverage decision: one
  small file, directly unit-tested, and reused conceptually on the frontend.
- **Consistent error contract** made the frontend simple — one `ApiError` type
  drives inline field errors and toasts.
- **Offline verification** (schema validate, migration diff, mocked-repo
  integration tests) meant the absence of a live DB never blocked progress or
  confidence in correctness.

## What was challenging

- **Environment constraints.** No Docker/Postgres in the sandbox meant DB-apply and
  seed couldn't be executed here; I compensated with static verification and clear
  reviewer instructions, but true end-to-end (UI → API → DB) is validated by the
  reviewer, not in-session.
- **Express `req.query` read-only** and Zod `ZodEffects` typing required small,
  non-obvious middleware adjustments.
- **Keeping docs and code in sync** — early design docs described a slightly
  different frontend layout than what shipped; the final `docs/` set describes the
  as-built system and flags the historical design docs as such.

## What I'd do differently / next

- **Frontend tests.** Add React Testing Library unit tests (forms, StatusChanger,
  hooks) and a Playwright happy-path E2E. This is the biggest coverage gap.
- **DB-backed integration tests.** Run the existing Supertest suites against a real
  Postgres (e.g. Testcontainers) in CI, in addition to the fast mocked variant.
- **A client data layer** (React Query) for caching, background refetch, and
  optimistic updates — would remove manual refetch/setTicket bookkeeping.
- **CI pipeline** running build + lint + test for both runtimes on every push.
- **Security hardening for beyond-Core**: real auth/authorization, `helmet`, rate
  limiting.
- **Search at scale**: trigram/full-text index if keyword search grows.

## On working with AI

AI was most valuable for **well-specified, boilerplate-heavy** work — module
scaffolding, DTO mapping, test matrices, and documentation — where it produced
correct, consistent output quickly. It was least autonomous where **environment
reality and judgment** mattered (DB availability, security incidents, scope calls);
there, explicit human direction and guardrails were essential. The combination —
AI for throughput, human for scope/correctness/security — matched the assessment's
intent and produced a codebase I'd be comfortable maintaining.

See also: [AI Usage Workflow](ai-usage-workflow.md) ·
[Final AI Usage Summary](final-ai-usage-summary.md).
