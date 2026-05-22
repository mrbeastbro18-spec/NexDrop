import { PrismaClient } from '@prisma/client';
import { initSentry } from './sentry';
import { ensureRequiredEnvForProduction } from './env';

initSentry();

// Ensure required production env vars are present before initializing Prisma
try {
  ensureRequiredEnvForProduction();
} catch (err) {
  if (process.env.NODE_ENV === 'production') throw err;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
