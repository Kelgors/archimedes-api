import { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';
import { UserRole } from '../../src/models/User';
import { UserOutput } from '../../src/schemas/User';
import { createServer } from '../../src/server';

describe('/api/users', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  let ADMIN_TOKEN = '';
  let USER_TOKEN = '';
  beforeAll(async function () {
    fastify = await createServer();
    app = fastify.server;
    await Promise.all([
      request(app)
        .post('/api/auth/sign')
        .send({
          email: 'admin@test.me',
          password: 'changemeplease',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .then(function (response) {
          expect(response.body).toHaveProperty('token');
          ADMIN_TOKEN = response.body.token;
        }),
      request(app)
        .post('/api/auth/sign')
        .send({
          email: 'user@test.me',
          password: 'changemeplease',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .then(function (response) {
          expect(response.body).toHaveProperty('token');
          USER_TOKEN = response.body.token;
        }),
    ]);
  });
  afterAll(() => fastify?.close());

  function expectUser(body: any, user: Partial<UserOutput>) {
    expect(body).toHaveProperty('data');
    expect(body.data).toBeDefined();
    if ('id' in user) {
      expect(body.data.id).toBe(user.id);
    } else {
      expect(typeof body.data.id).toBe('string');
    }
    expect(body.data.email).toBe(user.email);
    expect(body.data.name).toBe(user.name);
    expect(body.data.role).toBe(user.role);
    expect(body.data.password).not.toBeDefined();
    expect(body.data.encryptedPassword).not.toBeDefined();
  }

  function expectError(response: request.Response, status: number) {
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(status);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe(status);
    expect(typeof response.body.error.message).toBe('string');
  }

  describe('GET /api/users', () => {
    it('should be restrained to anonymous users', async () => {
      const response = await request(app).get('/api/users').set('Accept', 'application/json');
      expectError(response, 401);
    });

    it('should be restrained to invalid users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(response, 401);
    });

    it('should be restrained to expired token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(response, 401);
    });

    it('should be restrained to unauthorized users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectError(response, 401);
    });

    it('should have at least one entry', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be paginated', async () => {
      const responsePage1 = await request(app)
        .get('/api/users?page=1&perPage=1')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(responsePage1.headers['content-type']).toMatch(/json/);
      expect(responsePage1.status).toBe(200);
      expect(responsePage1.body.data).toBeInstanceOf(Array);
      expect(responsePage1.body.data).toHaveLength(1);
      expect(typeof responsePage1.body.data[0].id).toBe('string');
      const userId1 = responsePage1.body.data[0].id;

      const responsePage2 = await request(app)
        .get('/api/users?page=2&perPage=1')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(responsePage2.headers['content-type']).toMatch(/json/);
      expect(responsePage2.status).toBe(200);
      expect(responsePage2.body.data).toBeInstanceOf(Array);
      expect(responsePage2.body.data).toHaveLength(1);
      expect(typeof responsePage2.body.data[0].id).toBe('string');
      expect(responsePage2.body.data[0].id).not.toBe(userId1);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should be restrained to anonymous users', async () => {
      const response = await request(app)
        .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
        .set('Accept', 'application/json');
      expectError(response, 401);
    });

    it('should be restrained to invalid users', async () => {
      const response = await request(app)
        .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(response, 401);
    });

    it('should be restrained to expired token', async () => {
      const response = await request(app)
        .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(response, 401);
    });

    it('should be restrained to unauthorized users', async () => {
      const response = await request(app)
        .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectError(response, 401);
    });

    it('should fetch user with correct id', async () => {
      const response = await request(app)
        .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeTruthy();
      expectUser(response.body, {
        email: 'admin@test.me',
        name: 'Admin Test',
        role: UserRole.ADMIN,
      });
    });

    it('expect an error when bad id is sent', async () => {
      const response = await request(app)
        .get('/api/users/83efc0cd-5655-40a7-b1de-f3a39f95c440')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 404);
    });

    it('should be allowed to return himself as a user', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeTruthy();
      expectUser(response.body, {
        email: 'user@test.me',
        name: 'User Test',
        role: UserRole.USER,
      });
    });

    it('should be allowed to return himself as an admin', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeTruthy();
      expectUser(response.body, {
        email: 'admin@test.me',
        name: 'Admin Test',
        role: UserRole.ADMIN,
      });
    });
  });

  describe('POST /api/users', () => {
    it('should be restrained to anonymous users', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'not-authorized+anonymous@test.test',
          name: 'Not-Authorized Test',
          role: UserRole.ADMIN,
          password: 'changemeplease3',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expectError(response, 401);
    });

    it('should be restrained to invalid users', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'not-authorized+invalid@test.test',
          name: 'Not-Authorized Test',
          role: UserRole.ADMIN,
          password: 'changemeplease3',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(response, 401);
    });

    it('should be restrained to expired token', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'not-authorized+expired@test.test',
          name: 'Not-Authorized Test',
          role: UserRole.ADMIN,
          password: 'changemeplease3',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(response, 401);
    });

    it('should be restrained to unauthorized users', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'not-authorized+permission@test.test',
          name: 'Not-Authorized Test',
          role: UserRole.ADMIN,
          password: 'changemeplease3',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectError(response, 401);
    });

    it('should not create user without email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'NoEmail Test',
          password: 'changemeplease2',
          role: UserRole.USER,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create user with an incorrect email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'incorrect-email@',
          name: 'IncorrectEmail Test',
          password: 'changemeplease2',
          role: UserRole.USER,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create user with an already existing email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'user@test.me',
          name: 'User Test',
          password: 'changemeplease2',
          role: UserRole.ADMIN,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create user without name', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'no-name@test.test',
          password: 'changemeplease2',
          role: UserRole.USER,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create user without password', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'no-password@test.test',
          name: 'NoPassword Test',
          role: UserRole.USER,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create user with password.length < 12', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'no-password@test.test',
          name: 'NoPassword Test',
          password: '12345678901',
          role: UserRole.USER,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not create user without role', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'no-role@test.test',
          name: 'NoRole Test',
          password: 'changemeplease2',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should create the new user', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.test',
          name: 'Test Test',
          role: UserRole.USER,
          password: 'changemeplease2',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(createResponse.headers['content-type']).toMatch(/json/);
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toBeTruthy();
      expectUser(createResponse.body, {
        email: 'test@test.test',
        name: 'Test Test',
        role: UserRole.USER,
      });
      // Test signin for the new user to test password persistance
      const authResponse = await request(app)
        .post('/api/auth/sign')
        .send({
          email: 'test@test.test',
          password: 'changemeplease2',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expect(authResponse.headers['content-type']).toMatch(/json/);
      expect(authResponse.status).toBe(201);
      expect(typeof authResponse.body.token).toBe('string');
      // Test fetching the new user to test every other fields persistance
      const showResponse = await request(app)
        .get('/api/users/' + createResponse.body.data.id)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(showResponse.headers['content-type']).toMatch(/json/);
      expect(showResponse.status).toBe(200);
      expect(showResponse.body.data).toBeTruthy();
      expectUser(showResponse.body, {
        id: createResponse.body.data.id,
        email: createResponse.body.data.email,
        name: createResponse.body.data.name,
        role: createResponse.body.data.role,
      });
    });
  });

  describe('PATCH /api/users', () => {
    const USERS: UserOutput[] = [];
    let index = 0;
    beforeEach(function () {
      const position = index++;
      return request(app)
        .post('/api/users')
        .send({
          email: `patching+${position}@test.test`,
          name: `Patching(${position}) Test`,
          role: UserRole.USER,
          password: 'changemeplease',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .then(function (response) {
          USERS.push(response.body.data);
        });
    });

    it('should be restrained to anonymous users', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expectError(response, 401);
    });

    it('should be restrained to invalid users', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(response, 401);
    });

    it('should be restrained to expired token', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(response, 401);
    });

    it('should be restrained to unauthorized users', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          name: 'Not Authorized Test',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectError(response, 401);
    });

    it('should update user name', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          name: 'Patching Test 02',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectUser(response.body, {
        ...localUser,
        name: 'Patching Test 02',
      });
    });

    it('should not update user with incorrect email', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          email: 'incorrect-email@',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should not update user with an already existing email', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          email: 'admin@test.me',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should update user with the new email', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          email: 'updated-email@test.me',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectUser(response.body, {
        ...localUser,
        email: 'updated-email@test.me',
      });
    });

    it('should update user without role', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          role: UserRole.ADMIN,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectUser(response.body, {
        ...localUser,
        role: UserRole.ADMIN,
      });
    });

    it('should not update user with password.length < 12', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          password: '12345678901',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 400);
    });

    it('should update user with the new password', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      await request(app)
        .patch(`/api/users/${localUser?.id}`)
        .send({
          password: 'jaimeleponey3$',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

      const authResponse = await request(app)
        .post('/api/auth/sign')
        .send({
          email: localUser?.email,
          password: 'jaimeleponey3$',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      expect(authResponse.headers['content-type']).toMatch(/json/);
      expect(authResponse.status).toBe(201);
      expect(typeof authResponse.body.token).toBe('string');
    });
  });

  describe('DELETE /api/users/:id', function () {
    const USERS: UserOutput[] = [];
    let index = 0;
    beforeEach(function () {
      const position = index++;
      return request(app)
        .post('/api/users')
        .send({
          email: `deleting+${position}@test.test`,
          name: `Deleting(${position}) Test`,
          role: UserRole.USER,
          password: 'changemeplease',
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .then(function (response) {
          USERS.push(response.body.data);
        });
    });
    it('should be restrained to anonymous users', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .delete(`/api/users/${localUser?.id}`)
        .set('Accept', 'application/json');
      expectError(response, 401);
    });

    it('should be restrained to invalid users', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .delete(`/api/users/${localUser?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer JaimeLePate`);
      expectError(response, 401);
    });

    it('should be restrained to expired token', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .delete(`/api/users/${localUser?.id}`)
        .set('Accept', 'application/json')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.RW76aZBI8d1Pkl8cIedhBPc1wfU4biOus12gbSQS4Pg`,
        );
      expectError(response, 401);
    });
    it('should be restrained to unauthorized users', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const response = await request(app)
        .delete(`/api/users/${localUser?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${USER_TOKEN}`);
      expectError(response, 401);
    });

    it('should not delete unkown id', async () => {
      const response = await request(app)
        .delete(`/api/users/e50cae52-c794-4e07-baaf-f489d4c4bea9`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expectError(response, 404);
    });

    it('should delete the user', async () => {
      const localUser = USERS.pop();
      expect(localUser).toBeDefined();
      const deleteResponse = await request(app)
        .delete(`/api/users/${localUser?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(deleteResponse.headers['content-type']).toMatch(/json/);
      expect(deleteResponse.status).toBe(200);
      expect(typeof deleteResponse.body).toBe('object');
      expect(Object.keys(deleteResponse.body)).toHaveLength(0);

      const getResponse = await request(app)
        .get(`/api/users/${localUser?.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      expect(getResponse.headers['content-type']).toMatch(/json/);
      expectError(getResponse, 404);
    });
  });
});
