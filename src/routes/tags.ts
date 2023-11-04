import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { UserRole } from '../models/User';
import { hasRoles } from '../plugins/has-roles';
import { ApiTagSchema, TAG_ID, TagCreateInputSchema, TagUpdateInputSchema } from '../schemas/Tag';
import { tagService } from '../services/TagService';
import { HttpException, HttpExceptionSchema } from '../utils/HttpException';

const buildTagRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'GET',
    url: '/api/tags',
    preHandler: [fastify.authenticate],
    schema: {
      querystring: z
        .object({
          page: z.string(),
          perPage: z.string(),
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
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: TAG_ID,
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
      const dbTag = await tagService.findOne(req.params.id);
      return reply.code(200).send({ data: dbTag });
    },
  });

  fastifyZod.route({
    method: 'POST',
    url: '/api/tags',
    preHandler: [fastify.authenticate],
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
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      params: z.object({
        id: TAG_ID,
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
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      params: z.object({
        id: TAG_ID,
      }),
      response: {
        200: z.object({}),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const isDeleted = await tagService.delete(req.params.id);
      if (!isDeleted) {
        throw new HttpException(404, 'Not found');
      }
      return reply.code(200).send({});
    },
  });
};

export default buildTagRoutes;
