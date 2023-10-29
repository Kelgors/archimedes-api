import { Token } from './schemas/Auth';

declare global {
  namespace Express {
    export interface Request {
      token: Token;
    }
  }
}
