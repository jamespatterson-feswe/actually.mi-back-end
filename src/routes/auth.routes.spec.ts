jest.mock('../lib/prisma', () => ({
  prisma: require('../__mocks__/prisma').prismaMock,
}));

import { prismaMock } from '../__mocks__/prisma';

import app from '../app';
import bcrypt from 'bcrypt';
import request from 'supertest';

describe('Auth paths', () => {
  let response = null;

  describe('/auth/register', () => {
    const path = '/auth/register';
    const payload = {
      username: 'test',
      email: 'test@email.com',
      password: 'password',
    } as any;
    const { username, email, password } = payload;

    describe('Success scenarios: 201', () => {
      it('should expect a 201 from creating a user with proper data and payload', async () => {
        prismaMock.user.create.mockResolvedValue({
          ...payload,
          id: 'test-id-123',
          bio: null,
          avatar: null,
          createdAt: new Date(),
        });

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(201);
      });
    });

    describe('Error scenarios: 400', () => {
      it('should expect a 400 from any field missing from the request body', async () => {
        response = await request(app)
          .post(path)
          .send({ username, email } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ email, password } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, password } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: 'test.test.com', password } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: '', password } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: '.com', password } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: 'test@test', password } as any);

        expect(response.status).toBe(400);
      });

      it('should expect a 400 when an invalid email is sent', async () => {
        response = await request(app)
          .post(path)
          .send({ username, email: 'doesntmatter.com' } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: 'doesntmatter@test' } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: '' } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: null } as any);

        expect(response.status).toBe(400);

        response = await request(app)
          .post(path)
          .send({ username, email: undefined } as any);

        expect(response.status).toBe(400);
      });
    });

    describe('Error scenarios: 409', () => {
      it('should expect a 409 when trying to register an existing user', async () => {
        prismaMock.user.create.mockRejectedValue({ code: 'P2002' });

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(409);
      });
    });

    describe('Error scenarios: 500', () => {
      it('should expect a 500 when we force an api failure', async () => {
        prismaMock.user.create.mockRejectedValue(
          new Error('Error: does not matter - testing purposes')
        );

        response = await request(app).post(path).send(payload);

        expect(response.status).toBe(500);
      });
    });
  });

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
