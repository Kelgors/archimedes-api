import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { UserRole } from '../models/User';
import { hasRoles } from '../plugins/has-roles';
import {
  DeleteTagOutputSchema,
  TAG_ID,
  TagCreateInputBodySchema,
  TagOutputSchema,
  TagUpdateInputBodySchema,
} from '../schemas/Tag';
import { tagService } from '../services/TagService';
import { HttpExceptionSchema } from '../utils/HttpException';

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
          data: z.array(TagOutputSchema),
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
          data: TagOutputSchema,
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
      body: TagCreateInputBodySchema,
      response: {
        201: z.object({
          data: TagOutputSchema,
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
      body: TagUpdateInputBodySchema,
      response: {
        200: z.object({
          data: TagOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbTag = await tagService.findOne(req.params.id);
      const dbUpdatedTag = await tagService.update(dbTag, req.body);
      return reply.code(200).send({ data: dbUpdatedTag });
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
        200: z.object({
          data: DeleteTagOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbTag = await tagService.findOne(req.params.id);
      const deletedTag = await tagService.delete(dbTag);
      return reply.code(200).send({ data: deletedTag });
    },
  });
};

export default buildTagRoutes;
