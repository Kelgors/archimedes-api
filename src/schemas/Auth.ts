import { z } from 'zod';
import { UserRole } from '../models/User';
import { USER_EMAIL, USER_PLAIN_PASSWORD } from './User';

export type Token = {
  sub: string;
  role: UserRole;
  exp: number;
};

export const AuthSignSchema = z.object({
  email: USER_EMAIL,
  password: USER_PLAIN_PASSWORD,
});

export type AuthSign = z.infer<typeof AuthSignSchema>;
