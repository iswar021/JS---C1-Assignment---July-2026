# AI Prompts — Design

Representative prompts used for architecture, data model, API contract, and UI flow.

---

## Prompt 1 — Design package

> Before implementing features, produce design documentation: architecture and
> design notes, data model (entities, relations, enums), REST API contract
> (endpoints, validation, errors), and UI flow (screens, states, routing). Explain
> the status state machine clearly. No application feature code yet beyond what
> scaffolding needs.

**Outcome:** `design-notes.md`, `data-model.md`, `api-contract.md`, `ui-flow.md`.

---

## Prompt 2 — State machine as a first-class design

> The status lifecycle is the signature judgment piece. Design a single pure
> module that encodes allowed transitions. Invalid transitions must be rejected
> by the backend (409) and handled clearly in the UI. Document the full matrix.

**Outcome:** Transition table in design notes; later `statusMachine.ts` + frontend
mirror.

---

## Prompt 3 — Error & validation strategy

> Define a consistent API error shape `{ error: { code, message, details? } }`,
> Zod validation at the edge, and typed application errors (Validation, NotFound,
> Conflict). Backend is authoritative; frontend validation is UX only.

**Outcome:** Documented in `design-notes.md` / `api-contract.md`; implemented in
middleware + `AppError`.
