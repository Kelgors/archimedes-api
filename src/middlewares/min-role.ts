import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../HttpException';
import { UserRole } from '../schemas/User';

function minRoleHandler(minRoleValue: UserRole, req: Request, res: Response, next: NextFunction) {
  const role = req.context.user?.role || 0;
  if (role < minRoleValue) {
    next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
    return;
  }
  next();
}

export function minRole(minRoleValue: UserRole) {
  return minRoleHandler.bind(global, minRoleValue);
}
