import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { omit } from 'lodash';
import { z } from 'zod';
import type { User } from '../models/User';
import { UserRole } from '../models/User';
import { hasRoles } from '../plugins/has-roles';
import { USER_ID, UserCreateInputBodySchema, UserOutputSchema, UserUpdateInputBodySchema } from '../schemas/User';
import { userService } from '../services/UserService';
import { AppError, AppErrorCode } from '../utils/ApplicationError';
import { HttpException, HttpExceptionSchema } from '../utils/HttpException';

function renderUser(user: User) {
  return omit(user, ['encryptedPassword']);
}

const buildUserRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'GET',
    url: '/api/users',
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      querystring: z
        .object({
          page: z.string(),
          perPage: z.string(),
        })
        .partial(),
      response: {
        200: z.object({
          data: z.array(UserOutputSchema),
        }),
      },
    },
    handler: async function (req, reply) {
      const dbUsers = await userService.findAll({
        page: Number(req.query?.page) || 1,
        perPage: Number(req.query?.perPage),
      });
      return reply.code(200).send({
        data: dbUsers.map(renderUser),
      });
    },
  });

  fastifyZod.route({
    method: 'GET',
    url: '/api/users/:id',
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: USER_ID.or(z.enum(['me'])),
      }),
      response: {
        200: z.object({
          data: UserOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      // Check if asking for another user than the requesting one && is not admin
      if (req.params.id !== 'me' && req.token.role !== UserRole.ADMIN) {
        throw new AppError(AppErrorCode.MISSING_PERMISSIONS);
      }
      const id = req.params.id === 'me' ? req.token.sub || '' : req.params.id;
      const dbUser = await userService.findOne(id);
      return reply.code(200).send({ data: renderUser(dbUser) });
    },
  });

  fastifyZod.route({
    method: 'POST',
    url: '/api/users',
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      body: UserCreateInputBodySchema,
      response: {
        200: z.object({
          data: UserOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbUser = await userService.create(req.body);
      return reply.code(201).send({ data: renderUser(dbUser) });
    },
  });

  fastifyZod.route({
    method: 'PATCH',
    url: '/api/users/:id',
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      params: z.object({
        id: USER_ID,
      }),
      body: UserUpdateInputBodySchema,
      response: {
        200: z.object({
          data: UserOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbUser = await userService.update(req.params.id, req.body);
      return reply.code(200).send({ data: renderUser(dbUser) });
    },
  });

  fastifyZod.route({
    method: 'DELETE',
    url: '/api/users/:id',
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      params: z.object({
        id: USER_ID,
      }),
      response: {
        200: z.object({}),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const isDeleted = await userService.delete(req.params.id);
      if (!isDeleted) {
        throw new HttpException(404, 'Not found');
      }
      return reply.code(200).send({});
    },
  });
};

export default buildUserRoutes;
