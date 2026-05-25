import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';
import { logServerError } from '@/lib/logger';

export const runtime = 'nodejs';

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function GET() {
  const requestId = randomUUID();

  const status = {
    database: 'down' as 'up' | 'down',
    redis: 'disabled' as 'up' | 'down' | 'disabled'
  };

  let ready = true;

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 1500, 'Database readiness check timed out');
    status.database = 'up';
  } catch (error) {
    ready = false;
    logServerError('health.ready.database_failed', error, { requestId });
  }

  const redis = getRedis();
  if (redis) {
    try {
      await withTimeout(redis.ping(), 1000, 'Redis readiness check timed out');
      status.redis = 'up';
    } catch (error) {
      status.redis = 'down';
      // Redis is optional, so keep the service ready but log it for diagnostics.
      logServerError('health.ready.redis_failed', error, { requestId });
    }
  }

  return NextResponse.json(
    {
      ok: ready,
      status,
      timestamp: new Date().toISOString()
    },
    {
      status: ready ? 200 : 503,
      headers: { 'x-request-id': requestId }
    }
  );
}
