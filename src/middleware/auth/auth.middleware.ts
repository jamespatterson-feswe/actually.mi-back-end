import { Response, NextFunction } from 'express';
import { DecodedToken, ValidationRequest } from './auth.interface';

import jwt from 'jsonwebtoken';

export const validator = (
  req: ValidationRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401).json({
      statusDesc: !authorization
        ? 'Error: no authorization token found.'
        : 'Error: token is missing Bearer signature.',
    });

    return;
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.userId = (decoded as DecodedToken).userId;

    next();
  } catch (error) {
    res.status(401).json({
      statusDesc:
        error instanceof jwt.TokenExpiredError
          ? 'Error: the token used has expired.'
          : 'Error: Invalid token.',
    });
  }
};
