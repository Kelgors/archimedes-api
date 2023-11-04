import { omit } from 'lodash';
import { QueryFailedError } from 'typeorm';
import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { User } from '../models/User';
import type { UserCreateInputBody, UserUpdateInputBody } from '../schemas/User';
import { HttpException } from '../utils/HttpException';
import { passwordEncryptionService } from './PasswordEncryptionService';

class UserService implements ICrudService<User, UserCreateInputBody, UserUpdateInputBody> {
  async findAll(options: FindAllOptions): Promise<User[]> {
    const take = Math.min(options.perPage || 20, 50);
    const skip = ((options.page || 1) - 1) * take;
    return getRepository(User).find({
      skip,
      take,
    });
  }

  async findOne(id: string): Promise<User> {
    return getRepository(User).findOneOrFail({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return getRepository(User).findOneOrFail({
      where: { email },
    });
  }

  async create(input: UserCreateInputBody): Promise<User> {
    try {
      return await getRepository(User).save({
        email: input.email,
        name: input.name,
        role: input.role,
        encryptedPassword: await passwordEncryptionService.encryptPassword(input.password),
      });
    } catch (err) {
      if (err instanceof QueryFailedError) {
        if (err.message.includes('UNIQUE constraint failed: user.email')) {
          throw new HttpException(400, 'email already exists');
        }
      }
      throw err;
    }
  }

  async update(id: string, input: UserUpdateInputBody): Promise<User> {
    const dbOriginalUser = await getRepository(User).findOneOrFail({
      where: { id },
    });
    const dbPayload = Object.assign({}, dbOriginalUser, omit(input, ['password']));
    if (input.password) {
      dbPayload.encryptedPassword = await passwordEncryptionService.encryptPassword(input.password);
    }
    try {
      return await getRepository(User).save(dbPayload);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        if (err.message.includes('UNIQUE constraint failed: user.email')) {
          throw new HttpException(400, 'email already exists');
        }
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await getRepository(User).delete({
      id,
    });
    return (deleteResult.affected || 0) !== 0;
  }
}

export const userService = new UserService();
