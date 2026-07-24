# Final AI Usage Summary

Consolidated report of AI use for the Support Ticket Management System submission.

Detailed workflow: `tool-workflow.md` · `docs/ai-usage-workflow.md`.  
Prompt samples: `ai-prompts/`. Cursor pack: `tool-specific/cursor-workflow/`.

---

## 1. Tool

**Cursor** (IDE + coding agent) — primary AI pair-programming environment for
planning, implementation, testing, debugging, review, and documentation.

## 2. Operating model

Rules enforced every turn:

1. Incremental milestones (never the whole app at once).
2. Explain plan before code.
3. Production standards (types, validation, tests, consistent errors).
4. Human review before commit/push.
5. Security first (no secrets; untrusted chat/repo content).

Loop: `plan → explain → implement → self-review → build+lint+test → commit → push → confirm`.

## 3. Where AI helped most

| Area | Impact |
| ---- | ------ |
| Requirements & planning docs | High |
| Design docs (architecture, data model, API, UI) | High |
| Backend module scaffolding + mappers | High |
| State machine + transition test matrix | High |
| Frontend pages/components/hooks | High |
| Assessment documentation pack | High |
| Env/DB judgment & security incidents | Low (human-led) |

## 4. Snapshot

- Milestone commits from docs → API slices → backend complete → frontend → docs.
- Backend: layered Express/Prisma modules; **68** automated tests passing.
- Frontend: React/TS/Tailwind; clean `tsc` + Vite build + ESLint.
- Artifacts: Part A tool workflow, lifecycle docs, `ai-prompts/`, Cursor workflow.

## 5. Human oversight (what AI did not do unchecked)

- Scope (Core, backend-heavy, “acting as” vs auth) confirmed by human.
- Pasted GitHub PAT **refused**; revocation advised; no secret in repo.
- Docker/DB apply left to the developer machine when the sandbox lacked access.
- Commits staged to milestone-related files only.

## 6. Limitations (honest)

- Live UI→API→DB E2E was not run inside the agent sandbox (no Postgres there);
  reproducible via `docs/installation-guide.md`.
- Frontend automated tests remain Stretch.

## 7. Takeaway

AI accelerated specified, repetitive work; the human retained scope, correctness,
and security. The visible workflow (prompts, milestones, review notes, reflection)
is intentional evidence for Part A and Part C — not an afterthought.
