import { z } from 'zod';
import { BOOKMARK_ID } from './Bookmark';
import { TAG_ID } from './Tag';

export const TagOnBookmarkSchema = z.object({
  tagId: TAG_ID,
  bookmarkId: BOOKMARK_ID,
});

export type TagOnBookmark = z.infer<typeof TagOnBookmarkSchema>;
