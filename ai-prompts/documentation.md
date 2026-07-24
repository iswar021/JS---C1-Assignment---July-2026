# AI Prompts — Documentation

Representative prompts used to produce README and lifecycle documentation.

---

## Prompt 1 — Initial docs (no code)

> Summarize requirements, deliverables, evaluation criteria, and hidden
> expectations. Create a complete implementation roadmap. Generate candidate-info
> and README skeleton.

**Outcome:** Early root planning docs.

---

## Prompt 2 — Final docs pack

> Generate all remaining documentation required for the assessment, including
> README, Installation Guide, Environment Setup, Project Architecture, API
> Documentation, Database Design, Testing Strategy, AI Usage Workflow, Design
> Decisions, Code Review Notes, Bug Fix Summary, Reflection, Final AI Usage Summary.

**Outcome:** `docs/*` set + rewritten README (`docs: finalize project and
assessment deliverables`).

---

## Prompt 3 — Fill Part A / Part C filenames

> Create assessment-canonical files: tool-workflow.md, test-strategy.md,
> test-results.md, debugging-notes.md, code-review-notes.md, review-fixes.md,
> pr-description.md, reflection.md, final-ai-usage-summary.md, plus ai-prompts/*
> and tool-specific/cursor-workflow/*.

**Outcome:** This documentation milestone.

---

## Prompt 4 — Keep docs honest

> Prefer as-built documentation. Where design docs differ from implementation,
> mark design docs as design-time and point reviewers to docs/architecture.md and
> api-documentation.md for the shipped system.

**Outcome:** Cross-links between root design docs and `docs/` as-built guides.
