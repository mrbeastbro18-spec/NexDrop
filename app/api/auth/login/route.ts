import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import {
  matchesBootstrapAdminCredentials,
  isBootstrapAdminLoginEnabled,
  saveSession,
  signAccessToken,
  signRefreshToken
} from '@/lib/auth';
import { getBootstrapAdminEmail } from '@/lib/admin-bootstrap';
import { logServer, logServerError } from '@/lib/logger';
import * as bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validation';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

async function bootstrapAdminResponse(requestId: string) {
  const accessToken = await signAccessToken({ sub: 'env-admin', role: 'ADMIN' });
  const refreshToken = await signRefreshToken({ sub: 'env-admin' });

  const res = NextResponse.json(
    {
      ok: true,
      user: {
        id: 'env-admin',
        email: getBootstrapAdminEmail(),
        fullName: 'Bootstrap Admin',
        role: 'ADMIN',
        bootstrap: true
      }
    },
    { headers: { 'x-request-id': requestId } }
  );

  const csrfToken = randomBytes(24).toString('hex');
  res.cookies.set('nd_csrf', csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });

  res.cookies.set('nd_access', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 15 * 60
  });

  res.cookies.set('nd_refresh', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });

  return res;
}

export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(req.headers);

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      // Rate limit failed attempts (prevents account enumeration)
      await rateLimitAuth(clientIp);
      logServer('warn', 'auth.login.validation_failed', { requestId, clientIp });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    const { email, password } = validation.data;

    // Allow bootstrap admin login even when DB-backed auth is unavailable.
    if (isBootstrapAdminLoginEnabled() && matchesBootstrapAdminCredentials(email, password)) {
      logServer('warn', 'auth.login.bootstrap_admin_used', { requestId, email });
      return bootstrapAdminResponse(requestId);
    }

    // Rate limit login attempts by email (prevents brute force)
    const emailRateLimit = await rateLimitAuth(email);
    if (!emailRateLimit.success) {
      logServer('warn', 'auth.login.email_rate_limited', { requestId, email });
      return NextResponse.json(
        {
          error: 'Too many login attempts. Try again later.',
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

    // Also rate limit by IP (prevents distributed attacks)
    const ipRateLimit = await rateLimitAuth(clientIp);
    if (!ipRateLimit.success) {
      logServer('warn', 'auth.login.ip_rate_limited', { requestId, clientIp });
      return NextResponse.json(
        { error: 'Too many login attempts from this IP' },
        {
          status: 429,
          headers: {
            'Retry-After': String(ipRateLimit.retryAfter),
            'x-request-id': requestId
          }
        }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401, headers: { 'x-request-id': requestId } });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401, headers: { 'x-request-id': requestId } });
    }

    // Check if email is verified
    const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
    if (!user.isVerified && smtpConfigured) {
      return NextResponse.json(
        { error: 'Email not verified. Check your inbox for verification link.' },
        { status: 403, headers: { 'x-request-id': requestId } }
      );
    }

    if (!user.isVerified && !smtpConfigured) {
      await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, verificationToken: null } });
    }

    // Generate tokens
    const accessToken = await signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = await signRefreshToken({ sub: user.id });

    // Save session
    await saveSession(user.id, refreshToken, req.headers.get('user-agent') || undefined);

    // Log successful login (optional)
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventType: 'LOGIN',
          metadata: { ip: clientIp }
        }
      });
    } catch (error) {
      logServerError('auth.login.analytics_failed', error, { requestId, userId: user.id });
    }

    // Return authenticated response
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
    }, { headers: { 'x-request-id': requestId } });

    // Issue CSRF token cookie (double-submit cookie pattern)
    const csrfToken = randomBytes(24).toString('hex');
    res.cookies.set('nd_csrf', csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    res.cookies.set('nd_access', accessToken, {
      httpOnly: true,
      sameSite: 'strict', // Stricter CSRF protection
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 15 * 60 // 15 minutes
    });

    res.cookies.set('nd_refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    logServer('info', 'auth.login.success', { requestId, userId: user.id });
    return res;
  } catch (error) {
    logServerError('auth.login.failed', error, { requestId });
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}
