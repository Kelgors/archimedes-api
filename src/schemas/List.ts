import { z } from 'zod';
import { USER_ID } from './User';

export const LIST_ID = z.string().uuid();
const LIST_NAME = z.string().max(32);
const LIST_DESCRIPTION = z.string().optional();

export const ListCreateInputSchema = z.object({
  name: LIST_NAME,
});

export const ListUpdateInputSchema = z.object({
  name: LIST_NAME,
});

export const ListSchema = z.object({
  id: LIST_ID,
  name: LIST_NAME,
  description: LIST_DESCRIPTION,
  ownerId: USER_ID,
});

export type List = z.infer<typeof ListSchema>;
