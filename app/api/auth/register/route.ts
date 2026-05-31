import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { queueEmail } from '@/lib/email';
import { env } from '@/lib/env';
import * as bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validation';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';
import { logServer, logServerError } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(req.headers);

    // Rate limit registration attempts by IP
    const rateLimit = await rateLimitAuth(`register:${clientIp}`);
    if (!rateLimit.success) {
      logServer('warn', 'auth.register.rate_limited', { requestId, clientIp });
      return NextResponse.json(
        {
          error: 'Too many registration attempts. Try again later.',
          retryAfter: rateLimit.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
            'x-request-id': requestId
          }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json({ error: errorMessage }, { status: 400, headers: { 'x-request-id': requestId } });
    }

    const { email, password, fullName } = validation.data;
    const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

    const emailRateLimit = await rateLimitAuth(`register:${email}`);
    if (!emailRateLimit.success) {
      logServer('warn', 'auth.register.email_rate_limited', { requestId, email });
      return NextResponse.json(
        {
          error: 'Too many registration attempts for this email. Try again later.',
          retryAfter: emailRateLimit.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(emailRateLimit.retryAfter),
            'x-request-id': requestId
          }
        }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409, headers: { 'x-request-id': requestId } }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = randomUUID();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        verificationToken: smtpConfigured ? verificationToken : null,
        isVerified: !smtpConfigured,
        storageLimit: 10 * 1024 * 1024 * 1024 // 10 GB default
      }
    });

    // Queue verification email when SMTP is configured.
    if (smtpConfigured) {
      try {
        // Prefer configured APP_URL from environment for links, fall back to request origin
        const origin = env.APP_URL || new URL(req.url).origin;
        const verifyUrl = `${origin}/api/auth/verify?token=${verificationToken}`;
        await queueEmail('verify-email', email, 'Verify your NexDrop account', { name: email, verifyUrl });
      } catch (emailError) {
        console.error('Queue verify email failed:', emailError);
      }
    }

    // Log signup event
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventType: 'SIGNUP',
          metadata: { ip: clientIp }
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }

    logServer('info', 'auth.register.success', { requestId, userId: user.id });

    return NextResponse.json(
      {
        ok: true,
        message: smtpConfigured
          ? 'Account created. Check your email to verify your account.'
          : 'Account created and ready to use. SMTP is not configured, so email verification was skipped.'
      },
      { headers: { 'x-request-id': requestId } }
    );
  } catch (error) {
    logServerError('auth.register.failed', error, { requestId });
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}
