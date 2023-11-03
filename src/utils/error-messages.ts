import { HttpException } from './HttpException';

export default {
  // Libraries
  FAST_JWT_INVALID_SIGNATURE: new HttpException(401, 'Invalid token signature'),
  FAST_JWT_EXPIRED: new HttpException(401, 'Token validity expired'),
  FST_JWT_AUTHORIZATION_TOKEN_EXPIRED: new HttpException(401, 'Token validity expired'),
  FST_JWT_AUTHORIZATION_TOKEN_INVALID: new HttpException(400, 'Invalid token'),
  FST_JWT_BAD_REQUEST: new HttpException(400, 'Invalid token'),
  FST_JWT_NO_AUTHORIZATION_IN_HEADER: new HttpException(400, 'Missing authorization header'),
  // Application
  WRONG_EMAIL_OR_PASSWORD: new HttpException(404, 'User with email/password pair not found'),
  MISSING_PERMISSIONS: new HttpException(401, 'Not sufficient permissions'),
} as Record<string, HttpException>;