import slugify from 'slugify';
import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { Tag } from '../models/Tag';
import type { TagCreateInputBody, TagUpdateInputBody } from '../schemas/Tag';

class TagService implements ICrudService<Tag, TagCreateInputBody, TagUpdateInputBody> {
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

  create(input: TagCreateInputBody): Promise<Tag> {
    const repo = getRepository(Tag);
    return repo.save(
      repo.create({
        name: this.slugifyTagName(input.name),
      }),
    );
  }

  async update(id: string, input: TagUpdateInputBody): Promise<Tag> {
    const dbOriginalTag = await getRepository(Tag).findOneOrFail({
      where: { id },
    });
    return getRepository(Tag).save(
      Object.assign(dbOriginalTag, {
        ...input,
        name: this.slugifyTagName(input.name),
      }),
    );
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await getRepository(Tag).delete({
      id,
    });
    return (deleteResult.affected || 0) !== 0;
  }

  private slugifyTagName(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
    });
  }
}

export const tagService = new TagService();
