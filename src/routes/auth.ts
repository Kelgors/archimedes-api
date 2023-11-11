import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { RefreshToken } from '../schemas/Auth';
import { AuthRefreshInputBodySchema, AuthSignInputBodySchema } from '../schemas/Auth';
import { authService } from '../services/AuthService';

const buildAuthRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'POST',
    url: '/api/auth/sign',
    schema: {
      body: AuthSignInputBodySchema,
      response: {
        201: z.object({
          accessToken: z.string(),
          refreshToken: z.string(),
        }),
      },
    },
    handler: async function (req, reply) {
      const accessToken = await authService.signIn(req.body.email, req.body.password);
      const refreshToken = await authService.createRefreshToken(accessToken.sub);
      return reply.code(201).send({
        accessToken: fastify.jwt.sign(accessToken, {
          algorithm: 'HS256',
        }),
        refreshToken: fastify.jwt.sign(refreshToken, {
          algorithm: 'HS256',
        }),
      });
    },
  });

  fastifyZod.route({
    method: 'POST',
    url: '/api/auth/renew',
    schema: {
      body: AuthRefreshInputBodySchema,
      response: {
        201: z.object({
          accessToken: z.string(),
        }),
      },
    },
    handler: async function (req, reply) {
      const rawToken = fastify.jwt.verify<RefreshToken>(req.body.refreshToken);
      const accessToken = await authService.renewAccessToken(rawToken);
      return reply.code(201).send({
        accessToken: fastify.jwt.sign(accessToken, {
          algorithm: 'HS256',
        }),
      });
    },
  });
};

export default buildAuthRoutes;
