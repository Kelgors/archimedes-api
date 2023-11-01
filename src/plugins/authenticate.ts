import fastifyJwt from '@fastify/jwt';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { JWT_SECRET } from '../config';
import { Token, TokenSchema } from '../schemas/Auth';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { HttpException } from '../utils/HttpException';

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
      if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string') {
        throw new HttpException(401, err.message);
      }
      throw err;
    }
  });
};

export default fp(setupJwtTokenAuth);
