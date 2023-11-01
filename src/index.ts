import 'reflect-metadata';
import { HOST, PORT } from './config';
import { createServer } from './server';

createServer().then(function (app) {
  return app.listen({
    port: PORT,
    host: HOST,
  });
});
