import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { UserRole } from '../models/User';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { HttpException } from '../utils/HttpException';

type PluginOptions = {
  minRole: UserRole;
};
const requireMinRolePlugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options) {
  fastify.withTypeProvider<ZodTypeProvider>().addHook('preHandler', preHandlerBuilder(options));
};

export function preHandlerBuilder(options: PluginOptions): AppPreHandlerAsyncHookHandler {
  return async function preHandler(req, reply) {
    if (req.token.role < options.minRole) {
      throw new HttpException(403, 'Forbidden', 'Not sufficient permissions');
    }
  };
}

export default fp(requireMinRolePlugin, '4.x');
