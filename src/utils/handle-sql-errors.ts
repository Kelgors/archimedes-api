import { CONSTRAINT } from 'sqlite3';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { HttpException } from './HttpException';

export function transformSqlError(error: unknown): HttpException | undefined {
  if (error instanceof EntityNotFoundError) {
    return new HttpException(404, 'Not found');
  }
  if (error instanceof QueryFailedError) {
    return transformSqliteError(error);
  }
}

function transformSqliteError(error: QueryFailedError) {
  switch (error.driverError['errno']) {
    case CONSTRAINT:
      return new HttpException(400, 'Bad request', { message: error.message });
    default:
      return new HttpException(500, 'Unhandled SQLite error', error);
  }
}