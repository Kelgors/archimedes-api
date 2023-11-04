import { z } from 'zod';

export const TAG_ID = z.string().uuid();
const TAG_NAME = z.string().max(32);

export const TagCreateInputBodySchema = z.object({
  name: TAG_NAME,
});

export const TagUpdateInputBodySchema = z.object({
  name: TAG_NAME,
});

export const TagOutputSchema = z.object({
  id: TAG_ID,
  name: TAG_NAME,
});

export type TagOutput = z.infer<typeof TagOutputSchema>;
export type TagCreateInputBody = z.infer<typeof TagCreateInputBodySchema>;
export type TagUpdateInputBody = z.infer<typeof TagUpdateInputBodySchema>;
