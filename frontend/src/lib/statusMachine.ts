import type { Status } from '../types';

/**
 * Client-side mirror of the backend status state machine. Used only to present
 * valid next-status actions in the UI; the backend remains authoritative and
 * still rejects invalid transitions (surfaced to the user via a 409 error).
 */
export const STATUS_TRANSITIONS: Record<Status, Status[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

/** Human-friendly label for the action of moving *to* a given status. */
export const STATUS_ACTION_LABELS: Record<Status, string> = {
  OPEN: 'Reopen',
  IN_PROGRESS: 'Start progress',
  RESOLVED: 'Mark resolved',
  CLOSED: 'Close',
  CANCELLED: 'Cancel ticket',
};

export function nextStatuses(status: Status): Status[] {
  return STATUS_TRANSITIONS[status];
}
