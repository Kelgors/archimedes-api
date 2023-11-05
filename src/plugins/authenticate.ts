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
    /**
     * Authenticate through the Authorization header.
     * Anonymous connections will be rejected.
     * Provide {@link FastifyRequest.token} property.
     * You must not use {@link FastifyRequest.tokenOpt}.
     */
    authenticate: AppPreHandlerAsyncHookHandler;
    /**
     * Authenticate through the Authorization header.
     * Anonymous connection will be accepted.
     * Provide {@link FastifyRequest.tokenOpt} property.
     * You should not use {@link FastifyRequest.token}.
     */
    tryAuthenticate: AppPreHandlerAsyncHookHandler;
  }
  interface FastifyRequest {
    token: AccessToken;
    tokenOpt: AccessToken | undefined;
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
      req.tokenOpt = await AccessTokenSchema.parseAsync(req.user);
    } catch (err) {
      if (getErrorCode(err) !== 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        throw err;
      }
    }
  });
};

export default fp(setupJwtTokenAuth);
