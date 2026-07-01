import { Request } from 'express';

export interface ValidationRequest extends Request, DecodedToken {}

export interface DecodedToken {
  userId?: string;
}
