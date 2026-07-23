import request from 'supertest';
import { createApp } from '../src/app';

jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: { list: jest.fn(), create: jest.fn() },
}));

import { ticketRepository } from '../src/modules/tickets/ticket.repository';

const mockedTicketRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const app = createApp();

function fakeTicket(id: string) {
  const now = new Date('2026-07-24T00:00:00.000Z');
  return {
    id,
    title: `Ticket ${id}`,
    description: 'desc',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedToId: null,
    createdById: 'user-1',
    createdAt: now,
    updatedAt: now,
    assignedTo: null,
    createdBy: { id: 'user-1', name: 'Alice Admin' },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/tickets', () => {
  it('returns 200 with data and pagination using defaults', async () => {
    mockedTicketRepo.list.mockResolvedValue({
      items: [fakeTicket('t1'), fakeTicket('t2')] as never,
      total: 2,
    });

    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toEqual({ page: 1, pageSize: 20, total: 2, totalPages: 1 });
    // list items are the light summary (no comments field)
    expect(res.body.data[0]).not.toHaveProperty('comments');
    // default paging → skip 0, take 20
    expect(mockedTicketRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it('passes keyword search and status filter to the repository', async () => {
    mockedTicketRepo.list.mockResolvedValue({ items: [], total: 0 });

    const res = await request(app).get('/api/tickets').query({ q: 'login', status: 'OPEN' });

    expect(res.status).toBe(200);
    expect(mockedTicketRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'login', status: 'OPEN' }),
    );
  });

  it('computes pagination and offset correctly', async () => {
    mockedTicketRepo.list.mockResolvedValue({ items: [], total: 25 });

    const res = await request(app).get('/api/tickets').query({ page: 2, pageSize: 10 });

    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual({ page: 2, pageSize: 10, total: 25, totalPages: 3 });
    expect(mockedTicketRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('returns 400 for an invalid status filter', async () => {
    const res = await request(app).get('/api/tickets').query({ status: 'NOPE' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('status');
    expect(mockedTicketRepo.list).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid pagination (page < 1)', async () => {
    const res = await request(app).get('/api/tickets').query({ page: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('page');
    expect(mockedTicketRepo.list).not.toHaveBeenCalled();
  });
});
