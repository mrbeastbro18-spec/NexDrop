import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { clearAuthCookies, hashToken, rotateTokens, saveSession, setAuthCookies, signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').toLowerCase();
  const password = String(body?.password || '');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  if (!user.isVerified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await signRefreshToken({ sub: user.id });
  await saveSession(user.id, refreshToken, req.headers.get('user-agent') || undefined);

  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  res.cookies.set('nd_access', accessToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 15 * 60 });
  res.cookies.set('nd_refresh', refreshToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 });
  return res;
}
