import { Status } from '@prisma/client';
import {
  allowedNextStatuses,
  canTransition,
  isTerminal,
} from '../src/services/statusMachine';

describe('statusMachine (unit)', () => {
  const validTransitions: [Status, Status][] = [
    [Status.OPEN, Status.IN_PROGRESS],
    [Status.OPEN, Status.CANCELLED],
    [Status.IN_PROGRESS, Status.RESOLVED],
    [Status.IN_PROGRESS, Status.CANCELLED],
    [Status.RESOLVED, Status.CLOSED],
  ];

  it.each(validTransitions)('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  const invalidTransitions: [Status, Status][] = [
    [Status.OPEN, Status.RESOLVED],
    [Status.OPEN, Status.CLOSED],
    [Status.OPEN, Status.OPEN], // no-op
    [Status.IN_PROGRESS, Status.OPEN],
    [Status.IN_PROGRESS, Status.CLOSED],
    [Status.RESOLVED, Status.IN_PROGRESS],
    [Status.RESOLVED, Status.OPEN],
    [Status.CLOSED, Status.OPEN], // terminal
    [Status.CLOSED, Status.IN_PROGRESS], // terminal
    [Status.CANCELLED, Status.OPEN], // terminal
  ];

  it.each(invalidTransitions)('rejects %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it('treats CLOSED and CANCELLED as terminal', () => {
    expect(isTerminal(Status.CLOSED)).toBe(true);
    expect(isTerminal(Status.CANCELLED)).toBe(true);
    expect(isTerminal(Status.OPEN)).toBe(false);
    expect(isTerminal(Status.IN_PROGRESS)).toBe(false);
    expect(isTerminal(Status.RESOLVED)).toBe(false);
  });

  it('exposes the configured next statuses', () => {
    expect(allowedNextStatuses(Status.OPEN)).toEqual([Status.IN_PROGRESS, Status.CANCELLED]);
    expect(allowedNextStatuses(Status.RESOLVED)).toEqual([Status.CLOSED]);
    expect(allowedNextStatuses(Status.CLOSED)).toEqual([]);
  });
});
