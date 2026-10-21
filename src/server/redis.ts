// Also used by the sync worker (plain Node), so no `server-only` marker here.
import Redis from 'ioredis';

const g = globalThis as unknown as { __redis?: Redis };

export function redis(): Redis {
  g.__redis ??= new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: 2, lazyConnect: false });
  return g.__redis;
}
