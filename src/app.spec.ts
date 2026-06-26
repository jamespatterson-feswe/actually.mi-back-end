import app from './app';
import request from 'supertest';

describe('App', () => {
  describe('Health check', () => {
    it('should expect a 200 from the health route', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
    });
  });

  describe('Unknown path', () => {
    it('should expect a 404 from any path unknown to routes', async () => {
      let response = await request(app).post('/does/not/matter').send({
        id: 123,
        email: 'testing@test.com',
        username: 'does-not-matter',
      });

      expect(response.status).toBe(404);

      response = await request(app).get('/auth/blah');

      expect(response.status).toBe(404);
    });
  });
});
