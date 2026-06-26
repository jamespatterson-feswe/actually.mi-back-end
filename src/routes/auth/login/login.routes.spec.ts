jest.mock('../../../lib/prisma', () => ({
  prisma: require('../../../__mocks__/prisma').prismaMock,
}));

import { prismaMock } from '../../../__mocks__/prisma';

import app from '../../../app';
import bcrypt from 'bcrypt';
import request from 'supertest';

describe('Auth paths', () => {
  let response = null;

  describe('/auth/login', () => {
    const path = '/auth/login';
    const payload = {
      email: 'test@email.com',
      password: 'password',
    } as any;
    const { email, password } = payload;

    describe('Success scenarios: 200', () => {
      it('should expect 200 from a successful login with proper credentials', async () => {
        const hashedPassword = await bcrypt.hash(password, 10);

        prismaMock.user.findUnique.mockResolvedValue({
          ...payload,
          username: 'test',
          password: hashedPassword,
          id: 'test-id-123',
          bio: null,
          avatar: null,
          createdAt: new Date(),
        });

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(200);
      });
    });

    describe('Error scenarios: 400', () => {
      it('should expect a 400 from email and or password missing', async () => {
        const hashedPassword = await bcrypt.hash(password, 10);

        prismaMock.user.create.mockResolvedValue({
          ...payload,
          username: 'test',
          password: hashedPassword,
          id: 'test-id-123',
          bio: null,
          avatar: null,
          createdAt: new Date(),
        });

        response = await request(app).post(path).send({ password });

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({ email });

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({});

        expect(response.status).toBe(400);
      });
    });

    describe('Error scenarios: 401', () => {
      it('should expect a 401 when the password is not a solid comparison', async () => {
        const hashedPassword = await bcrypt.hash(password, 10);

        prismaMock.user.findUnique.mockResolvedValue({
          ...payload,
          username: 'test',
          password: hashedPassword,
          id: 'test-id-123',
          bio: null,
          avatar: null,
          createdAt: new Date(),
        });

        response = await request(app)
          .post(path)
          .send({ email, password: 'blah' });

        expect(response.status).toBe(401);
      });
    });

    describe('Error scenarios: 404', () => {
      it('should expect a 404 from no login details, either null or undefined', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(404);

        prismaMock.user.findUnique.mockResolvedValue(undefined as any);

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(404);
      });
    });

    describe('Error scenarios: 500', () => {
      it('should expect a 500 from the api error', async () => {
        prismaMock.user.findUnique.mockRejectedValue(
          new Error('Error: does not matter - testing purposes')
        );

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(500);
      });
    });
  });
});
