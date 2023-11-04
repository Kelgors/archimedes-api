import type { EntityTarget, LogLevel, ObjectLiteral, Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import type { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import type { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_SYNC, DB_TYPE, DB_USER } from './config';
import { AuthRefreshToken } from './models/AuthRefreshToken';
import { Bookmark } from './models/Bookmark';
import { List } from './models/List';
import { ListPermission } from './models/ListPermission';
import { Tag } from './models/Tag';
import { User } from './models/User';

let logging: LogLevel[] = ['warn', 'error'];
if (process.env.NODE_ENV === 'development') {
  logging = ['query', 'info', 'warn', 'error'];
} else if (process.env.NODE_ENV === 'test') {
  logging = [];
}

function buildMysqlConfig(): MysqlConnectionOptions {
  return {
    type: 'mysql',
    host: DB_HOST,
    port: DB_PORT || 3306,
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    synchronize: DB_SYNC,
  };
}

function buildPgConfig(): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT || 5432,
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    synchronize: DB_SYNC,
  };
}

function buildSqliteConfig(): SqliteConnectionOptions {
  return {
    type: 'sqlite',
    database: DB_NAME,
    synchronize: DB_SYNC,
  };
}

function buildConfig() {
  switch (DB_TYPE) {
    case 'sqlite':
      return buildSqliteConfig();
    case 'postgres':
      return buildPgConfig();
    case 'mariadb':
    case 'mysql':
      return buildMysqlConfig();
    default:
      throw new Error('Unknown DB_TYPE');
  }
}
export const appDataSource = new DataSource({
  ...buildConfig(),
  logging,
  entities: [User, List, ListPermission, Tag, Bookmark, AuthRefreshToken],
  subscribers: [],
  migrations: [],
});

export function getRepository<T extends ObjectLiteral>(target: EntityTarget<T>): Repository<T> {
  return appDataSource.getRepository(target);
}
