# Tool Workflow (Part A)

How Cursor was used as the primary AI tool across the full software lifecycle for
the Support Ticket Management System.

Related: `docs/ai-usage-workflow.md` · `final-ai-usage-summary.md` · `ai-prompts/` ·
`tool-specific/cursor-workflow/`.

---

## 1. Tool choice

| Item | Choice |
| ---- | ------ |
| Primary AI tool | **Cursor** (IDE + agent) |
| Role of AI | Pair programmer: plan → implement → test → review → document |
| Role of human | Scope, security, environment judgment, milestone approval, push |

## 2. Operating rules (enforced every turn)

1. **Never generate the whole project at once** — milestone-sized increments only.
2. **Explain reasoning and plan before writing code.**
3. **Production standards** — TypeScript, validation, tests, consistent errors.
4. **Human review** before every commit/push.
5. **Security** — no secrets in the repo; never consume pasted credentials.

## 3. Lifecycle map

| Lifecycle phase | Cursor usage | Artifacts produced |
| --------------- | ------------ | ------------------ |
| Requirements | Extract & structure the assessment brief | `assessment-summary.md`, `requirements-analysis.md`, `acceptance-criteria.md` |
| Planning | Draft milestones, risks, DoD | `implementation-plan.md` |
| Design | Architecture, schema, API, UI flows | `design-notes.md`, `data-model.md`, `api-contract.md`, `ui-flow.md` |
| Implementation | Backend modules, then frontend pages | `backend/`, `frontend/` |
| Testing | Jest + Supertest suites, transition matrix | `test-strategy.md`, `test-results.md`, `backend/tests/` |
| Debugging | Diagnose env, typing, CORS, Zod issues | `debugging-notes.md` |
| Code review | Full-project review across 15 dimensions | `code-review-notes.md`, `review-fixes.md` |
| Documentation | README, install, API, architecture, reflection | `docs/`, root lifecycle docs |
| Reflection | What worked / what to change / AI honesty | `reflection.md`, `final-ai-usage-summary.md` |

## 4. Prompting strategy that worked

- **Scoped milestone prompts** with an explicit deliverable list and commit message.
- **Constraints in the prompt** (e.g. “status only via `PATCH …/status`”, “do not recreate existing code”).
- **“Explain before code”** so design mistakes surface before large diffs.
- **Verification clauses** (“build, lint, run tests”) so the agent self-checks.
- **Grouped prompt history** under `ai-prompts/` by phase (not a raw chat dump).

## 5. Cursor-specific workflow

Persistent project guidance lives in `tool-specific/cursor-workflow/`:

| File | Purpose |
| ---- | ------- |
| `project-context.md` | Stack, monorepo layout, non-goals |
| `spec.md` | Product behaviour (Core) |
| `tasks.md` | Milestone task list |
| `acceptance-criteria.md` | Cursor-oriented checklist |
| `cursor-rules-or-instructions.md` | Standing instructions given to the agent |

## 6. Human-in-the-loop controls

- Approve milestone plan before implementation.
- Review diffs; only stage milestone-related files.
- Push manually when agent lacked GitHub credentials.
- Rejected use of a pasted Personal Access Token (revocation advised).
- Confirmed Docker/DB steps run on the developer machine when the sandbox could not.

## 7. Evidence pointers

- Prompt history: `ai-prompts/`
- Cursor workflow pack: `tool-specific/cursor-workflow/`
- Commit cadence: milestone commits listed in `pr-description.md` and `final-ai-usage-summary.md`
