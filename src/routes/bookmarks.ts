import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { difference, differenceBy, omit, xorBy } from 'lodash';
import { z } from 'zod';
import type { Bookmark } from '../models/Bookmark';
import type { Tag } from '../models/Tag';
import {
  BOOKMARK_ID,
  BookmarkCreateInputBodySchema,
  BookmarkOutputSchema,
  BookmarkUpdateInputBodySchema,
  DeleteBookmarkOutputSchema,
} from '../schemas/Bookmark';
import { bookmarkService } from '../services/BookmarkService';
import { listPermissionService } from '../services/ListPermissionService';
import { listService } from '../services/ListService';
import { tagService } from '../services/TagService';
import { AppError, AppErrorCode } from '../utils/ApplicationError';
import { HttpExceptionSchema } from '../utils/HttpException';
import { mapId } from '../utils/mapper';

const buildBookmarkRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'GET',
    url: '/api/bookmarks',
    preHandler: [fastify.tryAuthenticate],
    schema: {
      querystring: z.object({
        page: z.coerce.number().optional(),
        perPage: z.coerce.number().optional(),
        listId: z.string().uuid(),
      }),
      response: {
        200: z.object({
          data: z.array(BookmarkOutputSchema),
        }),
      },
    },
    handler: async function (req, reply) {
      const paginateOptions = {
        page: req.query?.page || 1,
        perPage: req.query?.perPage,
      };
      const dbList = await (req.tokenOpt
        ? listService.findOneWithUserId(req.query.listId, req.tokenOpt.sub)
        : listService.findOne(req.query.listId));
      const dbBookmarks = await bookmarkService.findAllByListId(dbList.id, paginateOptions);

      return reply.code(200).send({ data: dbBookmarks });
    },
  });

  fastifyZod.route({
    method: 'GET',
    url: '/api/bookmarks/:id',
    preHandler: [fastify.tryAuthenticate],
    schema: {
      params: z.object({
        id: BOOKMARK_ID,
      }),
      response: {
        200: z.object({
          data: BookmarkOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      let dbBookmark;
      if (req.tokenOpt) {
        dbBookmark = await bookmarkService.findOneWithUserId(req.params.id, req.tokenOpt.sub);
      } else {
        dbBookmark = await bookmarkService.findOne(req.params.id);
      }
      return reply.code(200).send({ data: dbBookmark });
    },
  });

  fastifyZod.route({
    method: 'POST',
    url: '/api/bookmarks',
    preHandler: [fastify.authenticate],
    schema: {
      body: BookmarkCreateInputBodySchema,
      response: {
        201: z.object({
          data: BookmarkOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbLists = await listService.findAllByUserId(req.token.sub, {
        listIds: req.body.listIds,
        writeable: true,
      });
      if (dbLists.length !== req.body.listIds.length) {
        throw new AppError(AppErrorCode.LIST_MISS_WRITE_PERM, 'Missing permissions on some lists', {
          listIds: difference(req.body.listIds, dbLists.map(mapId)),
        });
      }
      let dbTags: Tag[] = [];
      if (req.body.tagIds?.length) {
        dbTags = await tagService.findAll({ ids: req.body.tagIds });
      }
      if (dbTags.length !== (req.body.tagIds?.length || 0)) {
        throw new AppError(AppErrorCode.UNSUPPORTED_ERROR, 'Tags not found', {
          tagIds: difference(req.body.tagIds, dbTags.map(mapId)),
        });
      }

      const dbBookmark = await bookmarkService.create({
        ...omit(req.body, ['tagIds', 'listIds']),
        lists: dbLists,
        tags: dbTags,
      });
      return reply.code(201).send({ data: dbBookmark });
    },
  });

  fastifyZod.route({
    method: 'PATCH',
    url: '/api/bookmarks/:id',
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: BOOKMARK_ID,
      }),
      body: BookmarkUpdateInputBodySchema,
      response: {
        200: z.object({
          data: BookmarkOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbBookmark = await bookmarkService.findOneWithUserId(req.params.id, req.token.sub);

      // Check write permission on added/removed lists
      if (req.body.listIds) {
        const dbPrevLists = await dbBookmark.lists;
        const dbNextLists = await listService.findAll_unsafe({ ids: req.body.listIds });
        const modifiedLists = xorBy(dbNextLists, dbPrevLists, mapId);

        const isAllowed = await listPermissionService.hasWritePermissions(modifiedLists, req.token.sub);
        if (!isAllowed) {
          throw new AppError(AppErrorCode.LIST_MISS_WRITE_PERM, 'Missing write permissions on some lists', {
            listIds: modifiedLists.map(mapId),
          });
        }
      }

      const dbUpdatedBookmark = await bookmarkService.update(dbBookmark, req.body);
      return reply.code(200).send({ data: dbUpdatedBookmark });
    },
  });

  fastifyZod.route({
    method: 'DELETE',
    url: '/api/bookmarks/:id',
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        id: BOOKMARK_ID,
      }),
      response: {
        200: z.object({
          data: DeleteBookmarkOutputSchema,
        }),
        404: z.object({
          error: HttpExceptionSchema,
        }),
      },
    },
    handler: async function (req, reply) {
      const dbBookmark = await bookmarkService.findOneWithUserId(req.params.id, req.token.sub);
      const dbLists = await dbBookmark.lists;
      const dbOwnedLists = dbLists.filter(({ ownerId }) => ownerId === req.token.sub);

      let deletedBookmark: Bookmark;
      if (dbOwnedLists.length === dbLists.length) {
        deletedBookmark = await bookmarkService.delete(dbBookmark);
      } else {
        deletedBookmark = await bookmarkService.update(dbBookmark, {
          listIds: differenceBy(dbLists, dbOwnedLists, mapId).map(mapId),
        });
      }

      return reply.code(200).send({ data: deletedBookmark });
    },
  });
};

export default buildBookmarkRoutes;
