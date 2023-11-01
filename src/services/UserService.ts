import { omit } from 'lodash';
import { QueryFailedError } from 'typeorm';
import { getRepository } from '../db';
import { FindAllOptions, ICrudService } from '../models/ICrudService';
import { User } from '../models/User';
import { UserCreateInput, UserUpdateInput } from '../schemas/User';
import { HttpException } from '../utils/HttpException';
import { passwordEncryptionService } from './PasswordEncryptionService';

class UserService implements ICrudService<User, UserCreateInput, UserUpdateInput> {
  async findAll(options: FindAllOptions): Promise<User[]> {
    const take = Math.min(options.perPage || 20, 50);
    const skip = ((options.page || 1) - 1) * take;
    return getRepository(User).find({
      skip,
      take,
    });
  }
  findOne(id: string): Promise<User> {
    return getRepository(User).findOneOrFail({
      where: { id },
    });
  }
  async create(input: UserCreateInput): Promise<User> {
    try {
      return getRepository(User).save({
        email: input.email,
        name: input.name,
        role: input.role,
        encryptedPassword: await passwordEncryptionService.encryptPassword(input.password),
      });
    } catch (err) {
      console.log('Error from create()');
      if (err instanceof QueryFailedError) {
        console.log(`name: %s, message: %s`, err.name, err.message);
        if (err.message === 'UNIQUE constraint failed: user.email') {
          throw new HttpException(400, 'email already exists');
        }
      }
      throw err;
    }
  }

  async update(id: string, input: UserUpdateInput): Promise<User> {
    const dbOriginalUser = await getRepository(User).findOneOrFail({
      where: { id },
    });
    const dbPayload = Object.assign({}, dbOriginalUser, omit(input, ['password']));
    if (input.password) {
      dbPayload.encryptedPassword = await passwordEncryptionService.encryptPassword(input.password);
    }
    return getRepository(User).save(dbPayload);
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await getRepository(User).delete({
      id,
    });
    return (deleteResult.affected || 0) !== 0;
  }
}

export const userService = new UserService();
