import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { clearAuthCookies, hashToken, rotateTokens, saveSession, setAuthCookies, signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const refresh = req.cookies.get('nd_refresh')?.value;
  if (refresh) {
    await prisma.session.deleteMany({ where: { tokenHash: await hashToken(refresh) } });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('nd_access', '', { path: '/', maxAge: 0 });
  res.cookies.set('nd_refresh', '', { path: '/', maxAge: 0 });
  return res;
}
