import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { List } from '../models/List';
import { UserRole } from '../models/User';
import { hasRoles } from '../plugins/has-roles';
import {
  DeleteListOutputSchema,
  LIST_ID,
  ListCreateInputBodySchema,
  ListOutputSchema,
  ListUpdateInputBodySchema,
} from '../schemas/List';
import { listService } from '../services/ListService';
import { HttpExceptionSchema } from '../utils/HttpException';

const buildTagRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'GET',
    url: '/api/lists',
    preHandler: [fastify.tryAuthenticate],
    schema: {
      querystring: z
        .object({
          page: z.string(),
          perPage: z.string(),
        })
        .partial(),
      response: {
        200: z.object({
          data: z.array(ListOutputSchema),
        }),
      },
    },
    handler: async function (req, reply) {
      let dbLists: List[] = [];
      const paginateOptions = {
        page: Number(req.query?.page) || 1,
        perPage: Number(req.query?.perPage),
      };
      if (req.tryToken) {
        dbLists = await listService.findAllByUserId(req.tryToken?.sub, paginateOptions);
      } else {
        dbLists = await listService.findAll(paginateOptions);
      }
      return reply.code(200).send({
        data: dbLists,
      });
    },
  });

  fastifyZod.route({
    method: 'GET',
    url: '/api/lists/:id',
    preHandler: [fastify.tryAuthenticate],
    schema: {
      params: z.object({
        id: LIST_ID,
      }),
      response: {
        200: z.object({
          data: ListOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      let dbList;
      if (req.tryToken) {
        dbList = await listService.findOneWithUserId(req.params.id, req.tryToken.sub);
      } else {
        dbList = await listService.findOne(req.params.id);
      }
      return reply.code(200).send({ data: dbList });
    },
  });

  fastifyZod.route({
    method: 'POST',
    url: '/api/lists',
    preHandler: [fastify.authenticate],
    schema: {
      body: ListCreateInputBodySchema,
      response: {
        200: z.object({
          data: ListOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbList = await listService.create(req.body);
      return reply.code(201).send({ data: dbList });
    },
  });

  fastifyZod.route({
    method: 'PATCH',
    url: '/api/lists/:id',
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      params: z.object({
        id: LIST_ID,
      }),
      body: ListUpdateInputBodySchema,
      response: {
        200: z.object({
          data: ListOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbList = await listService.findOneWithUserId(req.params.id, req.token.sub);
      const dbUpdatedList = await listService.update(dbList, req.body);
      return reply.code(200).send({ data: dbUpdatedList });
    },
  });

  fastifyZod.route({
    method: 'DELETE',
    url: '/api/lists/:id',
    preHandler: [fastify.authenticate, hasRoles(UserRole.ADMIN)],
    schema: {
      params: z.object({
        id: LIST_ID,
      }),
      response: {
        200: z.object({
          data: DeleteListOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbList = await listService.findOneWithUserId(req.params.id, req.token.sub);
      const deletedList = await listService.delete(dbList);
      return reply.code(200).send({ data: deletedList });
    },
  });
};

export default buildTagRoutes;
