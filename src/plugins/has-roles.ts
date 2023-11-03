import { UserRole } from '../models/User';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { AppError, AppErrorCode } from '../utils/ApplicationError';

export function hasRoles(...roles: UserRole[]): AppPreHandlerAsyncHookHandler {
  return async function preHandler(req, reply) {
    if (!roles.includes(req.token.role)) {
      throw new AppError(AppErrorCode.MISSING_PERMISSIONS);
    }
  };
}
