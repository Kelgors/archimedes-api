import Fastify from 'fastify';

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { appDataSource } from './db';
import loggerConfig from './logging';
import setupJwtTokenAuth from './plugins/authenticate';
import apiV1 from './routes';

export async function createServer() {
  const fastify = Fastify({
    logger: loggerConfig,
  });

  await appDataSource.initialize();
  fastify.addHook('onClose', () => appDataSource.destroy());

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.register(setupJwtTokenAuth);

  fastify.register(apiV1);

  await fastify.ready();

  return fastify;
}
