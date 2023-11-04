import type { RawServerDefault } from 'fastify';
import request from 'supertest';

export function signIn(app: RawServerDefault): Promise<string[]> {
  return Promise.all([
    request(app)
      .post('/api/auth/sign')
      .send({
        email: 'admin@test.me',
        password: 'changemeplease',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .then(function (response) {
        expect(response.body).toHaveProperty('accessToken');
        expect(typeof response.body.accessToken).toBe('string');
        return response.body.accessToken;
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
        expect(response.body).toHaveProperty('accessToken');
        expect(typeof response.body.accessToken).toBe('string');
        return response.body.accessToken;
      }),
  ]);
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
