import { UserRole } from '../models/User';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { HttpException } from '../utils/HttpException';

export function hasRoles(...roles: UserRole[]): AppPreHandlerAsyncHookHandler {
  return async function preHandler(req, reply) {
    if (!roles.includes(req.token.role)) {
      throw new HttpException(401, 'Unauthorized', 'Not sufficient permissions');
    }
  };
}
