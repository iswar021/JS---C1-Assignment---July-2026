import request from 'supertest';
import { createApp } from '../src/app';

jest.mock('../src/modules/comments/comment.repository', () => ({
  commentRepository: { create: jest.fn() },
}));
jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: { exists: jest.fn() },
}));
jest.mock('../src/modules/users/user.repository', () => ({
  userRepository: { existsById: jest.fn() },
}));

import { commentRepository } from '../src/modules/comments/comment.repository';
import { ticketRepository } from '../src/modules/tickets/ticket.repository';
import { userRepository } from '../src/modules/users/user.repository';

const mockedCommentRepo = commentRepository as jest.Mocked<typeof commentRepository>;
const mockedTicketRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const app = createApp();

const TICKET_ID = '99999999-9999-9999-9999-999999999999';
const AUTHOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

beforeEach(() => {
  jest.clearAllMocks();
  mockedTicketRepo.exists.mockResolvedValue(true);
  mockedUserRepo.existsById.mockResolvedValue(true);
});

describe('POST /api/tickets/:id/comments', () => {
  it('adds a comment and returns 201', async () => {
    const now = new Date('2026-07-24T00:00:00.000Z');
    mockedCommentRepo.create.mockResolvedValue({
      id: 'c1',
      ticketId: TICKET_ID,
      message: 'Looking into it',
      createdById: AUTHOR_ID,
      createdAt: now,
      createdBy: { id: AUTHOR_ID, name: 'Bob Agent' },
    } as never);

    const res = await request(app)
      .post(`/api/tickets/${TICKET_ID}/comments`)
      .send({ message: 'Looking into it', createdById: AUTHOR_ID });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 'c1',
      message: 'Looking into it',
      createdBy: { id: AUTHOR_ID, name: 'Bob Agent' },
    });
    expect(mockedCommentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: TICKET_ID, message: 'Looking into it', createdById: AUTHOR_ID }),
    );
  });

  it('returns 404 when the ticket does not exist', async () => {
    mockedTicketRepo.exists.mockResolvedValue(false);

    const res = await request(app)
      .post(`/api/tickets/${TICKET_ID}/comments`)
      .send({ message: 'Hi', createdById: AUTHOR_ID });

    expect(res.status).toBe(404);
    expect(mockedCommentRepo.create).not.toHaveBeenCalled();
  });

  it('returns 400 for an empty message', async () => {
    const res = await request(app)
      .post(`/api/tickets/${TICKET_ID}/comments`)
      .send({ message: '   ', createdById: AUTHOR_ID });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('message');
    expect(mockedCommentRepo.create).not.toHaveBeenCalled();
  });

  it('returns 400 when the author does not exist', async () => {
    mockedUserRepo.existsById.mockResolvedValue(false);

    const res = await request(app)
      .post(`/api/tickets/${TICKET_ID}/comments`)
      .send({ message: 'Hi', createdById: AUTHOR_ID });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('createdById');
  });
});
