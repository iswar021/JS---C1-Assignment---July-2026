import request from 'supertest';
import { createApp } from '../src/app';

// The repository layers are mocked so these tests run without a database while
// still exercising the full HTTP → validation → controller → service pipeline.
jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: { create: jest.fn() },
}));
jest.mock('../src/modules/users/user.repository', () => ({
  userRepository: { existsById: jest.fn() },
}));

import { ticketRepository } from '../src/modules/tickets/ticket.repository';
import { userRepository } from '../src/modules/users/user.repository';

const mockedTicketRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;

const app = createApp();

const CREATOR_ID = '11111111-1111-1111-1111-111111111111';
const ASSIGNEE_ID = '22222222-2222-2222-2222-222222222222';

const validBody = {
  title: 'Cannot log in',
  description: 'User receives a 500 error on submit',
  priority: 'HIGH',
  createdById: CREATOR_ID,
  assignedToId: ASSIGNEE_ID,
};

function fakeCreatedTicket() {
  const now = new Date('2026-07-24T00:00:00.000Z');
  return {
    id: 'ticket-1',
    title: validBody.title,
    description: validBody.description,
    priority: 'HIGH',
    status: 'OPEN',
    assignedToId: ASSIGNEE_ID,
    createdById: CREATOR_ID,
    createdAt: now,
    updatedAt: now,
    assignedTo: { id: ASSIGNEE_ID, name: 'Bob Agent' },
    createdBy: { id: CREATOR_ID, name: 'Dave Requester' },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUserRepo.existsById.mockResolvedValue(true);
});

describe('POST /api/tickets', () => {
  it('creates a ticket and returns 201 with the created resource', async () => {
    mockedTicketRepo.create.mockResolvedValue(fakeCreatedTicket() as never);

    const res = await request(app).post('/api/tickets').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 'ticket-1',
      title: validBody.title,
      priority: 'HIGH',
      status: 'OPEN',
      createdBy: { id: CREATOR_ID, name: 'Dave Requester' },
      assignedTo: { id: ASSIGNEE_ID, name: 'Bob Agent' },
      comments: [],
    });
    expect(mockedTicketRepo.create).toHaveBeenCalledTimes(1);
  });

  it('defaults status to OPEN and never accepts a client-provided status', async () => {
    mockedTicketRepo.create.mockResolvedValue(fakeCreatedTicket() as never);

    await request(app)
      .post('/api/tickets')
      .send({ ...validBody, status: 'CLOSED' });

    // status is stripped by the schema and never forwarded to the repository
    const forwarded = mockedTicketRepo.create.mock.calls[0][0];
    expect(forwarded).not.toHaveProperty('status');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ priority: 'HIGH', createdById: CREATOR_ID });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('title');
    expect(res.body.error.details).toHaveProperty('description');
    expect(mockedTicketRepo.create).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid priority value', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ ...validBody, priority: 'SUPER' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('priority');
  });

  it('returns 400 when createdById does not reference an existing user', async () => {
    mockedUserRepo.existsById.mockResolvedValue(false);

    const res = await request(app).post('/api/tickets').send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('createdById');
    expect(mockedTicketRepo.create).not.toHaveBeenCalled();
  });

  it('returns 400 when assignedToId does not reference an existing user', async () => {
    // creator exists, assignee does not
    mockedUserRepo.existsById.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const res = await request(app).post('/api/tickets').send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('assignedToId');
    expect(mockedTicketRepo.create).not.toHaveBeenCalled();
  });
});
