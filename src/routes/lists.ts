import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { List } from '../models/List';
import {
  DeleteListOutputSchema,
  LIST_ID,
  ListCreateInputBodySchema,
  ListOutputSchema,
  ListUpdateInputBodySchema,
} from '../schemas/List';
import { listPermissionService } from '../services/ListPermissionService';
import { listService } from '../services/ListService';
import { AppError, AppErrorCode } from '../utils/ApplicationError';
import { HttpExceptionSchema } from '../utils/HttpException';

const buildListRoutes = function (fastify: FastifyInstance) {
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
      if (req.tokenOpt) {
        dbLists = await listService.findAllByUserId(req.tokenOpt.sub, paginateOptions);
      } else {
        dbLists = await listService.findAllAnonymous(paginateOptions);
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
      if (req.tokenOpt) {
        dbList = await listService.findOneWithUserId(req.params.id, req.tokenOpt.sub);
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
      const dbList = await listService.create({
        ...req.body,
        ownerId: req.token.sub,
      });
      return reply.code(201).send({ data: dbList });
    },
  });

  fastifyZod.route({
    method: 'PATCH',
    url: '/api/lists/:id',
    preHandler: [fastify.authenticate],
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
      const hasWritePermission = await listPermissionService.hasWritePermission(dbList, req.token.sub);
      if (!hasWritePermission) throw new AppError(AppErrorCode.LIST_MISS_WRITE_PERM);

      const dbUpdatedList = await listService.update(dbList, req.body);
      return reply.code(200).send({ data: dbUpdatedList });
    },
  });

  fastifyZod.route({
    method: 'DELETE',
    url: '/api/lists/:id',
    preHandler: [fastify.authenticate],
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
      if (dbList.ownerId !== req.token.sub) throw new AppError(AppErrorCode.LIST_MUST_BE_OWNER);

      const deletedList = await listService.delete(dbList);
      return reply.code(200).send({ data: deletedList });
    },
  });
};

export default buildListRoutes;
