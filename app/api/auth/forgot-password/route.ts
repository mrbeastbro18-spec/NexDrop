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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  const resetToken = crypto.randomUUID();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });

  await sendEmail({
    to: email,
    subject: 'Reset your NexDrop password',
    html: `<p><a href="${env.APP_URL}/reset-password?token=${resetToken}">Reset password</a></p>`
  });

  return NextResponse.json({ ok: true });
}
