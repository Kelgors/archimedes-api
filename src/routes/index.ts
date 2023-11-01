import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EntityNotFoundError } from 'typeorm';
import { ZodError } from 'zod';
import { AppError } from '../utils/ApplicationError';
import { HttpException } from '../utils/HttpException';
import buildAuthRoutes from './auth';
import buildUserRoutes from './users';

const routesBuilder: FastifyPluginAsync<{ urlPrefix: string }> = async function (fastify, options) {
  buildAuthRoutes(fastify);
  buildUserRoutes(fastify);

  fastify.setErrorHandler(async function (error: unknown, req, reply) {
    if (error instanceof EntityNotFoundError) {
      error = new HttpException(404, 'Not found');
    }
    if (error instanceof AppError) {
      error = error.toHttpException();
    }
    if (error instanceof ZodError) {
      error = new HttpException(400, 'Invalid format', error.issues);
    }
    if (error instanceof HttpException) {
      return reply.code(error.code).send({
        error,
      });
    }
    return reply.code(500).send({
      error: {
        code: 500,
        message: 'Unhandled error',
        details: error,
      },
    });
  });
};

export default fp(routesBuilder, '4.x');
