import dotenv from 'dotenv';
import request from 'supertest';
import { createServer } from '../src/server';

export default async function () {
  dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}`,
  });
  const app = await createServer();

  await request(app)
    .post('/api/auth/sign')
    .send({
      email: 'admin@test.me',
      password: 'changemeplease',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
}
