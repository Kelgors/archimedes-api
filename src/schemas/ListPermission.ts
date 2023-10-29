import { z } from 'zod';
import { LIST_ID } from './List';
import { USER_ID } from './User';

export const ListPermissionSchema = z.object({
  listId: LIST_ID,
  userId: USER_ID,
  isWritable: z.boolean().optional(),
});

export type ListPermission = z.infer<typeof ListPermissionSchema>;
