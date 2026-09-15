import Redis from 'ioredis';
import pino from 'pino';
import { env } from './env.js';

const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

const createRedisClient = (): Redis => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,       // fail fast on individual commands
    enableReadyCheck: true,        // wait until Redis confirms READY before accepting commands
    lazyConnect: true,             // don't connect until first command is issued
    retryStrategy: (times: number) => {
      if (times > 5) {
        logger.error('Redis: max reconnection attempts reached, giving up');
        return null; // stop retrying
      }
      const delay = Math.min(times * 200, 2000); // exponential backoff, cap at 2s
      logger.warn(`Redis: retrying connection in ${delay}ms (attempt ${times})`);
      return delay;
    },
  });

  client.on('connect', () => logger.info('Redis: connected'));
  client.on('ready', () => logger.info('Redis: ready to accept commands'));
  client.on('error', (err: Error) => logger.error({ err }, 'Redis: client error'));
  client.on('close', () => logger.warn('Redis: connection closed'));
  client.on('reconnecting', () => logger.warn('Redis: reconnecting...'));

  return client;
};

// Singleton instance shared across the application
export const redisClient = createRedisClient();
