import { Role } from '@prisma/client';
import { env } from './env';

export const BOOTSTRAP_ADMIN_SUBJECT = 'env-admin';

export type BootstrapAdminProfile = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  storageUsed: bigint;
  storageLimit: bigint;
  isVerified: boolean;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function firstAdminEmailFromList() {
  const first = (env.ADMIN_EMAILS || '')
    .split(',')
    .map((entry) => entry.trim())
    .find(Boolean);

  return first ? normalizeEmail(first) : '';
}

export function getBootstrapAdminEmail() {
  const configured = env.ADMIN_BOOTSTRAP_EMAIL || process.env.SEED_ADMIN_EMAIL || firstAdminEmailFromList();
  return configured ? normalizeEmail(configured) : '';
}

export function isBootstrapAdminEnabled() {
  const email = getBootstrapAdminEmail();
  const password = env.ADMIN_BOOTSTRAP_PASSWORD || process.env.SEED_ADMIN_PASSWORD || '';
  return Boolean(email && password);
}

export function isBootstrapAdminCredentials(email: string, password: string) {
  const configuredEmail = getBootstrapAdminEmail();
  const configuredPassword = env.ADMIN_BOOTSTRAP_PASSWORD || process.env.SEED_ADMIN_PASSWORD || '';

  if (!configuredEmail || !configuredPassword) return false;

  return normalizeEmail(email) === configuredEmail && password === configuredPassword;
}

export function getBootstrapAdminProfile(): BootstrapAdminProfile | null {
  const email = getBootstrapAdminEmail();
  if (!email) return null;

  return {
    id: BOOTSTRAP_ADMIN_SUBJECT,
    email,
    fullName: 'Bootstrap Admin',
    role: 'ADMIN',
    storageUsed: 0n,
    storageLimit: 0n,
    isVerified: true
  };
}
