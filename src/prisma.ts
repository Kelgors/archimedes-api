import { Prisma, PrismaClient } from '@prisma/client';

let log: (Prisma.LogLevel | Prisma.LogDefinition)[] = ['warn', 'error'];
if (process.env.NODE_ENV === 'development') {
  log = ['query', 'info', 'warn', 'error'];
} else if (process.env.NODE_ENV === 'test') {
  log = [];
}

export const prisma = new PrismaClient({
  log,
});
