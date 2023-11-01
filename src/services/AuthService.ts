import { getRepository } from '../db';
import { User } from '../models/User';
import { Token } from '../schemas/Auth';
import { AppError, AppErrorCode } from '../utils/ApplicationError';
import { passwordEncryptionService } from './PasswordEncryptionService';

class AuthService {
  async signIn(email: string, plainPassword: string): Promise<Token> {
    const dbUser = await getRepository(User).findOne({
      where: { email },
    });
    if (!dbUser) {
      throw new AppError(AppErrorCode.WRONG_EMAIL_OR_PASSWORD, 'User with email/password pair not found');
    }

    const isPasswordCorrect = await passwordEncryptionService.verifyPassword(dbUser.encryptedPassword, plainPassword);
    if (!isPasswordCorrect) {
      throw new AppError(AppErrorCode.WRONG_EMAIL_OR_PASSWORD, 'User with email/password pair not found');
    }

    return {
      sub: dbUser.id,
      role: dbUser.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 /* 1 week */,
    };
  }
}

export const authService = new AuthService();
