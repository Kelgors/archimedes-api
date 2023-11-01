import { z } from 'zod';
import { USER_EMAIL, USER_ID, USER_PLAIN_PASSWORD, USER_ROLE } from './User';

export const TokenSchema = z.object({
  sub: USER_ID,
  role: USER_ROLE,
  exp: z.number(),
});

export const AuthSignInputBodySchema = z.object({
  email: USER_EMAIL,
  password: USER_PLAIN_PASSWORD,
});

export type Token = z.infer<typeof TokenSchema>;
export type AuthSignBody = z.infer<typeof AuthSignInputBodySchema>;
