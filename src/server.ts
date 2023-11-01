import Fastify from 'fastify';

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { JWT_SECRET, NODE_ENV } from './config';
import { AppDataSource } from './db';
import loggingByEnv from './logging';
import parseJwtToken from './plugins/parse-jwt-token';
import requireJwtToken from './plugins/require-jwt-token';
import apiV1 from './routes';

export async function createServer() {
  await AppDataSource.initialize();

  const fastify = Fastify({
    logger: loggingByEnv[NODE_ENV] ?? true,
  });

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.register(parseJwtToken, {
    algorithms: ['HS256'],
    secret: JWT_SECRET,
  });
  fastify.register(requireJwtToken);

  fastify.register(apiV1);

  await fastify.ready();

  return fastify;
}
