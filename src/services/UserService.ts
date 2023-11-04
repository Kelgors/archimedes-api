import { omit } from 'lodash';
import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { User } from '../models/User';
import type { UserCreateInputBody, UserUpdateInputBody } from '../schemas/User';
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
    return getRepository(User).save({
      email: input.email,
      name: input.name,
      role: input.role,
      encryptedPassword: await passwordEncryptionService.encryptPassword(input.password),
    });
  }

  async update(dbOriginalUser: User, input: UserUpdateInputBody): Promise<User> {
    const dbPayload = Object.assign({}, dbOriginalUser, omit(input, ['password']));
    if (input.password) {
      dbPayload.encryptedPassword = await passwordEncryptionService.encryptPassword(input.password);
    }
    return getRepository(User).save(dbPayload);
  }

  delete(item: User): Promise<User> {
    return getRepository(User).remove(item);
  }
}

export const userService = new UserService();
