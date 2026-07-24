# AI Prompts — Implementation

Representative prompts used while building backend and frontend features.

---

## Prompt 1 — Create Ticket API

> Implement the Create Ticket API including validation, controller, service,
> repository, tests, and error handling.
>
> Commit message: `feat(api): implement create ticket endpoint`

**Outcome:** Create endpoint + tests; layered module pattern established.

---

## Prompt 2 — List Tickets

> Implement the List Tickets API with filtering and pagination.
>
> Commit: `feat(api): implement ticket listing`

**Outcome:** `GET /api/tickets` with search/status + pagination.

---

## Prompt 3 — Details / Update

> Implement Ticket Details API.  
> Implement Update Ticket endpoint with business validations.
>
> Commits: `feat(api): implement ticket details endpoint`,
> `feat(api): implement ticket update endpoint`

**Outcome:** Get-by-id with comments; patch fields; status excluded from general
update.

---

## Prompt 4 — Complete remaining backend

> Continue from the current project state. Do not recreate existing code.
> Complete all remaining backend features in one milestone: Assign, Add Comment,
> Search, Filter, pagination/sorting, business validations, state transitions,
> consistent errors, refactor duplication, logging, integration tests for every
> new endpoint, ensure tests pass, review for performance/security/quality.
>
> Commit: `feat(api): complete backend implementation`

**Outcome:** Assign + status + comments + expanded filters; 68-test suite green;
CORS tightened; `assertUserExists` shared.

---

## Prompt 5 — Complete frontend

> Complete the entire frontend in one milestone: list, detail, create, edit,
> assign, comments, search, filter, pagination, loading/empty/error, success
> toasts, form validation, responsive UI, accessibility, API wiring, reusable
> components, hooks/services/utilities, build without warnings.
>
> Commit: `feat(frontend): complete ticket management interface`

**Outcome:** Full React UI; clean build/lint.
