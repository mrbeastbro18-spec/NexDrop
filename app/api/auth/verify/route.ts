import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { clearAuthCookies, hashToken, rotateTokens, saveSession, setAuthCookies, signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null }
  });
  // Redirect to the configured APP_URL (if present) after verification
  const origin = env.APP_URL || new URL(req.url).origin;
  return NextResponse.redirect(new URL('/login?verified=1', origin));
}
