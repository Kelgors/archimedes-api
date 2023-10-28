import request from 'supertest';
import { User } from '../schemas/User';
import app from '../server';

let ADMIN_TOKEN = '';
let USER_TOKEN = '';
beforeAll(async function () {
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
        USER_TOKEN = response.body.token;
      }),
  ]);
});

function expectUser(body: any, user: Partial<User>) {
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
  expect(response.body.error.code).toBe(status);
}

describe('GET /api/users', () => {
  it('should be restrained to unauthorized users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${USER_TOKEN}`);
    expectError(response, 403);
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
});

describe('GET /api/users/:id', () => {
  it('should be restrained to unauthorized users', async () => {
    const response = await request(app)
      .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${USER_TOKEN}`);
    expectError(response, 403);
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
      role: 1000,
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
      role: 100,
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
      role: 1000,
    });
  });
});

describe('POST /api/users', () => {
  it('should be restrained to unauthorized users', async () => {
    const response = await request(app)
      .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${USER_TOKEN}`);
    expectError(response, 403);
  });

  it('should not create user without email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'NoEmail Test',
        password: 'changemeplease2',
        role: 100,
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
        role: 100,
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
        role: 1000,
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
        role: 100,
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
        role: 100,
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
        role: 100,
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
        role: 100,
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
      role: 100,
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
