# AI Prompts — Planning

Representative prompts used during requirements analysis and roadmap planning.
Paraphrased for clarity; intent preserved.

---

## Prompt 1 — Assessment intake (no code)

> You are my Senior Software Architect, Full Stack Engineer, QA Engineer, and
> Technical Mentor. We are building a Support Ticket Management System for an AI
> Capability Assessment.
>
> IMPORTANT RULES: Never generate the complete project at once. Work incrementally.
> Before writing code, always explain the reasoning and implementation plan. Follow
> production-level coding standards. Use React + TypeScript + TailwindCSS,
> Node.js + Express + TypeScript, PostgreSQL + Prisma, Jest + Supertest. Help me
> generate all documentation required by the assessment.
>
> After every milestone: review, ensure build, suggest improvements, commit only
> milestone files, push, show git commands first.
>
> Read the assessment document carefully. Do not write any code. Summarize all
> requirements, deliverables, evaluation criteria, and hidden expectations. Create
> a complete implementation roadmap.

**Outcome:** `assessment-summary.md`, `requirements-analysis.md`,
`acceptance-criteria.md`, `implementation-plan.md`, README skeleton,
`candidate-info.md`. Commit: `docs: summarize assessment requirements and
implementation roadmap`.

---

## Prompt 2 — Confirm structure / monorepo

> Continue from the current project state. Do not recreate existing code. Prefer
> a monorepo with `backend/` and `frontend/` if that fits production practice;
> document any deviation from the assessment’s suggested `src/` layout.

**Outcome:** Confirmed monorepo layout; deviation noted in README and design notes.

---

## Prompt 3 — Milestone gate

> Do not continue to the next milestone until the current one has been reviewed,
> committed, and pushed.

**Outcome:** Strict cadence: plan → implement → verify → commit → human push confirm.
