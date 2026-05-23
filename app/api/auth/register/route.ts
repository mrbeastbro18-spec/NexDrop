import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { queueEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { registerSchema } from '@/lib/validation';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(req.headers);

    // Rate limit registration attempts by IP
    const rateLimit = await rateLimitAuth(`register:${clientIp}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many registration attempts. Try again later.',
          retryAfter: rateLimit.retryAfter
        },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, password, fullName } = validation.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
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
        verificationToken,
        storageLimit: 10 * 1024 * 1024 * 1024 // 10 GB default
      }
    });

    // Queue verification email
    try {
      const origin = new URL(req.url).origin;
      const verifyUrl = `${origin}/api/auth/verify?token=${verificationToken}`;
      await queueEmail('verify-email', email, 'Verify your NexDrop account', { name: email, verifyUrl });
    } catch (emailError) {
      console.error('Queue verify email failed:', emailError);
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

    return NextResponse.json({
      ok: true,
      message: 'Account created. Check your email to verify your account.'
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
