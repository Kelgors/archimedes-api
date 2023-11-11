import fastJwt from 'fast-jwt';
import type { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';
import { Visibility } from '../../../src/models/ListVisibility';
import type { ListCreateInputBody, ListOutput, ListUpdateInputBody } from '../../../src/schemas/List';
import { createServer } from '../../../src/server';
import errorMessages from '../../../src/utils/error-messages';
import { expectError, expectSuccessfulResponse, signAdmin, signNullUser, signSimpleUser } from '../../lib';

describe('/api/lists', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  let ADMIN_TOKEN = '';
  let USER_TOKEN = '';
  let NULL_TOKEN = '';
  let ADMIN_ID = '';
  let USER_ID = '';
  beforeAll(async function () {
    fastify = await createServer();
    app = fastify.server;
    ADMIN_TOKEN = await signAdmin(app);
    USER_TOKEN = await signSimpleUser(app);
    NULL_TOKEN = await signNullUser(app);
    const decoder = fastJwt.createDecoder();
    const decodedAdminToken = decoder(ADMIN_TOKEN);
    ADMIN_ID = decodedAdminToken.sub;
    const decodedUserToken = decoder(USER_TOKEN);
    USER_ID = decodedUserToken.sub;
  });
  afterAll(() => fastify?.close());

  function expectList(body: ListOutput, list: Partial<ListOutput>) {
    for (const key in list) {
      expect(body[key as keyof ListOutput]).toEqual(list[key as keyof ListOutput]);
    }
  }

  function createList(listInput?: ListCreateInputBody, token?: string): request.Test {
    let fetchRequest = request(app).post('/api/lists').set('Accept', 'application/json');
    if (listInput) {
      fetchRequest = fetchRequest.send(listInput).set('Content-Type', 'application/json');
    }
    if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
    return fetchRequest;
  }

  function updateList(id: string, listInput?: ListUpdateInputBody, token?: string): request.Test {
    let fetchRequest = request(app).patch(`/api/lists/${id}`).set('Accept', 'application/json');
    if (listInput) {
      fetchRequest = fetchRequest.send(listInput).set('Content-Type', 'application/json');
    }
    if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
    return fetchRequest;
  }

  function deleteList(id: string, token?: string): request.Test {
    let fetchRequest = request(app).delete(`/api/lists/${id}`).set('Accept', 'application/json');
    if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
    return fetchRequest;
  }

  describe('POST /api/lists', () => {
    it('should be restrained to anonymous users', async function () {
      const response = await createList({
        name: 'create-list-anonymous',
      });
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should not be created when name.length > 32', async function () {
      const response = await createList({ name: 'dont-create-list-with-a-long-name' }, USER_TOKEN);
      expectError(response, 400);
    });

    it('should be created when name.length == 32', async function () {
      const response = await createList({ name: 'create-the-list-with-a-long-name' }, USER_TOKEN);
      expectSuccessfulResponse(response, 201);
      expectList(response.body.data, {
        name: 'create-the-list-with-a-long-name',
      });
      expect(response.body.data).toHaveProperty('id');
      expect(typeof response.body.data.id).toBe('string');
    });

    it('should be created by an admin user', async function () {
      const response = await createList({ name: 'create-list-admin' }, ADMIN_TOKEN);
      expectSuccessfulResponse(response, 201);
      expectList(response.body.data, {
        name: 'create-list-admin',
        description: null,
        visibility: {
          anonymous: Visibility.PRIVATE,
          instance: Visibility.PRIVATE,
        },
        ownerId: ADMIN_ID,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(typeof response.body.data.id).toBe('string');
    });

    it('should be created with the least parameters', async function () {
      const response = await createList({ name: 'create-list-least-params' }, USER_TOKEN);
      expectSuccessfulResponse(response, 201);
      expectList(response.body.data, {
        name: 'create-list-least-params',
        description: null,
        visibility: {
          anonymous: Visibility.PRIVATE,
          instance: Visibility.PRIVATE,
        },
        ownerId: USER_ID,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(typeof response.body.data.id).toBe('string');
    });

    it('should be created', async function () {
      const response = await createList(
        {
          name: 'create-list-correct',
          description: 'my\ndescription',
          visibility: {
            anonymous: Visibility.PUBLIC,
            instance: Visibility.PUBLIC,
          },
        },
        USER_TOKEN,
      );
      expectSuccessfulResponse(response, 201);
      expectList(response.body.data, {
        name: 'create-list-correct',
        description: 'my\ndescription',
        visibility: {
          anonymous: Visibility.PUBLIC,
          instance: Visibility.PUBLIC,
        },
        ownerId: USER_ID,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(typeof response.body.data.id).toBe('string');
    });
  });

  describe('PATCH /api/lists/:id', () => {
    const AVAILABLE_LISTS: ListOutput[] = [];
    let index = 0;
    beforeEach(async function () {
      const position = index++;
      const response = await createList({ name: `patchable-list-${position}` }, USER_TOKEN);
      AVAILABLE_LISTS.push(response.body.data);
    });

    function getNextList(): ListOutput {
      const createdItem = AVAILABLE_LISTS.pop();
      expect(createdItem?.id).toBeDefined();
      return createdItem as ListOutput;
    }

    it('should be restrained to anonymous users', async function () {
      const createdItem = getNextList();
      const response = await updateList(createdItem.id, {
        name: 'anonymous-patched-list',
      });
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should restrain users without access', async function () {
      const createdItem = getNextList();
      const response = await updateList(createdItem.id, { name: 'not-permitted-patched-list' }, NULL_TOKEN);
      expectError(response, 404);
    });

    it('should be updated with the least parameters', async function () {
      const createdItem = getNextList();
      const response = await updateList(createdItem.id, { name: 'update-list-least-params' }, USER_TOKEN);
      expectSuccessfulResponse(response);
      expectList(response.body.data, {
        name: 'update-list-least-params',
        description: null,
        visibility: {
          anonymous: Visibility.PRIVATE,
          instance: Visibility.PRIVATE,
        },
        ownerId: USER_ID,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(typeof response.body.data.id).toBe('string');
    });

    it('should not be updated when name.length > 32', async function () {
      const createdItem = getNextList();
      const response = await updateList(createdItem.id, { name: 'dont-update-list-with-a-long-name' }, USER_TOKEN);
      expectError(response, 400);
    });

    it('should be updated when name.length == 32', async function () {
      const createdItem = getNextList();
      const response = await updateList(createdItem.id, { name: 'update-the-list-with-a-long-name' }, USER_TOKEN);
      expectSuccessfulResponse(response);
      expectList(response.body.data, {
        name: 'update-the-list-with-a-long-name',
      });
      expect(response.body.data).toHaveProperty('id');
      expect(typeof response.body.data.id).toBe('string');
    });

    it('should be updated', async function () {
      const createdItem = getNextList();
      const response = await updateList(
        createdItem.id,
        {
          name: 'updated-list-correctly',
          description: 'my\nupdated\ndescription',
          visibility: {
            anonymous: Visibility.PUBLIC,
            instance: Visibility.PUBLIC,
          },
        },
        USER_TOKEN,
      );
      expectSuccessfulResponse(response);
      expectList(response.body.data, {
        ...createdItem,
        name: 'updated-list-correctly',
        description: 'my\nupdated\ndescription',
        visibility: {
          anonymous: Visibility.PUBLIC,
          instance: Visibility.PUBLIC,
        },
      });
    });
  });

  describe('DELETE /api/lists/:id', () => {
    const AVAILABLE_LISTS: ListOutput[] = [];
    let index = 0;
    beforeEach(async function () {
      const position = index++;
      const response = await createList({ name: `deletable-list-${position}` }, USER_TOKEN);
      AVAILABLE_LISTS.push(response.body.data);
    });

    function getNextList(): ListOutput {
      const createdItem = AVAILABLE_LISTS.pop();
      expect(createdItem?.id).toBeDefined();
      return createdItem as ListOutput;
    }

    it('should be restrained to anonymous users', async function () {
      const createdItem = getNextList();
      const response = await deleteList(createdItem.id);
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should restrain users without access', async function () {
      const createdItem = getNextList();
      const response = await deleteList(createdItem.id, NULL_TOKEN);
      expectError(response, 404);
    });

    it('should be a 404 when does not exists', async function () {
      const response = await deleteList('00000000-0000-4000-0000-000000000000', USER_TOKEN);
      expectError(response, 404);
    });

    it('should be deleted', async function () {
      const createdItem = getNextList();
      const response = await deleteList(createdItem.id, USER_TOKEN);
      expectSuccessfulResponse(response);
      expectList(response.body.data, {
        ...createdItem,
        id: undefined,
      });
    });
  });
});
