import request from 'supertest';
import { createApp } from '../src/app';

jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: {
    exists: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../src/modules/users/user.repository', () => ({
  userRepository: { existsById: jest.fn() },
}));

import { ticketRepository } from '../src/modules/tickets/ticket.repository';
import { userRepository } from '../src/modules/users/user.repository';

const mockedTicketRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const app = createApp();

const TICKET_ID = '44444444-4444-4444-4444-444444444444';
const ASSIGNEE_ID = '55555555-5555-5555-5555-555555555555';

function fakeUpdatedTicket(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-07-24T00:00:00.000Z');
  return {
    id: TICKET_ID,
    title: 'Updated title',
    description: 'Updated description',
    priority: 'LOW',
    status: 'OPEN',
    assignedToId: ASSIGNEE_ID,
    createdById: 'user-1',
    createdAt: now,
    updatedAt: now,
    assignedTo: { id: ASSIGNEE_ID, name: 'Bob Agent' },
    createdBy: { id: 'user-1', name: 'Dave Requester' },
    comments: [],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedTicketRepo.exists.mockResolvedValue(true);
  mockedUserRepo.existsById.mockResolvedValue(true);
});

describe('PATCH /api/tickets/:id', () => {
  it('updates fields and returns 200 with the updated ticket', async () => {
    mockedTicketRepo.update.mockResolvedValue(fakeUpdatedTicket() as never);

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}`)
      .send({ title: 'Updated title', priority: 'LOW', assignedToId: ASSIGNEE_ID });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: TICKET_ID, title: 'Updated title', priority: 'LOW' });
    expect(mockedTicketRepo.update).toHaveBeenCalledWith(
      TICKET_ID,
      expect.objectContaining({ title: 'Updated title', priority: 'LOW', assignedToId: ASSIGNEE_ID }),
    );
  });

  it('allows unassigning by setting assignedToId to null', async () => {
    mockedTicketRepo.update.mockResolvedValue(
      fakeUpdatedTicket({ assignedToId: null, assignedTo: null }) as never,
    );

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}`)
      .send({ assignedToId: null });

    expect(res.status).toBe(200);
    expect(res.body.assignedTo).toBeNull();
    expect(mockedTicketRepo.update).toHaveBeenCalledWith(
      TICKET_ID,
      expect.objectContaining({ assignedToId: null }),
    );
    // null assignee must NOT trigger a user-existence check
    expect(mockedUserRepo.existsById).not.toHaveBeenCalled();
  });

  it('returns 404 when the ticket does not exist', async () => {
    mockedTicketRepo.exists.mockResolvedValue(false);

    const res = await request(app).patch(`/api/tickets/${TICKET_ID}`).send({ title: 'X' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(mockedTicketRepo.update).not.toHaveBeenCalled();
  });

  it('rejects attempts to change status here (400)', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}`)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockedTicketRepo.update).not.toHaveBeenCalled();
  });

  it('returns 400 when no fields are provided', async () => {
    const res = await request(app).patch(`/api/tickets/${TICKET_ID}`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockedTicketRepo.update).not.toHaveBeenCalled();
  });

  it('returns 400 when the assignee does not exist', async () => {
    mockedUserRepo.existsById.mockResolvedValue(false);

    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}`)
      .send({ assignedToId: ASSIGNEE_ID });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('assignedToId');
    expect(mockedTicketRepo.update).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid priority value', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${TICKET_ID}`)
      .send({ priority: 'SUPER' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('priority');
  });
});
