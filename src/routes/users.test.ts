import request from 'supertest';
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

describe('GET /api/users', () => {
  it('should be restrained to unauthorized users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${USER_TOKEN}`);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe(403);
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
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe(403);
  });

  it('should fetch user with correct id', async () => {
    const response = await request(app)
      .get('/api/users/83efc0cc-5655-40a7-b1de-f3a39f95c440')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeTruthy();
    expect(response.body.data.email).toBe('admin@test.me');
    expect(response.body.data.name).toBe('Admin Test');
    expect(response.body.data.password).not.toBeDefined();
    expect(response.body.data.encryptedPassword).not.toBeDefined();
    expect(response.body.data.role).toBe(1000);
  });

  it('expect an error when bad id is sent', async () => {
    const response = await request(app)
      .get('/api/users/83efc0cd-5655-40a7-b1de-f3a39f95c440')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe(404);
  });

  it('should be allowed to return himself as a user', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${USER_TOKEN}`);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeTruthy();
    expect(response.body.data.email).toBe('user@test.me');
    expect(response.body.data.name).toBe('User Test');
    expect(response.body.data.password).not.toBeDefined();
    expect(response.body.data.encryptedPassword).not.toBeDefined();
    expect(response.body.data.role).toBe(100);
  });

  it('should be allowed to return himself as an admin', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeTruthy();
    expect(response.body.data.email).toBe('admin@test.me');
    expect(response.body.data.name).toBe('Admin Test');
    expect(response.body.data.password).not.toBeDefined();
    expect(response.body.data.encryptedPassword).not.toBeDefined();
    expect(response.body.data.role).toBe(1000);
  });
});
