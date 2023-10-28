import dotenv from 'dotenv';
import request from 'supertest';
import app from '../src/server';

export default async function () {
  dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}`,
  });

  const response = await request(app)
    .post('/api/auth/sign')
    .send({
      email: 'admin@test.me',
      password: 'changemeplease',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
}
