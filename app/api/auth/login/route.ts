import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { clearAuthCookies, hashToken, rotateTokens, saveSession, setAuthCookies, signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { loginSchema } from '@/lib/validation';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(req.headers);

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      // Rate limit failed attempts (prevents account enumeration)
      await rateLimitAuth(clientIp);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Rate limit login attempts by email (prevents brute force)
    const emailRateLimit = await rateLimitAuth(email);
    if (!emailRateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Try again later.',
          retryAfter: emailRateLimit.retryAfter
        },
        { status: 429, headers: { 'Retry-After': String(emailRateLimit.retryAfter) } }
      );
    }

    // Also rate limit by IP (prevents distributed attacks)
    const ipRateLimit = await rateLimitAuth(clientIp);
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts from this IP' },
        { status: 429, headers: { 'Retry-After': String(ipRateLimit.retryAfter) } }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether email exists (same error for non-existent vs wrong password)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Email not verified. Check your inbox for verification link.' },
        { status: 403 }
      );
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
      // Silently fail analytics logging
      console.error('Analytics error:', error);
    }

    // Return authenticated response
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
    });

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

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
