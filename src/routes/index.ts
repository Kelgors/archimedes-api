import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EntityNotFoundError } from 'typeorm';
import { ZodError } from 'zod';
import { NODE_ENV } from '../config';
import { HttpException } from '../utils/HttpException';
import ErrorMessagesMap from '../utils/error-messages';
import buildAuthRoutes from './auth';
import buildUserRoutes from './users';

const routesBuilder: FastifyPluginAsync<never> = async function (fastify) {
  buildAuthRoutes(fastify);
  buildUserRoutes(fastify);

  fastify.all('/api/*', function (req, reply) {
    reply.code(404).send({
      error: {
        code: 404,
        message: `Route ${req.method}:${req.url} not found`,
      },
    });
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
    } else if (error instanceof ZodError) {
      error = new HttpException(400, 'Invalid format', error.issues);
    } else if ('code' in error && typeof error.code === 'string' && error.code in ErrorMessagesMap) {
      error = ErrorMessagesMap[error.code];
    }
    if (error instanceof HttpException) {
      return reply.code(error.code).send({
        error,
      });
    }
    if (NODE_ENV === 'development') req.log.error(error);
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
