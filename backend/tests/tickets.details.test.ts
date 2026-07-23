import request from 'supertest';
import { createApp } from '../src/app';

jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: { findById: jest.fn(), list: jest.fn(), create: jest.fn() },
}));

import { ticketRepository } from '../src/modules/tickets/ticket.repository';

const mockedTicketRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const app = createApp();

const TICKET_ID = '33333333-3333-3333-3333-333333333333';

function fakeDetailedTicket() {
  const now = new Date('2026-07-24T00:00:00.000Z');
  return {
    id: TICKET_ID,
    title: 'Cannot log in',
    description: '500 on submit',
    priority: 'HIGH',
    status: 'OPEN',
    assignedToId: 'user-2',
    createdById: 'user-1',
    createdAt: now,
    updatedAt: now,
    assignedTo: { id: 'user-2', name: 'Bob Agent' },
    createdBy: { id: 'user-1', name: 'Dave Requester' },
    comments: [
      {
        id: 'c1',
        ticketId: TICKET_ID,
        message: 'Investigating.',
        createdById: 'user-2',
        createdAt: now,
        createdBy: { id: 'user-2', name: 'Bob Agent' },
      },
    ],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/tickets/:id', () => {
  it('returns 200 with the ticket and its comments', async () => {
    mockedTicketRepo.findById.mockResolvedValue(fakeDetailedTicket() as never);

    const res = await request(app).get(`/api/tickets/${TICKET_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: TICKET_ID,
      title: 'Cannot log in',
      status: 'OPEN',
      createdBy: { id: 'user-1', name: 'Dave Requester' },
      assignedTo: { id: 'user-2', name: 'Bob Agent' },
    });
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0]).toMatchObject({
      id: 'c1',
      message: 'Investigating.',
      createdBy: { id: 'user-2', name: 'Bob Agent' },
    });
    expect(mockedTicketRepo.findById).toHaveBeenCalledWith(TICKET_ID);
  });

  it('returns 404 when the ticket does not exist', async () => {
    mockedTicketRepo.findById.mockResolvedValue(null);

    const res = await request(app).get(`/api/tickets/${TICKET_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for a malformed (non-uuid) id', async () => {
    const res = await request(app).get('/api/tickets/not-a-uuid');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('id');
    expect(mockedTicketRepo.findById).not.toHaveBeenCalled();
  });
});
