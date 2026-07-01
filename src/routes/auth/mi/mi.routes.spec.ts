jest.mock('../../../lib/prisma', () => ({
  prisma: require('../../../__mocks__/prisma').prismaMock,
}));

import { prismaMock } from '../../../__mocks__/prisma';

import app from '../../../app';
import jwt from 'jsonwebtoken';
import request from 'supertest';

describe('Auth Mi', () => {
  const validToken = jwt.sign(
    { userId: 'test-id-123' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  let response = null;

  describe('Success Scenarios', () => {
    it('should expect a 200 from a user being found', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        username: 'test',
        email: 'test@email.com',
        password: 'password',
        id: 'test-id-123',
        bio: null,
        avatar: null,
        createdAt: new Date(),
      });

      response = await request(app)
        .get('/auth/mi')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Failure Scenarios', () => {
    it('should expect a 404 from a user not being found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      response = await request(app)
        .get('/auth/mi')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should expect a 500 when we force an api failure', async () => {
      prismaMock.user.findUnique.mockRejectedValue(
        new Error('Error: does not matter - testing purposes')
      );

      response = await request(app)
        .get('/auth/mi')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(500);
    });
  });
});
