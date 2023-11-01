import Fastify from 'fastify';

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { NODE_ENV } from './config';
import { AppDataSource } from './db';
import loggingByEnv from './logging';
import setupJwtTokenAuth from './plugins/authenticate';
import apiV1 from './routes';

export async function createServer() {
  await AppDataSource.initialize();

  const fastify = Fastify({
    logger: loggingByEnv[NODE_ENV] ?? true,
  });

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.register(setupJwtTokenAuth);

  fastify.register(apiV1);

  await fastify.ready();

  return fastify;
}
