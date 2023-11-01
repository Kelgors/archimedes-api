import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { AuthSignInputBodySchema } from '../schemas/Auth';
import { authService } from '../services/AuthService';

const buildAuthRoutes = function (fastify: FastifyInstance) {
  const fastifyZod = fastify.withTypeProvider<ZodTypeProvider>();

  fastifyZod.route({
    method: 'POST',
    url: '/api/auth/sign',
    schema: {
      body: AuthSignInputBodySchema,
      response: {
        200: {
          token: z.string(),
        },
      },
    },
    handler: async function (req, reply) {
      const token = await authService.signIn(req.body.email, req.body.password);
      return reply.code(201).send({
        token: fastify.jwt.sign(token, {
          algorithm: 'HS256',
        }),
      });
    },
  });
};

export default buildAuthRoutes;
