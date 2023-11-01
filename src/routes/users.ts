import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { omit } from 'lodash';
import { z } from 'zod';
import { preHandlerBuilder } from '../middlewares/require-min-role';
import { User, UserRole } from '../models/User';
import { ApiUserSchema, USER_ID, UserCreateInputSchema, UserUpdateInputSchema } from '../schemas/User';
import { userService } from '../services/UserService';
import { HttpException, HttpExceptionSchema } from '../utils/HttpException';

function renderUser(user: User) {
  return omit(user, ['encryptedPassword']);
}

const buildUserRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'GET',
    url: '/api/users',
    preHandler: [fastify.parseJwtToken, fastify.ensureToken, preHandlerBuilder({ minRole: UserRole.ADMIN })],
    schema: {
      querystring: z
        .object({
          page: z.number(),
          perPage: z.number(),
        })
        .partial(),
      response: {
        200: z.object({
          data: z.array(ApiUserSchema),
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
    preHandler: [fastify.parseJwtToken, fastify.ensureToken],
    schema: {
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          data: ApiUserSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      // Check if asking for another user than the requesting one && is not admin
      if (req.params.id !== 'me' && (req.token?.role || 0) < UserRole.ADMIN) {
        throw new HttpException(403, 'Forbidden', 'Not sufficient permissions');
      }
      const id = req.params.id === 'me' ? req.token.sub || '' : req.params.id;
      const dbUser = await userService.findOne(id);
      return reply.code(200).send({ data: renderUser(dbUser) });
    },
  });

  fastifyZod.route({
    method: 'POST',
    url: '/api/users',
    preHandler: [fastify.parseJwtToken, fastify.ensureToken, preHandlerBuilder({ minRole: UserRole.ADMIN })],
    schema: {
      body: UserCreateInputSchema,
      response: {
        200: z.object({
          data: ApiUserSchema,
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
    preHandler: [fastify.parseJwtToken, fastify.ensureToken, preHandlerBuilder({ minRole: UserRole.ADMIN })],
    schema: {
      params: z.object({
        id: USER_ID,
      }),
      body: UserUpdateInputSchema,
      response: {
        200: z.object({
          data: ApiUserSchema,
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
    preHandler: [fastify.parseJwtToken, fastify.ensureToken, preHandlerBuilder({ minRole: UserRole.ADMIN })],
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
