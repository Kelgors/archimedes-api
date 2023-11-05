import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ZodError } from 'zod';
import { NODE_ENV } from '../config';
import { HttpException } from '../utils/HttpException';
import errorMessagesMap from '../utils/error-messages';
import { getErrorCode } from '../utils/error-utils';
import buildAuthRoutes from './auth';
import buildListRoutes from './lists';
import buildTagRoutes from './tags';
import buildUserRoutes from './users';

const routesBuilder: FastifyPluginAsync<never> = async function (fastify) {
  buildAuthRoutes(fastify);
  buildUserRoutes(fastify);
  buildTagRoutes(fastify);
  buildListRoutes(fastify);

  fastify.get('/api/ping', function (_req, reply) {
    reply.code(200).send('pong');
  });

  fastify.all('/api/*', function (req, _reply) {
    throw new HttpException(404, `Route ${req.method}:${req.url} not found`);
  });

  fastify.setErrorHandler(async function (err: unknown, req, reply) {
    if (typeof err !== 'object' || !err) {
      return reply.code(500).send({
        error: {
          code: 500,
          message: 'error format error',
        },
      });
    }
    if (err instanceof EntityNotFoundError) {
      err = new HttpException(404, 'Not found');
    } else if (err instanceof QueryFailedError) {
      err = new HttpException(422, err.message, err);
    } else if (err instanceof ZodError) {
      err = new HttpException(400, 'Invalid format', err.issues, true);
    } else {
      const errorCode = getErrorCode(err);
      if (errorCode && errorCode in errorMessagesMap) {
        err = errorMessagesMap[errorCode](err);
      }
    }
    if (err instanceof HttpException) {
      return reply.code(err.code).send({
        error: {
          code: err.code,
          message: err.message,
          details: err.isPublicDetails || NODE_ENV !== 'production' ? err.details : undefined,
        },
      });
    }
    if (NODE_ENV === 'development' || NODE_ENV === 'test') console.dir(err);
    return reply.code(500).send({
      error: {
        code: 500,
        message: 'Unhandled error',
        details: err,
      },
    });
  });
};

export default fp(routesBuilder);
