import { z } from 'zod';
import { USER_EMAIL, USER_ID, USER_PLAIN_PASSWORD, USER_ROLE } from './User';

export const AccessTokenSchema = z.object({
  sub: USER_ID,
  role: USER_ROLE,
  exp: z.number(),
});

export const RefreshTokenSchema = z.object({
  jti: z.string().uuid(),
  iat: z.number().positive(),
  exp: z.number().positive(),
  sub: z.string().uuid(),
});

export const AuthSignInputBodySchema = z.object({
  email: USER_EMAIL,
  password: USER_PLAIN_PASSWORD,
});

export const AuthRefreshInputBodySchema = z.object({
  refreshToken: z.string(),
});

export type AccessToken = z.infer<typeof AccessTokenSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type AuthSignBody = z.infer<typeof AuthSignInputBodySchema>;
