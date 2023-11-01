import fastifyJwt from '@fastify/jwt';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { JWT_SECRET } from '../config';
import { Token, TokenSchema } from '../schemas/Auth';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: AppPreHandlerAsyncHookHandler;
  }
  interface FastifyRequest {
    token: Token;
  }
}

const setupJwtTokenAuth: FastifyPluginAsync<never> = async function (fastify) {
  fastify.register(fastifyJwt, {
    secret: JWT_SECRET,
  });

  fastify.decorate('authenticate', async function (req, reply) {
    try {
      await req.jwtVerify();
      req.token = await TokenSchema.parseAsync(req.user);
    } catch (err) {
      console.dir(err);
      throw err;
    }
  });
};

export default fp(setupJwtTokenAuth);
