import { z } from 'zod';
import { USER_EMAIL, USER_PLAIN_PASSWORD } from './User';

export const AuthSigninParser = z.object({
  email: USER_EMAIL,
  password: USER_PLAIN_PASSWORD,
});

export type AuthSignin = z.infer<typeof AuthSigninParser>;
