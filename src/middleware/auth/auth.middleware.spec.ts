import { NextFunction, Response } from 'express';
import { validator } from './auth.middleware';
import { ValidationRequest } from './auth.interface';

import jwt from 'jsonwebtoken';

describe('Authorization validation', () => {
  const expiredToken = jwt.sign(
    { userId: 'test-id' },
    process.env.JWT_SECRET!,
    { expiresIn: '-10s' }
  );
  const invalidToken = 'invalid-token!';
  const validToken = jwt.sign({ userId: 'test-id' }, process.env.JWT_SECRET!, {
    expiresIn: '10s',
  });
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn() as unknown as NextFunction;
  });

  describe('Error scenarios', () => {
    it('should expect to return a 401 when no authorization header is present', () => {
      validator(
        { headers: {}, userId: '' } as unknown as ValidationRequest,
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        statusDesc: 'Error: no authorization token found.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should expect to return a 401 when no Bearer is appended to token', () => {
      validator(
        {
          headers: { authorization: invalidToken },
          userId: '',
        } as unknown as ValidationRequest,
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        statusDesc: 'Error: token is missing Bearer signature.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should expect to return a 401 when token is invalid', () => {
      validator(
        {
          headers: { authorization: `Bearer ${invalidToken}` },
          userId: '',
        } as unknown as ValidationRequest,
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        statusDesc: 'Error: Invalid token.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should expect a 401 when token is expired', () => {
      validator(
        {
          headers: { authorization: `Bearer ${expiredToken}` },
          userId: '',
        } as unknown as ValidationRequest,
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        statusDesc: 'Error: the token used has expired.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Success scenarios', () => {
    it('should expect next to be called', () => {
      validator(
        {
          headers: { authorization: `Bearer ${validToken}` },
          userId: 'test-id',
        } as unknown as ValidationRequest,
        res,
        next
      );

      expect(next).toHaveBeenCalled();
    });
  });
});
