import { z } from 'zod';
import { USER_ID } from './User';

export const LIST_ID = z.string().uuid();
const LIST_NAME = z.string().max(32);
const LIST_DESCRIPTION = z.string().optional();
const LIST_PUBLIC = z.boolean().optional();

export const ListCreateInputSchema = z.object({
  name: LIST_NAME,
  description: LIST_DESCRIPTION,
});

export const ListUpdateInputSchema = ListCreateInputSchema.optional();

export const ListSchema = z.object({
  id: LIST_ID,
  name: LIST_NAME,
  description: LIST_DESCRIPTION,
  isPublic: LIST_PUBLIC,
  ownerId: USER_ID,
});

export type List = z.infer<typeof ListSchema>;
