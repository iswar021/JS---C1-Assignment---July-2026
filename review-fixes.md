# Review Fixes

Fixes applied in response to self-review and mid-project debugging. Narrative
debugging log: `debugging-notes.md`. Broader catalogue: `docs/bug-fix-summary.md`.

---

## Final-review phase

| ID | Finding | Severity | Fix |
| -- | ------- | -------- | --- |
| RF-01 | README referenced missing lifecycle files (`tool-workflow.md`, `test-strategy.md`, …) | Docs | Rewrote README; added root + `docs/` assessment deliverables |
| RF-02 | Assessment-required prompt/tooling folders missing | Docs | Added `ai-prompts/*` and `tool-specific/cursor-workflow/*` |
| RF-03 | Part A `tool-workflow.md` missing | Docs (20% Part A) | Added `tool-workflow.md` |
| RF-04 | No functional must-fix defects in BE/FE | — | None required |

## Earlier review / QA fixes (already shipped in code)

| ID | Finding | Fix | Approx. commit theme |
| -- | ------- | --- | -------------------- |
| RF-05 | Open CORS | Restrict to `CORS_ORIGIN` | backend completion |
| RF-06 | Zod formErrors dropped | `formatZodError` includes `_errors` | backend completion |
| RF-07 | `ZodEffects` vs `AnyZodObject` | `validate*` accepts `ZodTypeAny` | update ticket milestone |
| RF-08 | Tests needed live `DATABASE_URL` | `jest.setup.ts` placeholder + mocked repos | testing milestones |
| RF-09 | Unknown user → raw FK error | `assertUserExists` → field-scoped 400 | create/update/assign/comment |
| RF-10 | Prisma P2025/P2002 → 500 | Map to 404/409 in error middleware | backend completion |
| RF-11 | `req.query` mutation | Use `res.locals.query` / `params` | list tickets |
| RF-12 | FE react-refresh + Prettier warnings | ESLint allowlist + format | frontend milestone |

## Verification after fixes

```bash
cd backend  && npm run build && npm run lint && npm test   # 68 pass
cd frontend && npm run build && npm run lint               # clean
```

No outstanding must-fix items remain.
