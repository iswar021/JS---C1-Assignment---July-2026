# AI Prompts — Code Review

Representative prompts used for self-review and fix cycles.

---

## Prompt 1 — Full project review

> Perform a complete project review covering: backend, frontend, folder structure,
> API consistency, database schema, validation, error handling, security,
> performance, TypeScript best practices, Clean Architecture, SOLID, duplication,
> test coverage, UI consistency. Fix every issue discovered. Generate remaining
> documentation. Verify builds, tests, lint, TypeScript, migrations. Provide a
> requirement checklist and optional score-raising improvements.
>
> Commit: `docs: finalize project and assessment deliverables`

**Outcome:** `docs/code-review-notes.md`, root `code-review-notes.md`,
`review-fixes.md`, requirement checklist; no must-fix code defects.

---

## Prompt 2 — Remaining assessment artifacts

> The main remaining work is the assessment documentation. Create:
> test-strategy, code-review-notes + review-fixes, debugging-notes, pr-description,
> reflection + final-ai-usage-summary, ai-prompts/*, tool-specific/cursor-workflow/*.

**Outcome:** This milestone — root lifecycle docs, `ai-prompts/`, Cursor workflow pack.

---

## Prompt 3 — Focused quality pass (during backend completion)

> Review the backend for performance, security, validation, and code quality.
> Refactor duplicated code. Ensure consistent API responses.

**Outcome:** Shared user guard, request logger, CORS restriction, Prisma error mapping.
