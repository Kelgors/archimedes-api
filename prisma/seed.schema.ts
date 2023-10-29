import { z } from 'zod';
import { BookmarkSchema } from '../src/schemas/Bookmark';
import { BookmarkOnListSchema } from '../src/schemas/BookmarkOnList';
import { ListSchema } from '../src/schemas/List';
import { ListPermissionSchema } from '../src/schemas/ListPermission';
import { TagSchema } from '../src/schemas/Tag';
import { TagOnBookmarkSchema } from '../src/schemas/TagOnBookmark';
import { UserSchema } from '../src/schemas/User';

export const SeedFileSchema = z
  .object({
    users: z.array(UserSchema),
    lists: z.array(ListSchema),
    permissions: z.array(ListPermissionSchema),
    tags: z.array(TagSchema),
    bookmarks: z.array(BookmarkSchema),
    bookmarkOnLists: z.array(BookmarkOnListSchema),
    tagOnBookmarks: z.array(TagOnBookmarkSchema),
  })
  .strict();

export type SeedFile = z.infer<typeof SeedFileSchema>;
