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
  const token = String(body?.token || '');
  const password = String(body?.password || '');

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() }
    }
  });

  if (!user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      resetToken: null,
      resetTokenExpiresAt: null
    }
  });

  return NextResponse.json({ ok: true });
}
