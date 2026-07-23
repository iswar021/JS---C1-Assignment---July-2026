import { Status } from '@prisma/client';

/**
 * The ticket status state machine — the single source of truth for allowed
 * transitions. Kept as a pure module (no I/O, no framework types) so it is
 * trivially unit-testable and reusable by both the API and the frontend mirror.
 *
 * Allowed transitions (assessment requirement):
 *   OPEN         -> IN_PROGRESS | CANCELLED
 *   IN_PROGRESS  -> RESOLVED    | CANCELLED
 *   RESOLVED     -> CLOSED
 *   CLOSED       -> (terminal)
 *   CANCELLED    -> (terminal)
 *
 * Everything else — including a no-op transition to the same status and any move
 * out of a terminal state — is invalid.
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<Status, readonly Status[]>> = {
  [Status.OPEN]: [Status.IN_PROGRESS, Status.CANCELLED],
  [Status.IN_PROGRESS]: [Status.RESOLVED, Status.CANCELLED],
  [Status.RESOLVED]: [Status.CLOSED],
  [Status.CLOSED]: [],
  [Status.CANCELLED]: [],
};

/** Returns the valid next statuses reachable from the given status. */
export function allowedNextStatuses(from: Status): readonly Status[] {
  return ALLOWED_TRANSITIONS[from];
}

/** Returns true iff moving from `from` to `to` is an allowed transition. */
export function canTransition(from: Status, to: Status): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Returns true iff the status has no outgoing transitions. */
export function isTerminal(status: Status): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}
