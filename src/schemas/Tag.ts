import { z } from 'zod';
import { USER_ID } from './User';

const TAG_ID = z.string().uuid();
const TAG_NAME = z.string().max(32);

export const TagCreateInputSchema = z.object({
  name: TAG_NAME,
});

export const TagUpdateInputSchema = z.object({
  name: TAG_NAME,
});

export const TagSchema = z.object({
  id: TAG_ID,
  name: TAG_NAME,
  ownerId: USER_ID,
});

export type Tag = z.infer<typeof TagSchema>;
