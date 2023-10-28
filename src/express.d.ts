import { User } from '@prisma/client';

export type AppContext = {
  user: User | null;
};

declare global {
  namespace Express {
    export interface Request {
      context: AppContext;
    }
  }
}
