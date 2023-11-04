import { EntityNotFoundError } from 'typeorm';
import { getRepository } from '../db';
import { AuthRefreshToken } from '../models/AuthRefreshToken';
import type { User, UserRole } from '../models/User';
import type { AccessToken, RefreshToken } from '../schemas/Auth';
import { AppError, AppErrorCode } from '../utils/ApplicationError';
import { passwordEncryptionService } from './PasswordEncryptionService';
import { userService } from './UserService';

class AuthService {
  async signIn(email: string, plainPassword: string): Promise<AccessToken> {
    let dbUser: User | undefined;
    try {
      dbUser = await userService.findOneByEmail(email);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new AppError(AppErrorCode.WRONG_EMAIL_OR_PASSWORD);
      }
      throw err;
    }

    const isPasswordCorrect = await passwordEncryptionService.verifyPassword(dbUser.encryptedPassword, plainPassword);
    if (!isPasswordCorrect) {
      throw new AppError(AppErrorCode.WRONG_EMAIL_OR_PASSWORD);
    }

    if (passwordEncryptionService.needsRehash(dbUser.encryptedPassword)) {
      await userService.update(dbUser.id, {
        password: plainPassword,
      });
    }

    return this.createAccessToken(dbUser.id, dbUser.role);
  }

  async renewAccessToken(refreshToken: RefreshToken): Promise<AccessToken> {
    const dbRefreshToken = await getRepository(AuthRefreshToken).findOneOrFail({
      where: { id: refreshToken.jti, userId: refreshToken.sub },
    });
    const dbUser = await dbRefreshToken.user;
    return this.createAccessToken(dbUser.id, dbUser.role);
  }

  private createAccessToken(sub: string, role: UserRole): AccessToken {
    return {
      sub,
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 10 /* 10 minutes */,
    };
  }

  async createRefreshToken(userId: string): Promise<RefreshToken> {
    const repo = getRepository(AuthRefreshToken);
    return repo
      .save(
        repo.create({
          userId,
          createdAt: new Date(),
          expireAt: new Date(Math.floor(Date.now()) + 1000 * 60 * 60 * 24 * 30) /* 30 days */,
        }),
      )
      .then((dbRefreshToken) => dbRefreshToken.generateToken());
  }
}

export const authService = new AuthService();
