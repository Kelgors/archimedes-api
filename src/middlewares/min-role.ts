import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../HttpException';

function minRoleHandler(minRoleValue: number, req: Request, res: Response, next: NextFunction) {
  const role = req.context.user?.role || 0;
  if (role < minRoleValue) {
    next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
    return;
  }
  next();
}

export function minRole(minRoleValue: number) {
  return minRoleHandler.bind(global, minRoleValue);
}
