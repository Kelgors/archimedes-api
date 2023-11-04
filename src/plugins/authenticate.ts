import fastifyJwt from '@fastify/jwt';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { JWT_SECRET } from '../config';
import type { AccessToken } from '../schemas/Auth';
import { AccessTokenSchema } from '../schemas/Auth';
import type { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: AppPreHandlerAsyncHookHandler;
  }
  interface FastifyRequest {
    token: AccessToken;
  }
}

const setupJwtTokenAuth: FastifyPluginAsync<never> = async function (fastify) {
  fastify.register(fastifyJwt, {
    secret: JWT_SECRET,
  });

  fastify.decorate('authenticate', async function (req, _reply) {
    await req.jwtVerify();
    req.token = await AccessTokenSchema.parseAsync(req.user);
  });
};

export default fp(setupJwtTokenAuth);
