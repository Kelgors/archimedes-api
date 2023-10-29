import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../libs/HttpException';

export async function privateRoute(req: Request, res: Response, next: NextFunction) {
  if (!req.token) {
    return next(new HttpException(403, 'Forbidden', 'You should connect before calling this endpoint'));
  }
  next();
}
