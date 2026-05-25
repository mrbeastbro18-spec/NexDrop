import { z } from 'zod';

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return undefined;
};

const normalizeNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const stringValue = normalizeString(value);
  if (!stringValue) return undefined;
  const parsed = Number(stringValue);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeUrl = (value: unknown): string | undefined => {
  const urlString = normalizeString(value);
  if (!urlString) return undefined;
  const trimmed = urlString.trim();

  // Allow hostnames without protocol and normalize them to HTTPS.
  if (/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+(?:\:\d+)?(?:\/.*)?$/.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

const appUrlSchema = z.preprocess(normalizeUrl, z.string().url()).default('http://localhost:3000').transform((value) => {
  const url = new URL(value);
  if (url.pathname.endsWith('/')) url.pathname = url.pathname.slice(0, -1);
  return url.toString().replace(/\/$/, '');
});

const envSchema = z.object({
  NODE_ENV: z.preprocess(normalizeString, z.enum(['development', 'test', 'production'])).default('development'),
  APP_URL: appUrlSchema,
  DATABASE_URL: z.preprocess(normalizeString, z.string().min(1)).optional(),
  REDIS_URL: z.preprocess(normalizeString, z.string().optional()).default(''),
  JWT_ACCESS_SECRET: z.preprocess(normalizeString, z.string().min(32)).default('dev-secret-xxxxxxxxxxxxxxxxxxxxxxxx'),
  JWT_REFRESH_SECRET: z.preprocess(normalizeString, z.string().min(32)).default('dev-secret-xxxxxxxxxxxxxxxxxxxxxxxx'),
  ACCESS_TOKEN_TTL: z.preprocess(normalizeString, z.string()).default('15m'),
  REFRESH_TOKEN_TTL: z.preprocess(normalizeString, z.string()).default('7d'),
  SMTP_HOST: z.preprocess(normalizeString, z.string().optional()).default(''),
  SMTP_PORT: z.preprocess(normalizeNumber, z.number().int().positive()).default(465),
  SMTP_SECURE: z.preprocess(normalizeBoolean, z.boolean()).default(true),
  SMTP_USER: z.preprocess(normalizeString, z.string().optional()).default(''),
  SMTP_PASS: z.preprocess(normalizeString, z.string().optional()).default(''),
  EMAIL_FROM: z.preprocess(normalizeString, z.string()).default('NexDrop <noreply@example.com>'),
  STORAGE_PATH: z.preprocess(normalizeString, z.string()).default('./storage'),
  TEMP_UPLOAD_PATH: z.preprocess(normalizeString, z.string()).default('./storage/tmp'),
  MAX_FILE_SIZE: z.preprocess(normalizeNumber, z.number().int().positive()).default(10 * 1024 * 1024 * 1024),
  CHUNK_SIZE: z.preprocess(normalizeNumber, z.number().int().positive()).default(5 * 1024 * 1024),
  S3_ENABLED: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  S3_BUCKET: z.preprocess(normalizeString, z.string().optional()).default(''),
  S3_REGION: z.preprocess(normalizeString, z.string()).default('us-east-1'),
  S3_ACCESS_KEY: z.preprocess(normalizeString, z.string().optional()).default(''),
  S3_SECRET_KEY: z.preprocess(normalizeString, z.string().optional()).default(''),
  S3_ENDPOINT: z.preprocess(normalizeString, z.string().optional()).default(''),
  SENTRY_DSN: z.preprocess(normalizeString, z.string().optional()).default(''),
  SENTRY_ENVIRONMENT: z.preprocess(normalizeString, z.string()).default('development'),
  EMAIL_QUEUE_ENABLED: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  EMAIL_QUEUE_RETRIES: z.preprocess(normalizeNumber, z.number().int().nonnegative()).default(3),
  ADMIN_EMAILS: z.preprocess(normalizeString, z.string().optional()).default(''),
  ADMIN_BOOTSTRAP_EMAIL: z.preprocess(normalizeString, z.string().optional()).default(''),
  ADMIN_BOOTSTRAP_PASSWORD: z.preprocess(normalizeString, z.string().optional()).default(''),
  ENABLE_DEBUG_LOGS: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  NEXT_PUBLIC_ENABLE_DEBUG_LOGS: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  NEXT_PUBLIC_ADSENSE_CLIENT: z.preprocess(normalizeString, z.string().optional()).default('')
});

// Parse environment variables, but skip strict validation during build
// Only validate at runtime when NEXDROP_RUNTIME=1 (set by serverless platform)
export const env = envSchema.parse(process.env);

export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isDev = env.NODE_ENV === 'development';

export function ensureRequiredEnvForProduction() {
  if (env.NODE_ENV === 'production' && process.env.NEXDROP_RUNTIME === '1') {
    const missing: string[] = [];
    if (!env.DATABASE_URL) missing.push('DATABASE_URL');
    if (!env.JWT_ACCESS_SECRET || env.JWT_ACCESS_SECRET.startsWith('dev-secret')) missing.push('JWT_ACCESS_SECRET');
    if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET.startsWith('dev-secret')) missing.push('JWT_REFRESH_SECRET');
    if (missing.length > 0) {
      throw new Error(`Missing or invalid required production environment variables: ${missing.join(', ')}`);
    }
  }
}
