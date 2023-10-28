import { z } from 'zod';

export const USER_ID = z.string().uuid();
export const USER_EMAIL = z.string().email();
const USER_NAME = z.string();
export const USER_PLAIN_PASSWORD = z.string().min(12);
const USER_ROLE = z.number().positive().int();

export const UserCreateInputParser = z.object({
  email: USER_EMAIL,
  name: USER_NAME,
  role: USER_ROLE,
  password: USER_PLAIN_PASSWORD,
});

export const UserUpdateSchema = UserCreateInputParser.partial();

export const UserSchema = z.object({
  id: USER_ID,
  email: USER_EMAIL,
  name: USER_NAME,
  role: USER_ROLE,
});

export enum UserRole {
  USER = 100,
  ADMIN = 1000,
}

export type UserCreateInput = z.infer<typeof UserCreateInputParser>;
export type User = z.infer<typeof UserSchema>;
