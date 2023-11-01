import { Express } from 'express';
import request from 'supertest';
import { createServer } from '../../src/server';

describe('/api/auth', function () {
  let app: Express | undefined;
  beforeAll(async function () {
    app = await createServer();
  });

  describe('POST /api/auth/sign', () => {
    it('should successfuly connect', async () => {
      const response = await request(app)
        .post('/api/auth/sign')
        .send({
          email: 'admin@test.me',
          password: 'changemeplease',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(201);
      expect(typeof response.body.token).toBe('string');
    });

    it('should return 404 when password is wrong', async () => {
      const response = await request(app)
        .post('/api/auth/sign')
        .send({
          email: 'admin@test.me',
          password: 'chang3m3pl3a$e',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(404);
    });

    it('should return 404 when email is wrong', async () => {
      const response = await request(app)
        .post('/api/auth/sign')
        .send({
          email: 'adm1n@test.me',
          password: 'changemeplease',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toBe(404);
    });
  });
});
