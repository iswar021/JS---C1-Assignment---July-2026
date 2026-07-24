# Design Decisions

Key decisions and the trade-offs behind them. Architecture detail lives in
[architecture.md](architecture.md); rationale narrative in `design-notes.md`.

## 1. Monorepo (`backend/` + `frontend/`) vs suggested root `src/`+`tests/`
**Decision:** monorepo with two runtimes. **Why:** each runtime owns its own
`src/`, `tests/`, tooling, and lockfile; no bundler gymnastics to share a single
root. **Trade-off:** deviates from the template's suggested layout (documented in
README as the only intentional deviation).

## 2. Layered backend (routes → controllers → services → repositories)
**Decision:** strict one-way layering, module-per-resource. **Why:** SRP and
testability — controllers stay thin, business rules live in services, data access
is isolated in repositories, and mappers keep DTOs stable. **Trade-off:** more
files per feature, but each is small and single-purpose.

## 3. State machine as a pure module
**Decision:** `services/statusMachine.ts` is a pure, dependency-free map of allowed
transitions with `canTransition`/`isTerminal`. **Why:** it's the highest-value
domain rule — keeping it pure makes it trivially unit-testable and reusable by a
frontend mirror. **Trade-off:** the frontend mirror can drift from the backend; the
backend stays authoritative and the mirror is UX-only, so drift is a cosmetic risk
at worst.

## 4. Backend-authoritative validation with Zod
**Decision:** Zod schemas validate body/query/params at the edge; the service adds
referential checks. Client-side validation is UX-only. **Why:** never trust the
client; produce consistent, field-scoped `400`s. **Trade-off:** some rules
(required fields, lengths) are expressed twice (client + server) — accepted because
the server is the source of truth and the client copy only improves UX latency.

## 5. Status changes isolated to a dedicated endpoint
**Decision:** `PATCH /tickets/:id` rejects `status` (strict schema); status changes
go through `PATCH /tickets/:id/status`. **Why:** transitions must pass the state
machine; mixing them into general field updates would blur that guarantee.

## 6. Consistent error contract + centralized handler
**Decision:** a small typed `AppError` hierarchy + one error middleware emit
`{ error: { code, message, details? } }`; Prisma `P2025`/`P2002` are mapped to
404/409. **Why:** predictable, machine-readable errors for the client; no stack
traces leak. **Trade-off:** a tiny bit of mapping boilerplate.

## 7. `res.locals` for validated query/params
**Decision:** validated `query`/`params` are stored on `res.locals` (Express
exposes `req.query` as read-only in newer versions). **Why:** carry the coerced,
typed values downstream safely. **Trade-off:** controllers read from `res.locals`
with a cast — localized and documented.

## 8. "Acting as" user instead of auth (frontend)
**Decision:** a `CurrentUserContext` lets the user pick which seeded user acts.
**Why:** Core has no auth, but tickets/comments need a `createdBy`; this is a clean,
honest stand-in that also removes repeated "author" selectors from forms.
**Trade-off:** not real authentication — explicitly a Core-scope simplification.

## 9. Local state + hooks + small contexts (no Redux)
**Decision:** custom hooks (`useTickets`, `useTicket`, `useDebounce`) + two
contexts (current user, toasts). **Why:** the app's state is page-local and simple;
Redux would be over-engineering. **Trade-off:** no global cache — acceptable at this
scale; a data layer like React Query is a documented Stretch.

## 10. Shared `TicketForm` for Create and Edit
**Decision:** one form component parameterized by initial values + submit handler.
**Why:** DRY — identical fields and validation. **Trade-off:** a couple of
mode-specific props, kept minimal.

## 11. Idempotent seed
**Decision:** upsert users by email; only seed tickets when the table is empty.
**Why:** safe to re-run in any environment without duplicating data.

## 12. Dependency discipline
**Decision:** minimal dependencies (Express, Prisma, Zod, cors, dotenv on the
backend; React, React Router on the frontend). **Why:** fewer moving parts, smaller
attack surface, faster installs. **Trade-off:** a few things written by hand (e.g. a
tiny request logger instead of `morgan`) — intentional per the dependency policy.

## 13. Offline verification strategy
**Decision:** where a live DB was unavailable, verify via `prisma validate`,
`prisma migrate diff`, and mocked-repository integration tests. **Why:** prove
correctness of the contract and schema without a database; DB-apply is a documented
one-command step for the reviewer.
