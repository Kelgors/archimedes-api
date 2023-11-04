import request from 'supertest';

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
