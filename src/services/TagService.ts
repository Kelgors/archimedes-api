import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { Tag } from '../models/Tag';
import type { TagCreateInput, TagUpdateInput } from '../schemas/Tag';

class TagService implements ICrudService<Tag, TagCreateInput, TagUpdateInput> {
  findAll(options?: FindAllOptions | undefined): Promise<Tag[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(Tag).find({
      skip,
      take,
    });
  }

  findAllByUserId(userId: string, options?: FindAllOptions | undefined): Promise<Tag[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(Tag).find({
      skip,
      take,
      where: {
        bookmarks: {
          lists: {
            permissions: { userId },
          },
        },
      },
    });
  }

  findOne(id: string): Promise<Tag> {
    return getRepository(Tag).findOneOrFail({
      where: { id },
    });
  }

  create(_input: { name: string }): Promise<Tag> {
    throw new Error('Method not implemented.');
  }

  update(_id: string, _input: { name: string }): Promise<Tag> {
    throw new Error('Method not implemented.');
  }

  delete(_id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

export const tagService = new TagService();
