import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import jwt, { Algorithm } from 'jsonwebtoken';
import { Token, TokenSchema } from '../schemas/Auth';
import { AppPreHandlerAsyncHookHandler } from '../utils/AppRouteOptions';
import { HttpException } from '../utils/HttpException';

type PluginOptions = {
  secret: string;
  algorithms: Algorithm[];
};

declare module 'fastify' {
  interface FastifyInstance {
    parseJwtToken: AppPreHandlerAsyncHookHandler;
  }
  interface FastifyRequest {
    token: Token;
  }
}

const handleJwtToken: FastifyPluginAsync<PluginOptions> = async function (fastify, options) {
  fastify.decorateRequest('token', null);
  fastify.decorate('parseJwtToken', async function (req) {
    const token = (req.headers['authorization'] || '').split(' ')[1];
    if (!token) {
      throw new HttpException(403, 'You need to provide a valid jwt token');
    }
    try {
      const decoded = jwt.verify(token, options.secret, {
        algorithms: options.algorithms,
      });
      if (typeof decoded === 'string') {
        throw new HttpException(500, 'UnhandledDecodedString');
      }
      req.token = await TokenSchema.parseAsync(decoded);
    } catch (err) {
      throw new HttpException(400, 'Invalid token');
    }
  });
};

export default fp(handleJwtToken, '4.x');
