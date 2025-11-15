const request = require('supertest');
const app = require('../app');

describe('Rules routes (unauthenticated)', () => {
  it('GET /api/rules without token returns 401', async () => {
    const res = await request(app).get('/api/rules');
    expect(res.statusCode).toBe(401);
  });
});
