import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { HttpException } from '../utils/HttpException';

declare module 'fastify' {
  interface FastifyInstance {
    ensureToken: AppPreHandlerAsyncHookHandler;
  }
}

const requireJwtTokenPlugin: FastifyPluginAsync<never> = async function (fastify, options) {
  fastify.decorate('ensureToken', async function (req) {
    if (!req.token) {
      throw new HttpException(403, 'Forbidden', 'You should connect before calling this endpoint');
    }
  });
};

export default fp(requireJwtTokenPlugin, '4.x');
