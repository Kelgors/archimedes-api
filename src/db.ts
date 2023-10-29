import { DataSource, EntityTarget, LogLevel, ObjectLiteral, Repository } from 'typeorm';
import { DB_NAME, DB_SYNC } from './config';

let logging: LogLevel[] = ['warn', 'error'];
if (process.env.NODE_ENV === 'development') {
  logging = ['query', 'info', 'warn', 'error'];
} else if (process.env.NODE_ENV === 'test') {
  logging = [];
}

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: DB_NAME,
  synchronize: DB_SYNC,
  logging,
  entities: ['src/models/*.ts'],
  subscribers: [],
  migrations: [],
});

export function getRepository<T extends ObjectLiteral>(target: EntityTarget<T>): Repository<T> {
  return AppDataSource.getRepository(target);
}
