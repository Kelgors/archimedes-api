import express from 'express';
import { AppDataSource } from './db';
import apiV1 from './routes';

export async function createServer() {
  await AppDataSource.initialize();

  const app = express();
  app.use(express.json());
  app.use('/api', apiV1);

  return app;
}
