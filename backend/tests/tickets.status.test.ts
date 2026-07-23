import request from 'supertest';
import { Status } from '@prisma/client';
import { createApp } from '../src/app';

jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: {
    findById: jest.fn(),
    updateStatus: jest.fn(),
    exists: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

import { ticketRepository } from '../src/modules/tickets/ticket.repository';

const mockedRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const app = createApp();

const TICKET_ID = '66666666-6666-6666-6666-666666666666';

function fakeTicket(status: Status) {
  const now = new Date('2026-07-24T00:00:00.000Z');
  return {
    id: TICKET_ID,
    title: 'T',
    description: 'D',
    priority: 'MEDIUM',
    status,
    assignedToId: null,
    createdById: 'user-1',
    createdAt: now,
    updatedAt: now,
    assignedTo: null,
    createdBy: { id: 'user-1', name: 'Alice' },
    comments: [],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PATCH /api/tickets/:id/status — valid transitions', () => {
  const valid: [Status, Status][] = [
    ['OPEN', 'IN_PROGRESS'],
    ['OPEN', 'CANCELLED'],
    ['IN_PROGRESS', 'RESOLVED'],
    ['IN_PROGRESS', 'CANCELLED'],
    ['RESOLVED', 'CLOSED'],
  ] as [Status, Status][];

  it.each(valid)('allows %s -> %s (200)', async (from, to) => {
    mockedRepo.findById.mockResolvedValue(fakeTicket(from) as never);
    mockedRepo.updateStatus.mockResolvedValue({ ...fakeTicket(to) } as never);

    const res = await request(app).patch(`/api/tickets/${TICKET_ID}/status`).send({ status: to });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(to);
    expect(mockedRepo.updateStatus).toHaveBeenCalledWith(TICKET_ID, to);
  });
});

describe('PATCH /api/tickets/:id/status — invalid transitions', () => {
  const invalid: [Status, Status][] = [
    ['OPEN', 'RESOLVED'],
    ['OPEN', 'CLOSED'],
    ['OPEN', 'OPEN'],
    ['IN_PROGRESS', 'CLOSED'],
    ['RESOLVED', 'IN_PROGRESS'],
    ['CLOSED', 'OPEN'],
    ['CANCELLED', 'IN_PROGRESS'],
  ] as [Status, Status][];

  it.each(invalid)('rejects %s -> %s (409)', async (from, to) => {
    mockedRepo.findById.mockResolvedValue(fakeTicket(from) as never);

    const res = await request(app).patch(`/api/tickets/${TICKET_ID}/status`).send({ status: to });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
    expect(mockedRepo.updateStatus).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/tickets/:id/status — errors', () => {
  it('returns 404 when the ticket does not exist', async () => {
    mockedRepo.findById.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}/status`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}/status`)
      .send({ status: 'NOPE' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockedRepo.findById).not.toHaveBeenCalled();
  });
});
