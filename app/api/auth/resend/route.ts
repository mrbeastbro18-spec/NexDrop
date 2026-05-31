import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { queueEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';
import { logServer, logServerError } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body?.email || '').toLowerCase().trim();
  const requestId = randomUUID();

  try {
    const clientIp = getClientIp(req.headers);
    const rl = await rateLimitAuth(`resend:${clientIp}:${email}`);
    if (!rl.success) {
      logServer('warn', 'auth.resend.rate_limited', { requestId, clientIp, email });
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429, headers: { 'x-request-id': requestId } });
    }

    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400, headers: { 'x-request-id': requestId } });

    // Always return 200 to avoid user enumeration, but only send email if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logServer('info', 'auth.resend.unknown_email', { requestId, email });
      return NextResponse.json({ ok: true, message: 'If an account exists we have queued a verification email.' }, { headers: { 'x-request-id': requestId } });
    }

    if (user.isVerified) {
      return NextResponse.json({ ok: true, message: 'Account already verified. You can sign in.' }, { headers: { 'x-request-id': requestId } });
    }

    // Generate new verification token
    const verificationToken = randomUUID();
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken } });

    // Queue verification email
    try {
      const origin = env.APP_URL || new URL(req.url).origin;
      const verifyUrl = `${origin}/api/auth/verify?token=${verificationToken}`;
      await queueEmail('verify-email', user.email, 'Verify your NexDrop account', { name: user.fullName || user.email, verifyUrl });
    } catch (err) {
      console.error('Queue verify email failed:', err);
    }

    logServer('info', 'auth.resend.queued', { requestId, userId: user.id });
    return NextResponse.json({ ok: true, message: 'Verification email queued. Check your inbox.' }, { headers: { 'x-request-id': requestId } });
  } catch (err) {
    logServerError('auth.resend.failed', err, { requestId });
    return NextResponse.json({ error: 'Failed to queue verification email' }, { status: 500, headers: { 'x-request-id': requestId } });
  }
}
