import { z } from 'zod';
import { LinkSchema } from '../src/schemas/Link';
import { ListSchema } from '../src/schemas/List';
import { TagSchema } from '../src/schemas/Tag';
import { UserSchema } from '../src/schemas/User';

export const SeedFileParser = z.object({
  users: z.array(
    UserSchema.merge(
      z.object({
        encryptedPassword: z.string(),
      }),
    ),
  ),
  tags: z.array(TagSchema),
  lists: z.array(ListSchema),
  links: z.array(LinkSchema),
});

export type SeedFile = z.infer<typeof SeedFileParser>;
