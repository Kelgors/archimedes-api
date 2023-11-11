import type { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';
import { createServer } from '../../../src/server';
import { expectError, expectSuccessfulResponse, signIn, signNullUser } from '../../lib';
import {
  listPrivatePrivate,
  listPrivatePublic,
  listPrivateShared,
  listPublicPrivate,
  listPublicPublic,
  listPublicShared,
  listSharedPrivate,
  listSharedPublic,
  listSharedShared,
} from '../lists/lists.mock';
import {
  bookmarksPrivatePrivate,
  bookmarksPrivatePublic,
  bookmarksPrivateShared,
  bookmarksPublicPrivate,
  bookmarksPublicPublic,
  bookmarksPublicShared,
  bookmarksSharedPrivate,
  bookmarksSharedPublic,
  bookmarksSharedShared,
} from './bookmarks.mock';
import { expectBookmark, expectBookmarks } from './lib';

describe('/api/bookmarks', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  let NULL_TOKEN = '';
  let OWNER_TOKEN = '';
  let READ_TOKEN = '';

  beforeAll(async function () {
    fastify = await createServer();
    app = fastify.server;
    NULL_TOKEN = await signNullUser(app);
    OWNER_TOKEN = await signIn(app, 'list-visibility-owner@test.me', 'changemeplease');
    READ_TOKEN = await signIn(app, 'list-visibility-permitted-read-user@test.me', 'changemeplease');
  });
  afterAll(() => fastify?.close());

  describe('GET /api/bookmarks', () => {
    const NO_VISIBILITY_ERR_STATUS_CODE = 404;
    function fetchBookmarksByListId(id?: string, token?: string): request.Test {
      let fetchRequest = request(app)
        .get('/api/bookmarks?page=1&perPage=50' + (id ? `&listId=${encodeURIComponent(id)}` : ''))
        .set('Accept', 'application/json');
      if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
      return fetchRequest;
    }

    describe('instance(PRIVATE),anonymous(PRIVATE)', function () {
      const dbList = listPrivatePrivate();
      const dbBookmarks = bookmarksPrivatePrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to user with read permission', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(PRIVATE),anonymous(SHARED)', function () {
      const dbList = listPrivateShared();
      const dbBookmarks = bookmarksPrivateShared();
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(PRIVATE),anonymous(PUBLIC)', function () {
      const dbList = listPrivatePublic();
      const dbBookmarks = bookmarksPrivatePublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should not be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should not be available to user with read permission', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(SHARED),anonymous(PRIVATE)', function () {
      const dbList = listSharedPrivate();
      const dbBookmarks = bookmarksSharedPrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(SHARED),anonymous(SHARED)', function () {
      const dbList = listSharedShared();
      const dbBookmarks = bookmarksSharedShared();
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(SHARED),anonymous(PUBLIC)', function () {
      const dbList = listSharedPublic();
      const dbBookmarks = bookmarksSharedPublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(PUBLIC),anonymous(PRIVATE)', function () {
      const dbList = listPublicPrivate();
      const dbBookmarks = bookmarksPublicPrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(PUBLIC),anonymous(SHARED)', function () {
      const dbList = listPublicShared();
      const dbBookmarks = bookmarksPublicShared();
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });

    describe('instance(PUBLIC),anonymous(PUBLIC)', function () {
      const dbList = listPublicPublic();
      const dbBookmarks = bookmarksPublicPublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarksByListId(dbList.id);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarksByListId(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarksByListId(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmarks(response.body.data, dbBookmarks);
      });
    });
  });

  describe('GET /api/bookmarks/:id', () => {
    const NO_VISIBILITY_ERR_STATUS_CODE = 404;
    function fetchBookmarkById(id: string, token?: string): request.Test {
      let fetchRequest = request(app)
        .get(`/api/bookmarks/${encodeURIComponent(id)}`)
        .set('Accept', 'application/json');
      if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
      return fetchRequest;
    }

    describe('instance(PRIVATE),anonymous(PRIVATE)', function () {
      const dbBookmark = bookmarksPrivatePrivate()[0];
      it('should not be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to user with read permission', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(PRIVATE),anonymous(SHARED)', function () {
      const dbBookmark = bookmarksPrivateShared()[0];
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(PRIVATE),anonymous(PUBLIC)', function () {
      const dbBookmark = bookmarksPrivatePublic()[0];
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should not be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should not be available to user with read permission', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(SHARED),anonymous(PRIVATE)', function () {
      const dbBookmark = bookmarksSharedPrivate()[0];
      it('should not be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(SHARED),anonymous(SHARED)', function () {
      const dbBookmark = bookmarksSharedShared()[0];
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(SHARED),anonymous(PUBLIC)', function () {
      const dbBookmark = bookmarksSharedPublic()[0];
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(PUBLIC),anonymous(PRIVATE)', function () {
      const dbBookmark = bookmarksPublicPrivate()[0];
      it('should not be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(PUBLIC),anonymous(SHARED)', function () {
      const dbBookmark = bookmarksPublicShared()[0];
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });

    describe('instance(PUBLIC),anonymous(PUBLIC)', function () {
      const dbBookmark = bookmarksPublicPublic()[0];
      it('should be available to anonymous user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to null user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });

      it('should be available to owner', async function () {
        const response = await fetchBookmarkById(dbBookmark.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expectBookmark(response.body.data, dbBookmark);
      });
    });
  });
});
