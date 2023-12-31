import dotenv from 'dotenv';
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT || '', 10) || 3000;
export const HOST = process.env.HOST || '0.0.0.0';
export const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}
export const APP_SECRET = process.env.APP_SECRET || '';
if (!APP_SECRET) {
  throw new Error('Missing APP_SECRET');
}

export const DB_TYPE = process.env.DB_TYPE || '';
export const DB_HOST = process.env.DB_HOST || '';
export const DB_PORT = parseInt(process.env.DB_PORT || '', 10) || 0;
export const DB_USER = process.env.DB_USER || '';
export const DB_PASS = process.env.DB_PASS || '';
export const DB_NAME = process.env.DB_NAME || '';
export const DB_SYNC = process.env.DB_SYNC === 'true';

export const LOG_TARGET = process.env.LOG_TARGET || '';
export const LOG_PATH = process.env.LOG_PATH || null;
