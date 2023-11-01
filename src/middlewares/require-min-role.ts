import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../models/User';
import { HttpException } from '../utils/HttpException';

export function requireMinRole(minRoleValue: UserRole) {
  return function minRoleHandler(req: Request, res: Response, next: NextFunction) {
    const role = req.token.role;
    if (role < minRoleValue) {
      return next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
    }
    return next();
  };
}