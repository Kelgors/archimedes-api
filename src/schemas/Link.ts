import { z } from 'zod';
import { LIST_ID } from './List';
import { USER_ID } from './User';

const LINK_ID = z.string().uuid();
const LINK_TITLE = z.string().max(32);
const LINK_DESCRIPTION = z.string().optional();
const LINK_URL = z.string();
const OWNER_ID = USER_ID;

export const LinkCreateInputParser = z.object({
  title: LINK_TITLE,
  description: LINK_DESCRIPTION,
  url: LINK_URL,
  ownerId: OWNER_ID,
  listId: LIST_ID,
});

export const LinkUpdateInputParser = LinkCreateInputParser.partial();

export const LinkParser = z.object({
  id: LINK_ID,
  title: LINK_TITLE,
  description: LINK_DESCRIPTION,
  url: LINK_URL,
  ownerId: OWNER_ID,
  listId: LIST_ID,
});

export type Link = z.infer<typeof LinkParser>;
