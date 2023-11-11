import type { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';
import type { BookmarkCreateInputBody } from '../../../src/schemas/Bookmark';
import { createServer } from '../../../src/server';
import errorMessages from '../../../src/utils/error-messages';
import { expectError, expectSuccessfulResponse, signIn, signNullUser } from '../../lib';
import { DEFAULT_LIST_ID, DEFAULT_TAG_CREATE } from './bookmarks.mock';
import { expectBookmark } from './lib';

describe('/api/bookmarks', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  let NULL_TOKEN = '';
  let OWNER_TOKEN = '';
  let READ_TOKEN = '';
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

  function createBookmark(input?: BookmarkCreateInputBody, token?: string): request.Test {
    let fetchRequest = request(app).post('/api/bookmarks').set('Accept', 'application/json');
    if (input) {
      fetchRequest = fetchRequest.send(input).set('Content-Type', 'application/json');
    }
    if (token) fetchRequest = fetchRequest.set('Authorization', `Bearer ${token}`);
    return fetchRequest;
  }

  describe('POST /api/bookmarks', () => {
    it('should not create bookmark anonymously', async () => {
      const response = await createBookmark({
        title: 'anonymously created bookmark',
        description: null,
        url: 'https://example.com',
        listIds: [DEFAULT_LIST_ID],
        tagIds: [DEFAULT_TAG_CREATE],
      });
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should not create bookmark with no permission to the related list', async () => {
      const response = await createBookmark(
        {
          title: 'null created bookmark',
          description: null,
          url: 'https://example.com',
          listIds: [DEFAULT_LIST_ID],
          tagIds: [DEFAULT_TAG_CREATE],
        },
        NULL_TOKEN,
      );
      expectError(response, 403);
    });

    it('should not create bookmark with read permission to the related list', async () => {
      const response = await createBookmark(
        {
          title: 'read created bookmark',
          description: null,
          url: 'https://example.com',
          listIds: [DEFAULT_LIST_ID],
          tagIds: [DEFAULT_TAG_CREATE],
        },
        READ_TOKEN,
      );
      expectError(response, 403);
    });

    it('should create the bookmark with write permission to the related list', async () => {
      const bookmark = {
        title: 'write created bookmark',
        description: null,
        url: 'https://example.com',
        listIds: [DEFAULT_LIST_ID],
        tagIds: [DEFAULT_TAG_CREATE],
      };
      const response = await createBookmark(bookmark, WRITE_TOKEN);
      expectSuccessfulResponse(response, 201);
      expectBookmark(response.body.data, bookmark);
    });

    it('should create the bookmark by being owner of the related list', async () => {
      const bookmark = {
        title: 'owner created bookmark',
        description: null,
        url: 'https://example.com',
        listIds: [DEFAULT_LIST_ID],
        tagIds: [DEFAULT_TAG_CREATE],
      };
      const response = await createBookmark(bookmark, OWNER_TOKEN);
      expectSuccessfulResponse(response, 201);
      expectBookmark(response.body.data, bookmark);
    });
  });
});
