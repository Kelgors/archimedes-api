import { getRepository } from '../db';
import type { List } from '../models/List';
import { ListPermission } from '../models/ListPermission';
import type { User } from '../models/User';
import type { AccessToken } from '../schemas/Auth';

class ListPermissionService {
  async hasWritePermission(list: List, userId: AccessToken['sub'] | User['id']): Promise<boolean> {
    if (list.ownerId === userId) return true;
    return getRepository(ListPermission).exist({
      where: { userId, listId: list.id, isWritable: true },
    });
  }
}

export const listPermissionService = new ListPermissionService();
