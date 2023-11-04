import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ZodError } from 'zod';
import { NODE_ENV } from '../config';
import { HttpException } from '../utils/HttpException';
import errorMessagesMap from '../utils/error-messages';
import buildAuthRoutes from './auth';
import buildTagRoutes from './tags';
import buildUserRoutes from './users';

const routesBuilder: FastifyPluginAsync<never> = async function (fastify) {
  buildAuthRoutes(fastify);
  buildUserRoutes(fastify);
  buildTagRoutes(fastify);

  fastify.get('/api/ping', function (req, reply) {
    reply.code(200).send('Pong');
  });

  fastify.all('/api/*', function (req, _reply) {
    throw new HttpException(404, `Route ${req.method}:${req.url} not found`);
  });

  fastify.setErrorHandler(async function (error: unknown, req, reply) {
    if (typeof error !== 'object' || !error) {
      return reply.code(500).send({
        error: {
          code: 500,
          message: 'error format error',
        },
      });
    }
    if (error instanceof EntityNotFoundError) {
      error = new HttpException(404, 'Not found');
    } else if (error instanceof QueryFailedError) {
      error = new HttpException(422, error.message, error);
    } else if (error instanceof ZodError) {
      error = new HttpException(400, 'Invalid format', error.issues);
    } else if ('code' in error && typeof error.code === 'string' && error.code in errorMessagesMap) {
      error = errorMessagesMap[error.code](error);
    }
    if (error instanceof HttpException) {
      return reply.code(error.code).send({
        error: {
          code: error.code,
          message: error.message,
          details: NODE_ENV !== 'production' ? error.details : undefined,
        },
      });
    }
    if (NODE_ENV === 'development' || NODE_ENV === 'test') console.dir(error);
    return reply.code(500).send({
      error: {
        code: 500,
        message: 'Unhandled error',
        details: error,
      },
    });
  });
};

export default fp(routesBuilder);
