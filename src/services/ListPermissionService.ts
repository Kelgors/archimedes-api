import { getRepository } from '../db';
import type { List } from '../models/List';
import { ListPermission } from '../models/ListPermission';
import type { User } from '../models/User';
import type { AccessToken } from '../schemas/Auth';

class ListPermissionService {
  hasReadPermission(listId: List['id'], userId: AccessToken['sub'] | User['id']): Promise<boolean> {
    return getRepository(ListPermission).exist({
      where: { userId, listId, isWritable: false },
    });
  }

  hasWritePermission(listId: List['id'], userId: AccessToken['sub'] | User['id']): Promise<boolean> {
    return getRepository(ListPermission).exist({
      where: { userId, listId, isWritable: true },
    });
  }
}

export const listPermissionService = new ListPermissionService();
