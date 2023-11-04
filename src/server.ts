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

  fastify.log.info(`Starting connection to ${appDataSource.options.type}`);
  await appDataSource.initialize();
  fastify.addHook('onClose', (f) => f.log.info('Closing server'));
  fastify.addHook('onClose', () => appDataSource.destroy());

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.register(setupJwtTokenAuth);

  fastify.register(apiV1);

  await fastify.ready();

  process.on('SIGTERM', async function (signal) {
    fastify.log.info(`Received ${signal}`);
    await fastify.close();
  });
  process.on('SIGINT', async function (signal) {
    fastify.log.info(`Received ${signal}`);
    await fastify.close();
  });

  return fastify;
}
