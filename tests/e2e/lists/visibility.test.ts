import type { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';
import { createServer } from '../../../src/server';
import { expectError, signIn, signNullUser } from '../../lib';
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
} from './lists.mock';

describe('/api/lists', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  let NULL_TOKEN = '';
  let OWNER_TOKEN = '';
  let READ_TOKEN = '';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let WRITE_TOKEN = '';
  beforeAll(async function () {
    fastify = await createServer();
    app = fastify.server;
    NULL_TOKEN = await signNullUser(app);
    OWNER_TOKEN = await signIn(app, 'list-visibility-owner@test.me', 'changemeplease');
    READ_TOKEN = await signIn(app, 'list-visibility-permitted-read-user@test.me', 'changemeplease');
    WRITE_TOKEN = await signIn(app, 'list-visibility-permitted-write-user@test.me', 'changemeplease');
  });
  afterAll(() => fastify?.close());

  describe('GET /api/lists', () => {
    function fetchLists(token?: string): request.Test {
      let fetchRequest = request(app).get('/api/lists?page=1&perPage=50').set('Accept', 'application/json');
      if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
      return fetchRequest;
    }
    function expectSuccessfulResponse(response: request.Response): void {
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body?.data).toBeInstanceOf(Array);
    }

    describe('instance(PRIVATE),anonymous(PRIVATE)', function () {
      const dbList = listPrivatePrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(PRIVATE),anonymous(SHARED)', function () {
      const dbList = listPrivateShared();
      it('should not be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(PRIVATE),anonymous(PUBLIC)', function () {
      const dbList = listPrivatePublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should not be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(SHARED),anonymous(PRIVATE)', function () {
      const dbList = listSharedPrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(SHARED),anonymous(SHARED)', function () {
      const dbList = listSharedShared();
      it('should not be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(SHARED),anonymous(PUBLIC)', function () {
      const dbList = listSharedPublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should not be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(PUBLIC),anonymous(PRIVATE)', function () {
      const dbList = listPublicPrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(PUBLIC),anonymous(SHARED)', function () {
      const dbList = listPublicShared();
      it('should not be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).not.toContainEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });

    describe('instance(PUBLIC),anonymous(PUBLIC)', function () {
      const dbList = listPublicPublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchLists();
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchLists(NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchLists(READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchLists(OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toContainEqual(dbList);
      });
    });
  });

  describe('GET /api/lists/:id', () => {
    const NO_VISIBILITY_ERR_STATUS_CODE = 404;
    function fetchList(id: string, token?: string): request.Test {
      let fetchRequest = request(app)
        .get(`/api/lists/${encodeURIComponent(id)}`)
        .set('Accept', 'application/json');
      if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
      return fetchRequest;
    }
    function expectSuccessfulResponse(response: request.Response): void {
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('id');
    }

    describe('instance(PRIVATE),anonymous(PRIVATE)', function () {
      const dbList = listPrivatePrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(PRIVATE),anonymous(SHARED)', function () {
      const dbList = listPrivateShared();
      it('should be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(PRIVATE),anonymous(PUBLIC)', function () {
      const dbList = listPrivatePublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should not be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should not be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(SHARED),anonymous(PRIVATE)', function () {
      const dbList = listSharedPrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should not be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectError(response, 404);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(SHARED),anonymous(SHARED)', function () {
      const dbList = listSharedShared();
      it('should be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(SHARED),anonymous(PUBLIC)', function () {
      const dbList = listSharedPublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(PUBLIC),anonymous(PRIVATE)', function () {
      const dbList = listPublicPrivate();
      it('should not be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectError(response, NO_VISIBILITY_ERR_STATUS_CODE);
      });

      it('should be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(PUBLIC),anonymous(SHARED)', function () {
      const dbList = listPublicShared();
      it('should be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });

    describe('instance(PUBLIC),anonymous(PUBLIC)', function () {
      const dbList = listPublicPublic();
      it('should be available to anonymous user', async function () {
        const response = await fetchList(dbList.id);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to null user', async function () {
        const response = await fetchList(dbList.id, NULL_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to permitted user', async function () {
        const response = await fetchList(dbList.id, READ_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });

      it('should be available to owner', async function () {
        const response = await fetchList(dbList.id, OWNER_TOKEN);
        expectSuccessfulResponse(response);
        expect(response.body.data).toEqual(dbList);
      });
    });
  });
});
