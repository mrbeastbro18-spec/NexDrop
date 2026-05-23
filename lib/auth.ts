import { jwtVerify, SignJWT } from 'jose';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import utils from './utils.js';
import { env } from './env';
import { prisma } from './prisma';
import { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const accessName = 'nd_access';
const refreshName = 'nd_refresh';

function secret(value: string) {
  return new TextEncoder().encode(value);
}

export async function signAccessToken(payload: { sub: string; role: Role }) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_TTL)
    .sign(secret(env.JWT_ACCESS_SECRET));
}

export async function signRefreshToken(payload: { sub: string }) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setJti(randomUUID())
    .setExpirationTime(env.REFRESH_TOKEN_TTL)
    .sign(secret(env.JWT_REFRESH_SECRET));
  return token;
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret(env.JWT_ACCESS_SECRET));
  return payload as { sub: string; role: Role; exp: number; iat: number };
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, secret(env.JWT_REFRESH_SECRET));
  return payload as { sub: string; jti: string; exp: number; iat: number };
}

export async function hashToken(token: string) {
  return utils.sha256(token);
}

export function authCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds
  };
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(accessName, accessToken, authCookieOptions(15 * 60));
  store.set(refreshName, refreshToken, authCookieOptions(7 * 24 * 60 * 60));
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.set(accessName, '', { ...authCookieOptions(0), maxAge: 0 });
  store.set(refreshName, '', { ...authCookieOptions(0), maxAge: 0 });
}

export async function currentUser() {
  const store = await cookies();
  const token = store.get(accessName)?.value;
  if (!token) return null;
  try {
    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return user;
}

export async function saveSession(userId: string, refreshToken: string, deviceInfo?: string) {
  await prisma.session.create({
    data: {
      userId,
      tokenHash: await hashToken(refreshToken),
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
}

export async function revokeSession(refreshToken: string) {
  const tokenHash = await hashToken(refreshToken);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function rotateTokens(refreshToken: string, deviceInfo?: string) {
  const payload = await verifyRefreshToken(refreshToken);
  const tokenHash = await hashToken(refreshToken);
  const session = await prisma.session.findUnique({ where: { tokenHash } });
  if (!session) throw new Error('INVALID_SESSION');

  await prisma.session.delete({ where: { tokenHash } });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new Error('INVALID_USER');

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  const newRefreshToken = await signRefreshToken({ sub: user.id });
  await saveSession(user.id, newRefreshToken, deviceInfo);
  return { accessToken, refreshToken: newRefreshToken };
}

export async function registerUser(input: { email: string; password: string; fullName?: string }) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new Error('EMAIL_EXISTS');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verificationToken = randomUUID();

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      fullName: input.fullName,
      verificationToken
    }
  });

  return { user, verificationToken };
}
