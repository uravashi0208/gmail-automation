const request = require('supertest');
const app = require('../app');

describe('Auth routes (smoke)', () => {
  it('GET / returns ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/auth/google/url should return auth url', async () => {
    const res = await request(app).get('/api/auth/google/url');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('url');
    expect(typeof res.body.url).toBe('string');
  });
});
