import { z } from 'zod';
import { LIST_ID } from './List';

export const BOOKMARK_ID = z.string().uuid();
const BOOKMARK_TITLE = z.string().max(32);
const BOOKMARK_DESCRIPTION = z.string().optional();
const BOOKMARK_URL = z.string();

export const BookmarkCreateInputSchema = z.object({
  title: BOOKMARK_TITLE,
  description: BOOKMARK_DESCRIPTION,
  url: BOOKMARK_URL,
  listIds: z.array(LIST_ID),
});

export const BookmarkUpdateInputSchema = BookmarkCreateInputSchema.partial();

export const BookmarkSchema = z.object({
  id: BOOKMARK_ID,
  title: BOOKMARK_TITLE,
  description: BOOKMARK_DESCRIPTION,
  url: BOOKMARK_URL,
});

export type Bookmark = z.infer<typeof BookmarkSchema>;
