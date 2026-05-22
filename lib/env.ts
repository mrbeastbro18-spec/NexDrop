import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional().default(''),
  REDIS_URL: z.string().optional().default(''),
  JWT_ACCESS_SECRET: z.string().optional().default('dev-secret-xxxxxxxxxxxxxxxxxxxxxxxx'),
  JWT_REFRESH_SECRET: z.string().optional().default('dev-secret-xxxxxxxxxxxxxxxxxxxxxxxx'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(465),
  SMTP_SECURE: z.coerce.boolean().optional().default(true),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('NexDrop <noreply@example.com>'),
  STORAGE_PATH: z.string().default('./storage'),
  TEMP_UPLOAD_PATH: z.string().default('./storage/tmp'),
  MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024 * 1024),
  CHUNK_SIZE: z.coerce.number().default(5 * 1024 * 1024),
  S3_ENABLED: z.coerce.boolean().optional().default(false),
  S3_BUCKET: z.string().optional().default(''),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional().default(''),
  S3_SECRET_KEY: z.string().optional().default(''),
  S3_ENDPOINT: z.string().optional().default(''),
  SENTRY_DSN: z.string().optional().default(''),
  SENTRY_ENVIRONMENT: z.string().optional().default('development'),
  EMAIL_QUEUE_ENABLED: z.coerce.boolean().optional().default(false),
  EMAIL_QUEUE_RETRIES: z.coerce.number().optional().default(3),
  ADMIN_EMAILS: z.string().optional().default(''),
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional().default('')
});

export const env = envSchema.parse(process.env);

export function ensureRequiredEnvForProduction() {
  // Only enforce when running in a real production runtime. Builds and static
  // generation set NODE_ENV=production; we avoid failing during build by
  // requiring an explicit runtime flag `NEXDROP_RUNTIME=1` to enable checks.
  if (env.NODE_ENV === 'production' && process.env.NEXDROP_RUNTIME === '1') {
    const missing: string[] = [];
    if (!env.DATABASE_URL) missing.push('DATABASE_URL');
    if (!env.JWT_ACCESS_SECRET || env.JWT_ACCESS_SECRET.startsWith('dev-secret')) missing.push('JWT_ACCESS_SECRET');
    if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET.startsWith('dev-secret')) missing.push('JWT_REFRESH_SECRET');
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
    }
  }
}
