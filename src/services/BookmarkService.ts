import { In } from 'typeorm';
import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { Bookmark } from '../models/Bookmark';
import { Visibility } from '../models/ListVisibility';
import type { BookmarkCreateInputBody, BookmarkUpdateInputBody } from '../schemas/Bookmark';

class BookmarkService implements ICrudService<Bookmark, BookmarkCreateInputBody, BookmarkUpdateInputBody> {
  findAll(_options?: FindAllOptions | undefined): Promise<Bookmark[]> {
    throw new Error('Method not implemented.');
  }

  findAllByListId(listId: string, options?: FindAllOptions | undefined): Promise<Bookmark[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(Bookmark).find({
      skip,
      take,
      where: {
        lists: { id: listId },
      },
    });
  }

  findOne(id: string): Promise<Bookmark> {
    return getRepository(Bookmark).findOneOrFail({
      where: {
        id,
        lists: {
          visibility: { anonymous: In([Visibility.SHARED, Visibility.PUBLIC]) },
        },
      },
    });
  }

  findOneWithUserId(id: string, userId: string): Promise<Bookmark> {
    return getRepository(Bookmark).findOneOrFail({
      where: {
        id,
        lists: [
          { ownerId: userId },
          { permissions: { userId }, visibility: { instance: Visibility.SHARED } },
          { visibility: { instance: Visibility.PUBLIC } },
          { visibility: { anonymous: In([Visibility.SHARED, Visibility.PUBLIC]) } },
        ],
      },
    });
  }

  findOneByListId(listId: string): Promise<Bookmark> {
    return getRepository(Bookmark).findOneOrFail({
      where: { lists: { id: listId } },
    });
  }

  create(input: BookmarkCreateInputBody): Promise<Bookmark> {
    const repo = getRepository(Bookmark);
    return repo.save(repo.create(input));
  }

  update(item: Bookmark, input: BookmarkUpdateInputBody): Promise<Bookmark> {
    return getRepository(Bookmark).save(Object.assign(item, input));
  }

  delete(item: Bookmark): Promise<Bookmark> {
    return getRepository(Bookmark).remove(item);
  }
}

export const bookmarkService = new BookmarkService();
