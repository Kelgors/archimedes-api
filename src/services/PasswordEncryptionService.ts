import * as argon2 from 'argon2';
import { APP_SECRET } from '../config';

class PasswordEncryptionService {
  async encryptPassword(password: string) {
    return argon2.hash(password + APP_SECRET);
  }
  async verifyPassword(encryptedPassword: string, plainPassword: string) {
    return argon2.verify(encryptedPassword, plainPassword + APP_SECRET);
  }
}

export const passwordEncryptionService = new PasswordEncryptionService();
