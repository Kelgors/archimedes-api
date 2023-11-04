import type { QueryFailedError } from 'typeorm';
import { AppError, AppErrorCode } from './ApplicationError';

const SQLITE_UNIQUE_CONSTRAINT = /UNIQUE constraint failed: (\w+)\.(\w+)/;
const PG_UNIQUE_CONSTRAINT = /^Key \((\w+)\)=\(([\w@\-.]+)\) already exists.$/;
const MYSQL_UNIQUE_CONSTRAINT_VALUE = /^Duplicate entry '([\w@\-.]+)'/;
const MYSQL_UNIQUE_CONSTRAINT_TABLE = /^INSERT INTO `(.+)`\(/;
export type AbsUniqueConstraint = {
  table: string;
  column: string | null;
  value: unknown;
};

export function throwParsedQueryFailedError(err: QueryFailedError) {
  const dbUniqueConstraintError = parseUniqueConstraint(err);
  if (dbUniqueConstraintError) {
    throw new AppError(
      AppErrorCode.ORM_UNIQUE_CONSTRAINT,
      dbUniqueConstraintError.value
        ? `${dbUniqueConstraintError.value} in ${dbUniqueConstraintError.table} already exists`
        : `${dbUniqueConstraintError.table}.${dbUniqueConstraintError.column} already exists`,
      { ...err, message: err.message },
    );
  }
  throw new AppError(AppErrorCode.UNSUPPORTED_ERROR, 'parseQueryFailedError cannot parse this sql error', err);
}

export function parseUniqueConstraint(err: QueryFailedError): AbsUniqueConstraint | undefined {
  // SQLITE
  if (SQLITE_UNIQUE_CONSTRAINT.test(err.message)) {
    const sqliteMatcher = SQLITE_UNIQUE_CONSTRAINT.exec(err.message);
    if (!sqliteMatcher) {
      throw new AppError(AppErrorCode.UNSUPPORTED_ERROR, '', {
        type: 'sqlite-missing-matcher-unique-constraint',
        message: err.message,
        err,
      });
    }
    return {
      table: sqliteMatcher[1],
      column: sqliteMatcher[2],
      value: undefined,
    };
  }
  // PG
  if (err.driverError?.code === '23505') {
    const pgMatcher = PG_UNIQUE_CONSTRAINT.exec(err.driverError.detail);
    if (!pgMatcher) {
      throw new AppError(AppErrorCode.UNSUPPORTED_ERROR, '', {
        type: 'pg-missing-matcher-unique-constraint',
        message: err.driverError?.detail,
        err,
      });
    }
    return {
      table: err.driverError?.table,
      column: pgMatcher[1],
      value: pgMatcher[2],
    };
  }
  // Mysql
  if (err.driverError?.code === 'ER_DUP_ENTRY') {
    const mysqlValueMatcher = MYSQL_UNIQUE_CONSTRAINT_VALUE.exec(err.driverError.sqlMessage);
    if (!mysqlValueMatcher) {
      throw new AppError(AppErrorCode.UNSUPPORTED_ERROR, '', {
        type: 'mysql-missing-matcher-unique-constraint',
        message: err.driverError?.sqlMessage,
        err,
      });
    }
    const mysqlTableMatcher = MYSQL_UNIQUE_CONSTRAINT_TABLE.exec(err.driverError.sql);
    if (!mysqlTableMatcher) {
      throw new AppError(AppErrorCode.UNSUPPORTED_ERROR, '', {
        type: 'mysql-missing-matcher-unique-constraint',
        message: err.driverError?.sql,
        err,
      });
    }
    return {
      table: mysqlTableMatcher[1],
      column: null,
      value: mysqlValueMatcher[1],
    };
  }
}
