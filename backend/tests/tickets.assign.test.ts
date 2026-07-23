import request from 'supertest';
import { createApp } from '../src/app';

jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: { exists: jest.fn(), update: jest.fn() },
}));
jest.mock('../src/modules/users/user.repository', () => ({
  userRepository: { existsById: jest.fn() },
}));

import { ticketRepository } from '../src/modules/tickets/ticket.repository';
import { userRepository } from '../src/modules/users/user.repository';

const mockedRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const app = createApp();

const TICKET_ID = '77777777-7777-7777-7777-777777777777';
const ASSIGNEE_ID = '88888888-8888-8888-8888-888888888888';

function fakeTicket(assignedToId: string | null) {
  const now = new Date('2026-07-24T00:00:00.000Z');
  return {
    id: TICKET_ID,
    title: 'T',
    description: 'D',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedToId,
    createdById: 'user-1',
    createdAt: now,
    updatedAt: now,
    assignedTo: assignedToId ? { id: assignedToId, name: 'Bob Agent' } : null,
    createdBy: { id: 'user-1', name: 'Alice' },
    comments: [],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedRepo.exists.mockResolvedValue(true);
  mockedUserRepo.existsById.mockResolvedValue(true);
});

describe('PATCH /api/tickets/:id/assign', () => {
  it('assigns a ticket to a user (200)', async () => {
    mockedRepo.update.mockResolvedValue(fakeTicket(ASSIGNEE_ID) as never);

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}/assign`)
      .send({ assignedToId: ASSIGNEE_ID });

    expect(res.status).toBe(200);
    expect(res.body.assignedTo).toEqual({ id: ASSIGNEE_ID, name: 'Bob Agent' });
    expect(mockedRepo.update).toHaveBeenCalledWith(TICKET_ID, { assignedToId: ASSIGNEE_ID });
  });

  it('unassigns a ticket when assignedToId is null (200)', async () => {
    mockedRepo.update.mockResolvedValue(fakeTicket(null) as never);

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}/assign`)
      .send({ assignedToId: null });

    expect(res.status).toBe(200);
    expect(res.body.assignedTo).toBeNull();
    expect(mockedUserRepo.existsById).not.toHaveBeenCalled();
  });

  it('returns 404 when the ticket does not exist', async () => {
    mockedRepo.exists.mockResolvedValue(false);

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}/assign`)
      .send({ assignedToId: ASSIGNEE_ID });

    expect(res.status).toBe(404);
    expect(mockedRepo.update).not.toHaveBeenCalled();
  });

  it('returns 400 when the assignee does not exist', async () => {
    mockedUserRepo.existsById.mockResolvedValue(false);

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}/assign`)
      .send({ assignedToId: ASSIGNEE_ID });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('assignedToId');
  });

  it('returns 400 when assignedToId is missing', async () => {
    const res = await request(app).patch(`/api/tickets/${TICKET_ID}/assign`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
