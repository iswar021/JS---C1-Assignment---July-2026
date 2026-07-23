import request from 'supertest';
import { createApp } from '../src/app';

jest.mock('../src/modules/tickets/ticket.repository', () => ({
  ticketRepository: { list: jest.fn() },
}));

import { ticketRepository } from '../src/modules/tickets/ticket.repository';

const mockedRepo = ticketRepository as jest.Mocked<typeof ticketRepository>;
const app = createApp();

const ASSIGNEE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

beforeEach(() => {
  jest.clearAllMocks();
  mockedRepo.list.mockResolvedValue({ items: [], total: 0 });
});

describe('GET /api/tickets — filters & sorting', () => {
  it('passes priority and assignedTo filters to the repository', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .query({ priority: 'HIGH', assignedTo: ASSIGNEE_ID });

    expect(res.status).toBe(200);
    expect(mockedRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'HIGH', assignedTo: ASSIGNEE_ID }),
    );
  });

  it('defaults sorting to updatedAt desc and accepts overrides', async () => {
    await request(app).get('/api/tickets');
    expect(mockedRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'updatedAt', sortOrder: 'desc' }),
    );

    mockedRepo.list.mockClear();
    await request(app).get('/api/tickets').query({ sortBy: 'priority', sortOrder: 'asc' });
    expect(mockedRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'priority', sortOrder: 'asc' }),
    );
  });

  it('returns 400 for an invalid priority filter', async () => {
    const res = await request(app).get('/api/tickets').query({ priority: 'SUPER' });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('priority');
  });

  it('returns 400 for an invalid sortBy value', async () => {
    const res = await request(app).get('/api/tickets').query({ sortBy: 'title' });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('sortBy');
    expect(mockedRepo.list).not.toHaveBeenCalled();
  });
});
