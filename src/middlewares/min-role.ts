import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../libs/HttpException';
import { UserRole } from '../schemas/User';

export function minRole(minRoleValue: UserRole) {
  return function minRoleHandler(req: Request, res: Response, next: NextFunction) {
    const role = req.context.user?.role || 0;
    if (role < minRoleValue) {
      return next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
    }
    return next();
  };
}
