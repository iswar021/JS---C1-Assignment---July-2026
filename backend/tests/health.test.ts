import request from 'supertest';
import { createApp } from '../src/app';

/**
 * Smoke test proving the Jest + Supertest wiring works and the app boots.
 * Does not touch the database. Full API/state-machine integration tests are
 * added in the testing milestone.
 */
describe('GET /health', () => {
  it('returns 200 with { status: "ok" }', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
