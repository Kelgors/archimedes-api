import { z } from 'zod';
import { UserRole } from '../models/User';
import { USER_EMAIL, USER_PLAIN_PASSWORD } from './User';

export const TokenSchema = z.object({
  sub: z.string(),
  role: z.nativeEnum(UserRole),
  exp: z.number(),
});

export const AuthSignInputBodySchema = z.object({
  email: USER_EMAIL,
  password: USER_PLAIN_PASSWORD,
});

export type Token = z.infer<typeof TokenSchema>;
export type AuthSignBody = z.infer<typeof AuthSignInputBodySchema>;
