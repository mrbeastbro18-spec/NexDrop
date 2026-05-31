import Redis from 'ioredis';
import { env } from './env';

let client: Redis | null = null;

export function getRedis() {
  if (!env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy: () => null
    });

    // Prevent unhandled error events from taking down the process when Redis is
    // unavailable. Callers already treat Redis as optional and fail open.
    client.on('error', (error) => {
      console.error('[redis] connection error', error);
    });
  }
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) as T : null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300) {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}
