import { z } from 'zod';
import { DB_RELATION_LIMIT } from '../config';
import { LIST_ID } from './List';

export const BOOKMARK_ID = z.string().uuid();
const BOOKMARK_TITLE = z.string().max(32);
const BOOKMARK_DESCRIPTION = z.string().nullable();
const BOOKMARK_URL = z.string();

export const BookmarkCreateInputBodySchema = z.object({
  title: BOOKMARK_TITLE,
  description: BOOKMARK_DESCRIPTION.optional(),
  url: BOOKMARK_URL,
  listIds: z.array(LIST_ID).min(1).max(DB_RELATION_LIMIT),
});

export const BookmarkUpdateInputBodySchema = BookmarkCreateInputBodySchema.partial();

export const BookmarkOutputSchema = z.object({
  id: BOOKMARK_ID,
  title: BOOKMARK_TITLE,
  description: BOOKMARK_DESCRIPTION,
  url: BOOKMARK_URL,
});
export const DeleteBookmarkOutputSchema = BookmarkOutputSchema.merge(z.object({ id: BOOKMARK_ID.optional() }));

export type BookmarkCreateInputBody = z.infer<typeof BookmarkCreateInputBodySchema>;
export type BookmarkUpdateInputBody = z.infer<typeof BookmarkUpdateInputBodySchema>;
export type BookmarkOutput = z.infer<typeof BookmarkOutputSchema>;
export type DeleteBookmarkOutput = z.infer<typeof DeleteBookmarkOutputSchema>;
