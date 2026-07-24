# Reflection

What went well, what was hard, and what I would change — written for Part C of
the assessment.

Expanded copy also lives at `docs/reflection.md`.

---

## What went well

- **Incremental milestones.** Plan → explain → implement → verify → commit kept
  every push reviewable and the build green.
- **Backend-authoritative rules.** Validation and the status state machine live
  on the server; the UI mirrors transitions for UX only.
- **Pure state-machine module.** One small file, unit-tested and integration-tested
  exhaustively — the highest-leverage design choice.
- **Consistent error contract.** One `{ error }` shape simplified the frontend
  (`ApiError` → field errors + toasts).
- **Offline verification.** When Docker was unavailable, schema validate +
  migration diff + mocked HTTP tests still gave high confidence.

## What was challenging

- **Environment limits** (no Docker/Postgres in the agent sandbox) blocked live
  migrate/seed/E2E in-session; compensated with static checks and clear install docs.
- **Subtle middleware typing** (ZodEffects, read-only `req.query`) needed careful
  fixes rather than greenfield rewrites.
- **Keeping design docs and as-built code aligned** — early `design-notes.md`
  sketched a slightly different frontend layout; final `docs/` and root artifacts
  describe what shipped.

## What I would do differently

1. Add **frontend tests** (RTL) and a **Playwright** happy path earlier.
2. Add **DB-backed** integration tests (Testcontainers) in CI alongside mocked ones.
3. Introduce **CI** (build/lint/test) from the first code milestone.
4. Consider **React Query** for list/detail caching once the UI grew.
5. Treat Stretch (auth, OpenAPI) only after Core artifacts were complete — this
   prioritisation matched the brief and I would keep it.

## Working with AI

AI excelled at **well-specified, high-volume** work (scaffolding, DTO mapping,
transition test matrices, documentation). It needed **human control** for scope,
security (refusing a pasted PAT), and environment judgment. That split matches the
exercise’s intent: make the AI workflow visible without handing over ownership.

See `tool-workflow.md`, `final-ai-usage-summary.md`, and `ai-prompts/`.
