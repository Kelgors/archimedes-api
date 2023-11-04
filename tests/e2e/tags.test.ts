import type { FastifyInstance, RawServerDefault } from 'fastify';
import { omit } from 'lodash';
import slugify from 'slugify';
import request from 'supertest';
import type { TagOutput } from '../../src/schemas/Tag';
import { createServer } from '../../src/server';
import errorMessages from '../../src/utils/error-messages';
import { expectError, signIn } from '../lib';

describe('/api/tags', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  let ADMIN_TOKEN = '';
  let USER_TOKEN = '';
  beforeAll(async function () {
    fastify = await createServer();
    app = fastify.server;
    const [adminToken, userToken] = await signIn(app);
    ADMIN_TOKEN = adminToken;
    USER_TOKEN = userToken;
  });
  afterAll(() => fastify?.close());

  function expectTag(body: any, tag: Partial<TagOutput>) {
    expect(body).toHaveProperty('data');
    expect(body.data).toBeDefined();
    if ('id' in tag) {
      expect(body.data.id).toBe(tag.id);
    } else {
      expect(typeof body.data.id).toBe('string');
    }
    if (tag.name) {
      expect(body.data.name).toBe(slugify(tag.name, { lower: true, strict: true }));
    } else {
      expect(body.data.name).toBe(slugify(body.data.name || '', { lower: true, strict: true }));
    }
  }

  describe('GET /api/tags', () => {
    it('should be restrained to anonymous users', async () => {
      const response = await request(app).get('/api/tags').set('Accept', 'application/json');
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should be restrained to invalid users', async () => {
      const response = await request(app)
        .get('/api/tags')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(
        response,
        errorMessages['FST_JWT_BAD_REQUEST']().code,
        errorMessages['FST_JWT_BAD_REQUEST']().message,
      );
    });

    it('should be restrained to expired token', async () => {
      const response = await request(app)
        .get('/api/tags')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(
        response,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().code,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().message,
      );
    });

    it('should be available to simple users', async () => {
      const response = await request(app)
        .get('/api/tags')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should have at least one entry', async () => {
      const response = await request(app)
        .get('/api/tags')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be paginated', async () => {
      const responsePage1 = await request(app)
        .get('/api/tags?page=1&perPage=1')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(responsePage1.headers['content-type']).toMatch(/json/);
      expect(responsePage1.status).toBe(200);
      expect(responsePage1.body.data).toBeInstanceOf(Array);
      expect(responsePage1.body.data).toHaveLength(1);
      expect(typeof responsePage1.body.data[0].id).toBe('string');
      const tagId1 = responsePage1.body.data[0].id;

      const responsePage2 = await request(app)
        .get('/api/tags?page=2&perPage=1')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(responsePage2.headers['content-type']).toMatch(/json/);
      expect(responsePage2.status).toBe(200);
      expect(responsePage2.body.data).toBeInstanceOf(Array);
      expect(responsePage2.body.data).toHaveLength(1);
      expect(typeof responsePage2.body.data[0].id).toBe('string');
      expect(responsePage2.body.data[0].id).not.toBe(tagId1);
    });
  });

  describe('GET /api/tags/:id', () => {
    it('should be restrained to anonymous user', async () => {
      const response = await request(app)
        .get('/api/tags/80caa1b2-f930-42c0-bbc1-af803047053e')
        .set('Accept', 'application/json');
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should be restrained to invalid user', async () => {
      const response = await request(app)
        .get('/api/tags/80caa1b2-f930-42c0-bbc1-af803047053e')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(
        response,
        errorMessages['FST_JWT_BAD_REQUEST']().code,
        errorMessages['FST_JWT_BAD_REQUEST']().message,
      );
    });

    it('should be restrained to expired token', async () => {
      const response = await request(app)
        .get('/api/tags/80caa1b2-f930-42c0-bbc1-af803047053e')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(
        response,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().code,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().message,
      );
    });

    it('should be available to simple users', async () => {
      const response = await request(app)
        .get('/api/tags/80caa1b2-f930-42c0-bbc1-af803047053e')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectTag(response.body, {
        id: '80caa1b2-f930-42c0-bbc1-af803047053e',
        name: 'nodejs',
      });
    });

    it('should fetch tag with correct id', async () => {
      const response = await request(app)
        .get('/api/tags/80caa1b2-f930-42c0-bbc1-af803047053e')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeTruthy();
      expectTag(response.body, {
        id: '80caa1b2-f930-42c0-bbc1-af803047053e',
        name: 'nodejs',
      });
    });

    it('expect an error when bad id is sent', async () => {
      const response = await request(app)
        .get('/api/tags/80caa1b2-f930-42c0-bbc1-af803047053f')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 404);
    });
  });

  describe('POST /api/tags', () => {
    it('should be restrained to anonymous users', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: 'restrained-to-anonymous-users',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should be restrained to invalid users', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: 'restrained-to-invalid-users',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(
        response,
        errorMessages['FST_JWT_BAD_REQUEST']().code,
        errorMessages['FST_JWT_BAD_REQUEST']().message,
      );
    });

    it('should be restrained to expired token', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: 'restrained-to-expired-token',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(
        response,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().code,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().message,
      );
    });

    it('should be available to simple users', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: 'available-to-simple-users',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectTag(response.body, {
        name: 'available-to-simple-users',
      });
    });

    it('should not create tag without name', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({})
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create tag with an incorrect name', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: {
            fr: 'nom-incorrect',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create tag with an already existing name', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: 'nodejs',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 422);
    });

    it('should not create tag without name', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({})
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create tag with name.length > 32', async () => {
      const name = 'this-tag-is-thirty-two-char-in-it';
      expect(name).toHaveLength(33);
      const response = await request(app)
        .post('/api/tags')
        .send({ name })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should create tag with name.length == 32', async () => {
      const name = 'this-tag-is-thirty-two-char-long';
      expect(name).toHaveLength(32);

      const response = await request(app)
        .post('/api/tags')
        .send({ name })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectTag(response.body, { name });
    });

    it('should create the new tag', async () => {
      const createResponse = await request(app)
        .post('/api/tags')
        .send({
          name: "J'aime bien manger du pâté !",
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectTag(createResponse.body, {
        name: "J'aime bien manger du pâté !",
      });
      // Test fetching the new tag
      const showResponse = await request(app)
        .get('/api/tags/' + createResponse.body.data.id)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expect(showResponse.headers['content-type']).toMatch(/json/);
      expect(showResponse.status).toBe(200);
      expect(showResponse.body.data).toBeTruthy();
      expectTag(showResponse.body, {
        name: "J'aime bien manger du pâté !",
      });
    });
  });

  describe('PATCH /api/tags/:id', () => {
    const TAGS: TagOutput[] = [];
    let index = 0;
    beforeEach(async function () {
      const position = index++;
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: `patch-tag-${position}`,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      TAGS.push(response.body.data);
    });

    it('should be restrained to anonymous users', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should be restrained to invalid users', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(
        response,
        errorMessages['FST_JWT_BAD_REQUEST']().code,
        errorMessages['FST_JWT_BAD_REQUEST']().message,
      );
    });

    it('should be restrained to expired token', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(
        response,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().code,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().message,
      );
    });

    it('should be restrained to unauthorized users', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectError(
        response,
        errorMessages['MISSING_PERMISSIONS']().code,
        errorMessages['MISSING_PERMISSIONS']().message,
      );
    });

    it('should update tag name', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: 'Patching-This-Tag-Should-Success',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectTag(response.body, {
        ...localTag,
        name: 'Patching-This-Tag-Should-Success',
      });
    });

    it('should not update tag with incorrect name', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: {
            en: 'this-is-incorrect',
          },
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not update tag with an already existing name', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: 'nodejs',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 422);
    });

    it('should update tag with the new name', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({
          name: 'patch-look-at-my-new-name',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectTag(response.body, {
        ...localTag,
        name: 'patch-look-at-my-new-name',
      });
    });

    it('should not update tag with name.length > 32', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();

      const name = 'this-tag-is-thirty-two-char-in-it';
      expect(name).toHaveLength(33);

      const response = await request(app)
        .patch(`/api/tags/${localTag?.id}`)
        .send({ name })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should update tag with name.length == 32', async () => {
      const name = 'this-tag-is-thirty-two-char-wide';
      expect(name).toHaveLength(32);
      const response = await request(app)
        .post('/api/tags')
        .send({ name })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectTag(response.body, { name });
    });
  });

  describe('DELETE /api/tags/:id', function () {
    const TAGS: TagOutput[] = [];
    let index = 0;
    beforeEach(async function () {
      const position = index++;
      const response = await request(app)
        .post('/api/tags')
        .send({
          name: `deleting-tag-${position}`,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      TAGS.push(response.body.data);
    });
    it('should be restrained to anonymous users', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .delete(`/api/tags/${localTag?.id}`)
        .set('Accept', 'application/json');
      expectError(
        response,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().code,
        errorMessages['FST_JWT_NO_AUTHORIZATION_IN_HEADER']().message,
      );
    });

    it('should be restrained to invalid users', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .delete(`/api/tags/${localTag?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(
        response,
        errorMessages['FST_JWT_BAD_REQUEST']().code,
        errorMessages['FST_JWT_BAD_REQUEST']().message,
      );
    });

    it('should be restrained to expired token', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .delete(`/api/tags/${localTag?.id}`)
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(
        response,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().code,
        errorMessages['FST_JWT_AUTHORIZATION_TOKEN_EXPIRED']().message,
      );
    });
    it('should be restrained to unauthorized users', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const response = await request(app)
        .delete(`/api/tags/${localTag?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectError(
        response,
        errorMessages['MISSING_PERMISSIONS']().code,
        errorMessages['MISSING_PERMISSIONS']().message,
      );
    });

    it('should not delete unknown id', async () => {
      const response = await request(app)
        .delete(`/api/tags/e50cae52-c794-4e07-baaf-f489d4c4bea9`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 404);
    });

    it('should delete the tag', async () => {
      const localTag = TAGS.pop();
      expect(localTag?.id).toBeDefined();
      const deleteResponse = await request(app)
        .delete(`/api/tags/${localTag?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(deleteResponse.headers['content-type']).toMatch(/json/);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('data');
      expect(deleteResponse.body.data).toEqual(omit(localTag, ['id']));

      const getResponse = await request(app)
        .get(`/api/tags/${localTag?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(getResponse.headers['content-type']).toMatch(/json/);
      expectError(getResponse, 404);
    });

    it('should delete the tag which is related to a bookmark', async () => {
      const remoteTagResponse = await request(app)
        .get(`/api/tags/d860d634-052a-4ad5-af43-7335d45e73ba`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      const remoteTag = remoteTagResponse.body.data;
      expect(typeof remoteTag.id).toBe('string');
      expect(typeof remoteTag.name).toBe('string');

      const deleteResponse = await request(app)
        .delete(`/api/tags/d860d634-052a-4ad5-af43-7335d45e73ba`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(deleteResponse.headers['content-type']).toMatch(/json/);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data).toEqual(omit(remoteTag, ['id']));
    });
  });
});
