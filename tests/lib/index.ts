import type { RawServerDefault } from 'fastify';
import request from 'supertest';

export function signIn(app: RawServerDefault, email: string, password: string) {
  return request(app)
    .post('/api/auth/sign')
    .send({ email, password })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then(function (response) {
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      return response.body.accessToken;
    });
}

export function signAdmin(app: RawServerDefault) {
  return signIn(app, 'admin@test.me', 'changemeplease');
}

export function signSimpleUser(app: RawServerDefault) {
  return signIn(app, 'user@test.me', 'changemeplease');
}

export function signNullUser(app: RawServerDefault) {
  return signIn(app, 'null@test.me', 'changemeplease');
}

export function expectSuccessfulResponse(response: request.Response, statusCode: number = 200): void {
  expect(response.headers['content-type']).toMatch(/json/);
  expect(response.status).toBe(statusCode);
  expect(response.body).toBeDefined();
  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toBeDefined();
}

export function expectError(response: request.Response, status: number, message?: string) {
  expect(response.headers['content-type']).toMatch(/json/);
  expect(response.status).toBe(status);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error).toBeDefined();
  expect(response.body.error.code).toBe(status);
  expect(typeof response.body.error.message).toBe('string');
  if (message) {
    expect(response.body.error.message).toBe(message);
  }
}
