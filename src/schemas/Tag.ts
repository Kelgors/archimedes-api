import { z } from 'zod';

export const TAG_ID = z.string().uuid();
const TAG_NAME = z.string().max(32);

export const TagCreateInputSchema = z.object({
  name: TAG_NAME,
});

export const TagUpdateInputSchema = z.object({
  name: TAG_NAME,
});

export const ApiTagSchema = z.object({
  id: TAG_ID,
  name: TAG_NAME,
});

export type Tag = z.infer<typeof ApiTagSchema>;
export type TagCreateInput = z.infer<typeof TagCreateInputSchema>;
export type TagUpdateInput = z.infer<typeof TagUpdateInputSchema>;
