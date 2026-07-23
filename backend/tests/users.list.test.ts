import request from 'supertest';
import { createApp } from '../src/app';

jest.mock('../src/modules/users/user.repository', () => ({
  userRepository: { findAll: jest.fn(), existsById: jest.fn() },
}));

import { userRepository } from '../src/modules/users/user.repository';

const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/users', () => {
  it('returns 200 with the list of users', async () => {
    mockedUserRepo.findAll.mockResolvedValue([
      { id: 'u1', name: 'Alice Admin', email: 'alice@example.com', role: 'ADMIN' },
      { id: 'u2', name: 'Bob Agent', email: 'bob@example.com', role: 'AGENT' },
    ] as never);

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toEqual({
      id: 'u1',
      name: 'Alice Admin',
      email: 'alice@example.com',
      role: 'ADMIN',
    });
  });
});

describe('unmatched routes', () => {
  it('returns a consistent 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
