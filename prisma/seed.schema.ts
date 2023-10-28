import { z } from 'zod';
import { LinkParser } from '../src/schemas/Link';
import { ListParser } from '../src/schemas/List';
import { TagParser } from '../src/schemas/Tag';
import { UserParser } from '../src/schemas/User';

export const SeedFileParser = z.object({
  users: z.array(
    UserParser.merge(
      z.object({
        encryptedPassword: z.string(),
      }),
    ),
  ),
  tags: z.array(TagParser),
  lists: z.array(ListParser),
  links: z.array(LinkParser),
});

export type SeedFile = z.infer<typeof SeedFileParser>;
