import { z } from 'zod';
import { BOOKMARK_ID } from './Bookmark';
import { LIST_ID } from './List';

export const BookmarkOnListSchema = z.object({
  bookmarkId: BOOKMARK_ID,
  listId: LIST_ID,
});

export type BookmarkOnList = z.infer<typeof BookmarkOnListSchema>;
