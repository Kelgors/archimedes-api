import { EntityNotFoundError } from 'typeorm';
import { User } from '../models/User';
import { Token } from '../schemas/Auth';
import { AppError, AppErrorCode } from '../utils/ApplicationError';
import { passwordEncryptionService } from './PasswordEncryptionService';
import { userService } from './UserService';

class AuthService {
  async signIn(email: string, plainPassword: string): Promise<Token> {
    let dbUser: User | undefined;
    try {
      dbUser = await userService.findOneByEmail(email);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new AppError(AppErrorCode.WRONG_EMAIL_OR_PASSWORD, 'User with email/password pair not found');
      }
      throw err;
    }

    const isPasswordCorrect = await passwordEncryptionService.verifyPassword(dbUser.encryptedPassword, plainPassword);
    if (!isPasswordCorrect) {
      throw new AppError(AppErrorCode.WRONG_EMAIL_OR_PASSWORD, 'User with email/password pair not found');
    }

    if (passwordEncryptionService.needsRehash(dbUser.encryptedPassword)) {
      await userService.update(dbUser.id, {
        password: plainPassword,
      });
    }

    return {
      sub: dbUser.id,
      role: dbUser.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 /* 1 week */,
    };
  }
}

export const authService = new AuthService();
