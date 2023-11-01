import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { UserRole } from '../models/User';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { HttpException } from '../utils/HttpException';

type PluginOptions = {
  roles: UserRole[];
};
const requireMinRolePlugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options) {
  fastify.withTypeProvider<ZodTypeProvider>().addHook('preHandler', preHandlerBuilder(options));
};

export function preHandlerBuilder(options: PluginOptions): AppPreHandlerAsyncHookHandler {
  return async function preHandler(req, reply) {
    if (!options.roles.includes(req.token.role)) {
      throw new HttpException(401, 'Unauthorized', 'Not sufficient permissions');
    }
  };
}

export default fp(requireMinRolePlugin);
