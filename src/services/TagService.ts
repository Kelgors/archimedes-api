import slugify from 'slugify';
import { In } from 'typeorm';
import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { Tag } from '../models/Tag';
import type { TagCreateInputBody, TagUpdateInputBody } from '../schemas/Tag';

class TagService implements ICrudService<Tag, TagCreateInputBody, TagUpdateInputBody> {
  findAll(options?: FindAllOptions<{ ids?: string[] }> | undefined): Promise<Tag[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(Tag).find({
      skip,
      take,
      where: { id: options?.ids ? In(options.ids) : undefined },
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

  update(dbOriginalTag: Tag, input: TagUpdateInputBody): Promise<Tag> {
    return getRepository(Tag).save(
      Object.assign(dbOriginalTag, {
        ...input,
        name: this.slugifyTagName(input.name),
      }),
    );
  }

  delete(item: Tag): Promise<Tag> {
    return getRepository(Tag).remove(item);
  }

  private slugifyTagName(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
    });
  }
}

export const tagService = new TagService();
