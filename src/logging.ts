import type { PinoLoggerOptions } from 'fastify/types/logger';
import { LOG_PATH, LOG_TARGET } from './config';

const PINO_TARGETS: Record<string, PinoLoggerOptions['transport']> = {
  pretty: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
  file: {
    target: 'pino/file',
    options: { destination: './app.log' },
  },
};
let pinoConfig: boolean | PinoLoggerOptions = true;
pinoConfig = { transport: PINO_TARGETS[LOG_TARGET] };
if (LOG_TARGET === 'file' && LOG_PATH && PINO_TARGETS.file?.options) {
  PINO_TARGETS.file.options.destination = LOG_PATH;
}

export default pinoConfig;
