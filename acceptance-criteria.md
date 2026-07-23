# Acceptance Criteria

Derived from the Core Acceptance Criteria in the brief, expressed as testable
checks. `[ ]` = planned, will be ticked as milestones land.

## Core (functional)

- [ ] A user can **create** a ticket via the UI.
- [ ] A user can **view all** tickets loaded from the database.
- [ ] A user can **open a ticket detail** view.
- [ ] A user can **update** ticket fields (title, description, priority) and
      **reassign** the assignee.
- [ ] A user can **add comments** to a ticket.
- [ ] Status changes **only through valid transitions**; invalid ones are rejected.
- [ ] **Keyword search** and **status filter** work.
- [ ] **Data remains available after restart** (verified by restarting the API/DB).

## State machine (signature piece)

- [ ] `Open → In Progress` succeeds.
- [ ] `In Progress → Resolved` succeeds.
- [ ] `Resolved → Closed` succeeds.
- [ ] `Open → Cancelled` succeeds.
- [ ] `In Progress → Cancelled` succeeds.
- [ ] `Open → Resolved` is rejected (409).
- [ ] `Resolved → In Progress` is rejected (409).
- [ ] `Closed → *` is rejected (terminal).
- [ ] `Cancelled → *` is rejected (terminal).
- [ ] Transition to the **same** status is rejected.

## Validation

- [ ] Missing required fields on create (title/description/priority) → 400 with
      field-level messages.
- [ ] Invalid enum values (priority/status) → 400.
- [ ] Unknown `assignedTo`/`createdBy` user → 400/422.
- [ ] Empty comment message → 400.
- [ ] Operations on unknown ticket id → 404.

## Error Handling

- [ ] Backend returns a **consistent error shape** (code, message, optional details).
- [ ] Frontend shows **meaningful error states** for validation failures.
- [ ] Frontend shows a **clear message** when an invalid status transition is rejected.
- [ ] Network/server errors do not crash the UI; a friendly fallback is shown.

## Testing

- [ ] **Integration tests** (Jest + Supertest) prove valid transitions succeed and
      invalid transitions are rejected (mandatory tier).
- [ ] Tests run from a documented command and pass in CI-like local run.
- [ ] (Stretch, later) unit tests for the state-machine function and edge cases.

## Documentation

- [ ] README setup instructions work on a clean machine.
- [ ] `database/setup-notes.md` documents schema, migration, and seed steps.
- [ ] `.env.example` lists all required environment variables.
- [ ] API documented in `api-contract.md` (and Swagger if pursued as Stretch).
- [ ] Prompt history captured under `ai-prompts/`.

## Security

- [ ] **No secrets committed** to the repository.
- [ ] Configuration via environment variables only.
- [ ] Backend validation is authoritative (frontend validation is UX only).
