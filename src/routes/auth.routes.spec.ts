jest.mock('../lib/prisma', () => ({
  prisma: require('../__mocks__/prisma').prismaMock,
}));

import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';

describe('Auth paths', () => {
  describe('Register', () => {
    const path = '/auth/register';
    const payload = {
      username: 'test',
      email: 'test@email.com',
      password: 'password'
    } as any;
    const { username, email, password } = payload;
    let response = null;

    describe('Success scenarios: 201', () => {
      it('should expect a 201 from creating a user with proper data and payload', async () => {
        prismaMock.user.create.mockResolvedValue({
          ...payload,
          id: 'test-id-123',
          bio: null,
          avatar: null,
          createdAt: new Date()
        });

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(201);
      });
    });

    describe('Error scenarios: 400', () => {
      it('should expect a 400 from any field missing from the request body', async () => {
        response = await request(app).post(path).send({ username, email } as any);

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({ email, password } as any);

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({ username, password } as any);

        expect(response.status).toBe(400);
      });

      it('should expect a 400 when an invalid email is sent', async () => {
        response = await request(app).post(path).send({ username, email: 'doesntmatter.com' } as any);

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({ username, email: 'doesntmatter@test' } as any);

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({ username, email: '' } as any);

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({ username, email: null } as any);

        expect(response.status).toBe(400);

        response = await request(app).post(path).send({ username, email: undefined } as any);

        expect(response.status).toBe(400);
      });
    });

    describe('Error scenarios: 409', () => {
      it('should expect a 409 when trying to register an existing user', async () => {
        prismaMock.user.create.mockRejectedValue({code: 'P2002' });

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(409);
      });
    });

    describe('Error scenarios: 500', () => {
      it('should expect a 500 when we force an api failure', async () => {
        prismaMock.user.create.mockRejectedValue(new Error('Error: does not matter - testing purposes'));

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(500);
      });
    });
  });
})
