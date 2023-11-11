import type { FindOperator } from 'typeorm';
import { Equal, In, type FindOptionsWhere } from 'typeorm';
import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { List } from '../models/List';
import { Visibility } from '../models/ListVisibility';
import type { ListCreateInputBody, ListUpdateInputBody } from '../schemas/List';

type FilterableProperties = {
  userId?: string;
  writeable?: boolean;
  listIds?: string[];
};

type ListFindAllOptions = FindAllOptions<Omit<FilterableProperties, 'userId'>>;

class ListService implements ICrudService<List, ListCreateInputBody, ListUpdateInputBody> {
  findAll(options?: FindAllOptions<{ ids?: string[] }> | undefined): Promise<List[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(List).find({
      skip,
      take,
      where: { id: options?.ids ? In(options.ids) : undefined },
    });
  }

  findAllAnonymous(options?: ListFindAllOptions | undefined): Promise<List[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(List).find({
      skip,
      take,
      where: this.buildWhereOptions(options),
    });
  }

  /**
   * Find Lists by their ID with any read/write access for the given user ID
   */
  findAllByUserId(userId: string, options?: ListFindAllOptions | undefined): Promise<List[]> {
    const take = Math.min(options?.perPage || 20, 100);
    const skip = ((options?.page || 1) - 1) * take;

    return getRepository(List).find({
      skip,
      take,
      where: this.buildWhereOptions({ userId, listIds: options?.listIds, writeable: options?.writeable }),
    });
  }

  /**
   * Find one List by its ID with any read/write access for the given user ID
   */
  findOneWithUserId(id: string, userId: string): Promise<List> {
    return getRepository(List).findOneOrFail({
      where: this.buildWhereOptions({
        userId,
        listIds: [id],
      }),
    });
  }

  findOne(id: string): Promise<List> {
    return getRepository(List).findOneOrFail({
      where: this.buildWhereOptions({
        listIds: [id],
      }),
    });
  }

  create(input: ListCreateInputBody): Promise<List> {
    const repo = getRepository(List);
    return repo.save(repo.create(input));
  }

  update(dbOriginalList: List, input: ListUpdateInputBody): Promise<List> {
    return getRepository(List).save(Object.assign(dbOriginalList, input));
  }

  delete(item: List): Promise<List> {
    return getRepository(List).remove(item);
  }

  private buildWhereOptions(options?: FilterableProperties): FindOptionsWhere<List> | FindOptionsWhere<List>[] {
    const where: FindOptionsWhere<List>[] = [];
    const id: FindOperator<string> | undefined = options?.listIds?.length ? In(options.listIds) : undefined;
    const isWritable: FindOperator<boolean> | undefined =
      typeof options?.writeable === 'boolean' ? Equal(options.writeable) : undefined;
    const queryOneItem = options?.listIds?.length === 1 || false;

    const userId = options?.userId;
    if (userId) {
      where.push({
        id,
        permissions: { isWritable },
        visibility: { instance: Visibility.PUBLIC },
      });
      if (queryOneItem) {
        where.push({
          id,
          permissions: { userId, isWritable },
          visibility: { instance: Visibility.SHARED },
        });
      }
      if (typeof options.writeable !== 'boolean' || options.writeable) {
        where.push({ id, ownerId: userId });
      }
    }
    if ((userId && queryOneItem) || !userId) {
      where.push({
        id,
        permissions: { isWritable },
        visibility: { anonymous: queryOneItem ? In([Visibility.SHARED, Visibility.PUBLIC]) : Visibility.PUBLIC },
      });
    }

    return where;
  }
}

export const listService = new ListService();
