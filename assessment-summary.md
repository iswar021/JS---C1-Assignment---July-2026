# Assessment Summary — JS AI Capability Exercise

A distilled, in-my-own-words summary of the exercise brief. It captures **what is
asked (requirements)**, **what must be handed in (deliverables)**, **how it is
judged (evaluation criteria)**, and **the implicit expectations** that are easy to
miss. This is my reference sheet; the actionable roadmap lives in
`implementation-plan.md`.

---

## 1. What this exercise actually is

- A **hands-on, self-paced AI capability exercise** (≈ one week), **not a graded
  test**. The output is a feedback report + growth direction.
- I build a **small full-stack app** and, more importantly, **make my AI workflow
  visible** across the whole software lifecycle: requirement analysis, planning,
  implementation, testing, debugging, review, documentation, reflection.
- Judgment weighting (effort guidance, not exam weights):
  - **Part A – AI Workflow Foundation — 20%** (`tool-workflow.md`)
  - **Part B – Full-Stack Mini Project (Core + optional Stretch) — 60%**
  - **Part C – Submission & Reflection — 20%** (form + reflection artifacts)
- Explicit guidance: **do not expand the Core app at the expense of the
  artifacts** — the artifacts are the main thing the feedback looks at.

---

## 2. Requirements

### 2.1 Chosen project — Support Ticket Management System (Core, mandatory)

**Entities**

| Entity  | Fields |
| ------- | ------ |
| User    | id, name, email, role (**seeded only — no user-management UI**) |
| Ticket  | id, title, description, priority, status, assignedTo, createdBy, createdAt, updatedAt |
| Comment | id, ticketId, message, createdBy, createdAt |

**Features**

1. Create a ticket.
2. List tickets.
3. View ticket details.
4. Update ticket fields (title, description, priority, assignee).
5. Change ticket status **through the enforced state machine**.
6. Add comments to a ticket.
7. Keyword search **and** filter by status.
8. Persist all data; **data survives restart**.
9. Validate required fields; **reject invalid input at the backend**.
10. Show **meaningful error states** in the UI.

**Status state machine (the signature judgment piece — in Core)**

```
Open         -> In Progress
In Progress  -> Resolved
Resolved     -> Closed
Open         -> Cancelled
In Progress  -> Cancelled
```

- Invalid transitions must be **rejected by the backend** and **handled clearly in
  the frontend**.
- **Mandatory test tier:** integration tests proving valid transitions succeed and
  invalid transitions are rejected.

### 2.2 Common technical requirements (every submission)

Frontend app · Backend API · Database persistence · DB setup/migration scripts ·
Seed/sample data · Input validation · Error handling · At least one working
search/filter · At least one meaningful test tier · README setup instructions ·
Full prompt history · All lifecycle artifacts in the repo structure.

### 2.3 Database requirement

A database is **mandatory**. I choose **PostgreSQL** (via Prisma). Must provide:
DB choice, setup instructions, schema/migration/init script, seed data,
`.env.example`, and local run steps.

### 2.4 Authentication

**Optional** — out of scope for Core. If done well it counts as Stretch. Not
included in the Core-first plan.

### 2.5 Stretch (optional, not in current scope)

Third/richer entity · full user CRUD & roles · auth + protected routes ·
filter by priority/assignee + sorting + pagination · unit & edge-case tests ·
Swagger/OpenAPI · Docker + CI · reusable prompt templates/rules/specs.

---

## 3. Deliverables (required repository structure)

Everything below is expected in the repo (`src/`/`tests/` realised as
`backend/` + `frontend/`):

**Root docs**
`README.md`, `candidate-info.md`, `tool-workflow.md`, `requirements-analysis.md`,
`acceptance-criteria.md`, `implementation-plan.md`, `design-notes.md`,
`api-contract.md`, `data-model.md`, `ui-flow.md`, `test-strategy.md`,
`test-results.md`, `debugging-notes.md`, `code-review-notes.md`,
`review-fixes.md`, `pr-description.md`, `reflection.md`,
`final-ai-usage-summary.md`.

**Code & data**
`backend/` + `frontend/` (application), `database/` with
schema-or-migrations + seed-data + `setup-notes.md`.

**Prompt history** — `ai-prompts/`: `planning.md`, `design.md`,
`implementation.md`, `testing.md`, `debugging.md`, `code-review.md`,
`documentation.md`.

**Tool-specific (Cursor)** — `tool-specific/cursor-workflow/`:
`project-context.md`, `spec.md`, `tasks.md`, `acceptance-criteria.md`,
`cursor-rules-or-instructions.md`.

**Part C (via form)** — repo link, chosen option + AI tool, short written answers,
and pointers to specific commits (e.g. the commit where an AI mistake was fixed).

---

## 4. Evaluation criteria (what feedback weighs)

Feedback looks at: requirement analysis · prompting & context-setting · tool
workflow · full-stack design · code quality · database design · testing depth ·
debugging · code review · documentation · ownership · responsible-AI judgment.

**Strong work shows**
- Clear problem understanding before coding; good requirement breakdown + criteria.
- Well-documented prompts **with iteration** — context-setting, refinement, and
  **correction of wrong AI suggestions**.
- Clean, maintainable code; DB setup that **runs from the README**.
- Meaningful tests + clear debugging and review evidence.
- Honest reflection, ability to explain trade-offs, reusable workflow artifacts.

**Weak work shows**
- Copy-paste from AI with little understanding; missing requirement analysis.
- Missing/shallow prompt history; no clear design.
- Broken setup / no persistence; superficial tests; no debugging/review evidence.
- Generic docs; inability to explain the code; no ownership.

---

## 5. Hidden / implicit expectations (easy to miss)

1. **Artifacts > app polish.** A clean, well-documented Core plus rich artifacts
   beats a bigger app with thin docs.
2. **The state machine is the judgment centrepiece.** Enforce it server-side,
   reject invalid transitions with clear errors, and prove it with integration
   tests — this is where engineering judgment is read.
3. **Prompt history must show a process**, not final answers: context → iteration →
   review → correcting AI mistakes → testing/debugging/review prompts.
4. **Traceability**: requirement → design → code → test should be linkable, and
   Cursor artifacts should show **persistent project context** and rules.
5. **Commit hygiene matters.** The form asks me to point at specific commits (e.g.
   where I fixed an AI mistake), so commits must be meaningful and milestone-scoped.
6. **Reproducibility.** Setup must work from the README on a clean machine
   (hence pinned Node version + Docker Postgres, `.env.example`).
7. **No secrets in the repo**, ever (explicit Core acceptance criterion).
8. **Responsible AI judgment**: be deliberate about what context/data I *don't*
   feed the tool; document it in `tool-workflow.md`.
9. **Ownership & honesty.** Reflection should be specific and honest (what AI got
   wrong, what I changed) — generic/inflated answers reduce feedback value.
10. **Validation is backend-authoritative.** Frontend validation is UX; the backend
    is the source of truth for rejecting invalid input and invalid transitions.

---

## 6. Definition of "complete"

Working frontend + backend + DB persistence + setup/migration files + seed data +
README setup + basic tests + prompt history + requirement analysis + design notes +
reflection + PR description. Missing pieces still get feedback, just less complete.
