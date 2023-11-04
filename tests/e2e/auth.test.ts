import fastJwt from 'fast-jwt';
import type { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';
import { JWT_SECRET } from '../../src/config';
import { createServer } from '../../src/server';
import errorMessages from '../../src/utils/error-messages';
import { expectError } from '../lib';

describe('/api/auth', function () {
  let fastify: FastifyInstance | undefined;
  let app: RawServerDefault | undefined;
  beforeAll(async function () {
    fastify = await createServer();
    app = fastify.server;
  });
  afterAll(() => fastify?.close());

  const verify = fastJwt.createVerifier({
    algorithms: ['HS256'],
    key: JWT_SECRET,
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
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');

      expect(() => verify(response.body.accessToken)).not.toThrow();
      const decodedToken = verify(response.body.accessToken);
      expect(typeof decodedToken.sub).toBe('string');
      expect(typeof decodedToken.iat).toBe('number');
      expect(typeof decodedToken.exp).toBe('number');
      expect(typeof decodedToken.role).toBe('string');
      expect(Object.keys(decodedToken)).toHaveLength(4);
    });

    it('should be an error when password is wrong', async () => {
      const response = await request(app)
        .post('/api/auth/sign')
        .send({
          email: 'admin@test.me',
          password: 'chang3m3pl3a$e',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      expectError(
        response,
        errorMessages['WRONG_EMAIL_OR_PASSWORD']().code,
        errorMessages['WRONG_EMAIL_OR_PASSWORD']().message,
      );
    });

    it('should be an error when email is wrong', async () => {
      const response = await request(app)
        .post('/api/auth/sign')
        .send({
          email: 'adm1n@test.me',
          password: 'changemeplease',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      expectError(
        response,
        errorMessages['WRONG_EMAIL_OR_PASSWORD']().code,
        errorMessages['WRONG_EMAIL_OR_PASSWORD']().message,
      );
    });
  });

  describe('POST /api/auth/renew', () => {
    it('should successfuly refresh token', async () => {
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
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.refreshToken).toBe('string');

      expect(() => verify(response.body.refreshToken)).not.toThrow();
      const decodedRefreshToken = verify(response.body.refreshToken);
      expect(typeof decodedRefreshToken.sub).toBe('string');
      expect(typeof decodedRefreshToken.iat).toBe('number');
      expect(typeof decodedRefreshToken.exp).toBe('number');
      expect(typeof decodedRefreshToken.jti).toBe('string');
      expect(Object.keys(decodedRefreshToken)).toHaveLength(4);

      // wait 1s for iat,exp to change
      await new Promise((r) => setTimeout(r, 1000));

      const refreshResponse = await request(app)
        .post('/api/auth/renew')
        .send({
          refreshToken: response.body.refreshToken,
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(typeof refreshResponse.body.accessToken).toBe('string');
      expect(response.body.accessToken).not.toBe(refreshResponse.body.accessToken);
    });

    it('should be restrained to anonymous users', async () => {
      const response = await request(app)
        .post('/api/auth/renew')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({});
      expectError(response, 400, 'Invalid format');
      expect(response.body.error.details[0]).toEqual({
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['refreshToken'],
        message: 'Required',
      });
    });

    it('should be restrained to invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/renew')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJqdGkiOiI1ODI3ZWE3ZC00ZTlmLTQ4ZWEtOTEzNS05YmZjYjZkNzM2MzYiLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.i7m8ZEwyTiGV7kO0D148hR58EaZBZ_YII4d056vHSFI',
        });
      expectError(
        response,
        errorMessages['FAST_JWT_INVALID_SIGNATURE']().code,
        errorMessages['FAST_JWT_INVALID_SIGNATURE']().message,
      );
    });

    it('should be restrained to expired token', async () => {
      const response = await request(app)
        .post('/api/auth/renew')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M2VmYzBjYy01NjU1LTQwYTctYjFkZS1mM2EzOWY5NWM0NDAiLCJqdGkiOiI1ODI3ZWE3ZC00ZTlmLTQ4ZWEtOTEzNS05YmZjYjZkNzM2MzYiLCJleHAiOjE2OTg4Njk0NzYsImlhdCI6MTY5ODg2OTQ3NX0.TME2KFTB1NhqqjyOnblVQdbe9pHtkLyVopUJ94bKak4',
        });
      expectError(response, errorMessages['FAST_JWT_EXPIRED']().code, errorMessages['FAST_JWT_EXPIRED']().message);
    });
  });
});
