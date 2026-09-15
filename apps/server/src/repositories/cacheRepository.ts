import pino from 'pino';
import { redisClient } from '../config/redis.js';

const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

/**
 * Look-aside cache repository.
 *
 * Pattern:
 *   1. get()  — check cache first; return hit or null on miss
 *   2. set()  — write serialized value with a TTL after a DB read
 *   3. invalidate()        — delete a single key on mutation
 *   4. invalidatePattern() — delete all keys matching a glob pattern
 *                            (e.g. flush all project variants on any project write)
 */
export const cacheRepository = {
  /**
   * Retrieve a cached value by key.
   * Returns the parsed object on hit, or null on miss / error.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redisClient.get(key);
      if (!raw) return null;

      logger.debug({ key }, 'Cache HIT');
      return JSON.parse(raw) as T;
    } catch (err) {
      // Never let a cache failure break the request — log and fall through
      logger.error({ err, key }, 'Cache GET error');
      return null;
    }
  },

  /**
   * Store a value in the cache.
   * @param key   - Redis key
   * @param value - Any serialisable value
   * @param ttlSeconds - Expiry in seconds (default: 60)
   */
  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      logger.debug({ key, ttlSeconds }, 'Cache SET');
    } catch (err) {
      logger.error({ err, key }, 'Cache SET error');
    }
  },

  /**
   * Remove a single key from the cache (call after any mutation on that resource).
   */
  async invalidate(key: string): Promise<void> {
    try {
      await redisClient.del(key);
      logger.debug({ key }, 'Cache INVALIDATED');
    } catch (err) {
      logger.error({ err, key }, 'Cache INVALIDATE error');
    }
  },

  /**
   * Remove all keys matching a glob pattern.
   * Uses SCAN to avoid blocking the Redis event loop on large keyspaces.
   * Example: invalidatePattern('projects:*') flushes all project cache variants.
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      let totalDeleted = 0;

      do {
        const [nextCursor, keys] = await redisClient.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        cursor = nextCursor;

        if (keys.length > 0) {
          await redisClient.del(...keys);
          totalDeleted += keys.length;
        }
      } while (cursor !== '0');

      logger.debug({ pattern, totalDeleted }, 'Cache INVALIDATE pattern');
    } catch (err) {
      logger.error({ err, pattern }, 'Cache INVALIDATE pattern error');
    }
  },
};
