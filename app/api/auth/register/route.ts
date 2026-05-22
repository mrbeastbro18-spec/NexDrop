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
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const email = String(body.email).toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

  const passwordHash = await bcrypt.hash(String(body.password), 12);
  const verificationToken = crypto.randomUUID();

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: body.fullName ? String(body.fullName) : null,
      verificationToken
    }
  });

  await sendEmail({
    to: email,
    subject: 'Verify your NexDrop account',
    html: `<p>Verify your account:</p><p><a href="${env.APP_URL}/api/auth/verify?token=${verificationToken}">Verify email</a></p>`
  });

  return NextResponse.json({ ok: true });
}
