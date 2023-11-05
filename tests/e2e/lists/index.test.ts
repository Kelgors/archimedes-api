import fastJwt from 'fast-jwt';
import type { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';
import { Visibility } from '../../../src/models/ListVisibility';
import type { ListCreateInputBody, ListOutput } from '../../../src/schemas/List';
import { createServer } from '../../../src/server';
import errorMessages from '../../../src/utils/error-messages';
import { expectError, signAdmin, signSimpleUser } from '../../lib';

describe('/api/lists', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  let ADMIN_TOKEN = '';
  let USER_TOKEN = '';
  let ADMIN_ID = '';
  let USER_ID = '';
  beforeAll(async function () {
    fastify = await createServer();
    app = fastify.server;
    ADMIN_TOKEN = await signAdmin(app);
    USER_TOKEN = await signSimpleUser(app);
    const decoder = fastJwt.createDecoder();
    const decodedAdminToken = decoder(ADMIN_TOKEN);
    ADMIN_ID = decodedAdminToken.sub;
    const decodedUserToken = decoder(USER_TOKEN);
    USER_ID = decodedUserToken.sub;
  });
  afterAll(() => fastify?.close());

  function expectSuccessfulResponse(response: request.Response, statusCode: number = 200): void {
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(statusCode);
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeDefined();
  }
  function expectList(body: ListOutput, list: Partial<ListOutput>) {
    for (const key in list) {
      expect(body[key as keyof ListOutput]).toEqual(list[key as keyof ListOutput]);
    }
  }

  describe('POST /api/lists', () => {
    function createList(listInput?: ListCreateInputBody, token?: string): request.Test {
      let fetchRequest = request(app).post('/api/lists').set('Accept', 'application/json');
      if (listInput) {
        fetchRequest = fetchRequest.send(listInput).set('Content-Type', 'application/json');
      }
      if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
      return fetchRequest;
    }

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

    it('should be created by an admin user', async function () {
      const response = await createList(
        {
          name: 'create-list-admin',
        },
        ADMIN_TOKEN,
      );
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
      const response = await createList(
        {
          name: 'create-list-least-params',
        },
        USER_TOKEN,
      );
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
  describe('PATCH /api/lists/:id', () => {});
  describe('DELETE /api/lists/:id', () => {});
});
