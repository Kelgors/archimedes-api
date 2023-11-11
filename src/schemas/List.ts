import { z } from 'zod';

import { Visibility } from '../models/ListVisibility';
import { USER_ID } from './User';

const VISIBILITY = z.nativeEnum(Visibility);

export const LIST_ID = z.string().uuid();
const LIST_NAME = z.string().min(1).max(32);
const LIST_DESCRIPTION = z.string().nullable();
const LIST_VISIBILITY = z.object({
  anonymous: VISIBILITY,
  instance: VISIBILITY,
});

export const ListCreateInputBodySchema = z.object({
  name: LIST_NAME,
  description: LIST_DESCRIPTION.optional(),
  visibility: LIST_VISIBILITY.partial().optional(),
  ownerId: USER_ID.optional(),
});

export const ListUpdateInputBodySchema = ListCreateInputBodySchema.optional();

export const ListOutputSchema = z.object({
  id: LIST_ID,
  name: LIST_NAME,
  description: LIST_DESCRIPTION,
  visibility: LIST_VISIBILITY,
  ownerId: USER_ID,
});
export const DeleteListOutputSchema = ListOutputSchema.merge(z.object({ id: LIST_ID.optional() }));

export type ListCreateInputBody = z.infer<typeof ListCreateInputBodySchema>;
export type ListUpdateInputBody = z.infer<typeof ListUpdateInputBodySchema>;
export type ListOutput = z.infer<typeof ListOutputSchema>;
export type DeleteListOutput = z.infer<typeof DeleteListOutputSchema>;
