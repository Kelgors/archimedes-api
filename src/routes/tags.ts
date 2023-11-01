import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { EntityNotFoundError } from 'typeorm';
import { z } from 'zod';
import { UserRole } from '../models/User';
import { preHandlerBuilder } from '../plugins/require-min-role';
import { ApiTagSchema, TagCreateInputSchema, TagUpdateInputSchema } from '../schemas/Tag';
import { USER_ID } from '../schemas/User';
import { tagService } from '../services/TagService';
import { userService } from '../services/UserService';
import { HttpException, HttpExceptionSchema } from '../utils/HttpException';

const buildTagRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'GET',
    url: '/api/tags',
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
          data: z.array(ApiTagSchema),
        }),
      },
    },
    handler: async function (req, reply) {
      const dbTags = await tagService.findAllByUserId(req.token.sub, {
        page: Number(req.query?.page) || 1,
        perPage: Number(req.query?.perPage),
      });
      return reply.code(200).send({
        data: dbTags,
      });
    },
  });

  fastifyZod.route({
    method: 'GET',
    url: '/api/tags/:id',
    preHandler: [fastify.parseJwtToken, fastify.ensureToken, preHandlerBuilder({ minRole: UserRole.ADMIN })],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: z.object({
          data: ApiTagSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      try {
        const dbTag = await tagService.findOne(req.params.id);
        return reply.code(200).send({ data: dbTag });
      } catch (err) {
        if (err instanceof EntityNotFoundError) {
          throw new HttpException(404, 'User not found');
        }
        throw err;
      }
    },
  });

  fastifyZod.route({
    method: 'POST',
    url: '/api/tags',
    preHandler: [fastify.parseJwtToken, fastify.ensureToken, preHandlerBuilder({ minRole: UserRole.ADMIN })],
    schema: {
      body: TagCreateInputSchema,
      response: {
        200: z.object({
          data: ApiTagSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbTag = await tagService.create(req.body);
      return reply.code(201).send({ data: dbTag });
    },
  });

  fastifyZod.route({
    method: 'PATCH',
    url: '/api/tags/:id',
    preHandler: [fastify.parseJwtToken, fastify.ensureToken, preHandlerBuilder({ minRole: UserRole.ADMIN })],
    schema: {
      params: z.object({
        id: USER_ID,
      }),
      body: TagUpdateInputSchema,
      response: {
        200: z.object({
          data: ApiTagSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbTag = await tagService.update(req.params.id, req.body);
      return reply.code(200).send({ data: dbTag });
    },
  });

  fastifyZod.route({
    method: 'DELETE',
    url: '/api/tags/:id',
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

export default buildTagRoutes;
