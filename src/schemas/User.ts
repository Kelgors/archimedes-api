import { z } from 'zod';
import { UserRole } from '../models/User';

export const USER_ID = z.string().uuid();
export const USER_EMAIL = z.string().email();
export const USER_NAME = z.string();
export const USER_PLAIN_PASSWORD = z.string().min(12);
export const USER_ROLE = z.nativeEnum(UserRole);

export const UserCreateInputBodySchema = z.object({
  email: USER_EMAIL,
  name: USER_NAME,
  role: USER_ROLE,
  password: USER_PLAIN_PASSWORD,
});

export const UserUpdateInputBodySchema = UserCreateInputBodySchema.partial();

export const UserOutputSchema = z.object({
  id: USER_ID,
  email: USER_EMAIL,
  name: USER_NAME,
  role: USER_ROLE,
});
export const DeleteUserOutputSchema = UserOutputSchema.merge(z.object({ id: USER_ID.optional() }));

export type UserCreateInputBody = z.infer<typeof UserCreateInputBodySchema>;
export type UserUpdateInputBody = z.infer<typeof UserUpdateInputBodySchema>;
export type UserOutput = z.infer<typeof UserOutputSchema>;
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;
