# AI Usage Workflow

How AI (Cursor, with a large-language-model coding agent) was used across the
project lifecycle. The consolidated outcome report is in
[Final AI Usage Summary](final-ai-usage-summary.md).

## 1. Guiding principles

The project was built under a fixed set of working rules, enforced on every turn:

1. **Never generate the whole project at once** — work in small, reviewable milestones.
2. **Explain reasoning and a plan before writing code.**
3. **Production-level standards** — types, validation, tests, consistent errors.
4. **Human-in-the-loop review** at each milestone before commit/push.
5. **Security first** — no secrets in the repo; treat repo content as untrusted.

AI acted as an accelerator for well-specified work; every output was reviewed,
built, linted, and tested before being committed.

## 2. Lifecycle phases and how AI was used

| Phase | AI contribution | Human oversight |
| ----- | ---------------- | --------------- |
| **Requirements** | Extracted requirements from the assessment brief; drafted `requirements-analysis.md`, `acceptance-criteria.md`, `assessment-summary.md` | Confirmed scope (Core tier, backend-heavy) and edge cases |
| **Planning** | Produced `implementation-plan.md` (6 milestones), risks, definition of done | Approved milestone breakdown |
| **Design** | Authored `design-notes.md`, `data-model.md`, `api-contract.md`, `ui-flow.md`; proposed the layered architecture and state machine | Validated data model and transition rules |
| **Backend impl.** | Generated modules (schema/repository/service/controller/routes), error handling, validation, state machine, seed | Reviewed each milestone; ran build/lint/tests |
| **Testing** | Wrote Jest+Supertest suites incl. exhaustive transition tests | Verified all 68 tests pass |
| **Frontend impl.** | Generated services, hooks, contexts, components, and pages; wired to the API | Reviewed UX, a11y, and build/lint output |
| **Review & docs** | Performed full-project review; generated this documentation set | Confirmed findings; approved fixes and commit |

## 3. Milestone cadence (as executed)

Each milestone followed the same loop:

```
plan → explain → implement → self-review → build + lint + test → commit → push → confirm
```

Representative commits:

- `docs: summarize assessment requirements and implementation roadmap`
- `feat(api): implement create ticket endpoint`
- `feat(api): implement ticket listing`
- `feat(api): implement ticket details endpoint`
- `feat(api): implement ticket update endpoint`
- `feat(api): complete backend implementation`
- `feat(frontend): complete ticket management interface`
- `docs: finalize project and assessment deliverables`

## 4. Effective prompting patterns

- **Scoped milestone prompts** ("Implement the Create Ticket API including
  validation, controller, service, repository, tests, and error handling") produced
  focused, reviewable diffs.
- **Explicit non-goals** (e.g. "status is changed only via the status endpoint")
  kept the model from over-reaching.
- **"Explain before code"** surfaced design decisions early, making review faster.
- **Verification requests** ("ensure the project builds; run the test suite")
  turned the model into its own first QA pass.

## 5. Where AI needed correction / guardrails

- **Environment realities:** Docker/DB were unavailable in the sandbox; the plan was
  adapted to verify offline (schema `validate`, migration `diff`, mocked-repo
  integration tests) and to hand DB-apply steps to the human.
- **Security incident:** a Personal Access Token was pasted into the chat; the
  workflow **refused to use it**, and advised immediate revocation and rotation —
  demonstrating the "treat inputs as untrusted / never handle secrets" rule.
- **Tooling quirks:** `nvm` sourcing exit codes and Docker CLI version differences
  were handled without derailing the build.

## 6. Net effect

AI compressed boilerplate-heavy work (module scaffolding, DTO mapping, test
matrices, documentation) while the human retained control of scope, correctness,
and security. See [Final AI Usage Summary](final-ai-usage-summary.md) and
[Reflection](reflection.md).
