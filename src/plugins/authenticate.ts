import fastifyJwt from '@fastify/jwt';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { JWT_SECRET } from '../config';
import type { AccessToken } from '../schemas/Auth';
import { AccessTokenSchema } from '../schemas/Auth';
import type { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { getErrorCode } from '../utils/error-utils';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: AppPreHandlerAsyncHookHandler;
    tryAuthenticate: AppPreHandlerAsyncHookHandler;
  }
  interface FastifyRequest {
    token: AccessToken;
    tryToken: AccessToken | undefined;
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

  fastify.decorate('tryAuthenticate', async function (req, _reply) {
    try {
      await req.jwtVerify();
      req.tryToken = await AccessTokenSchema.parseAsync(req.user);
    } catch (err) {
      if (getErrorCode(err) !== 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        throw err;
      }
    }
  });
};

export default fp(setupJwtTokenAuth);
