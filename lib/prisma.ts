import { PrismaClient } from '@prisma/client';
import { initSentry } from './sentry';
import { ensureRequiredEnvForProduction } from './env';

initSentry();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Lazy-initialized Prisma client.
 * This prevents Prisma from being instantiated during Next.js build time
 * (which would fail in Alpine serverless environments with missing libssl).
 * Prisma is only initialized when actually needed at runtime.
 */
const initPrisma = (): PrismaClient => {
  // Return cached instance if available
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Ensure required production env vars before initializing
  try {
    ensureRequiredEnvForProduction();
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
  }

  // Create new Prisma client
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

  // Cache in global for development (avoid connection pool exhaustion)
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
};

// Use a getter to delay Prisma initialization until first access
let _prismaInstance: PrismaClient;

export const getPrisma = (): PrismaClient => {
  _prismaInstance ??= initPrisma();
  return _prismaInstance;
};

/**
 * Backward-compatible export: accessing prisma will lazily initialize the client
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target: any, prop: PropertyKey) {
    if (prop === Symbol.toStringTag) return 'PrismaClient';
    return (getPrisma() as any)[prop];
  }
});
