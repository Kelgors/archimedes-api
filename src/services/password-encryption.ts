import * as argon2 from 'argon2';
import { APP_SECRET } from '../config';

export async function encryptPassword(password: string) {
  return argon2.hash(password + APP_SECRET);
}
export async function verifyPassword(encryptedPassword: string, plainPassword: string) {
  return argon2.verify(encryptedPassword, plainPassword + APP_SECRET);
}
