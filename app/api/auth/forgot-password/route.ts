import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { queueEmail } from '@/lib/email';
import { randomUUID } from 'node:crypto';
import { emailSchema, forgotPasswordSchema } from '@/lib/validation';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(req.headers);

    // Rate limit forgot-password attempts by IP
    const rateLimit = await rateLimitAuth(`forgot:${clientIp}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Try again later.',
          retryAfter: rateLimit.retryAfter
        },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        ok: true,
        message: 'If an account exists with this email, you will receive reset instructions.'
      });
    }

    const { email } = validation.data;

    // Look up user (but don't reveal if exists)
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return same response to prevent account enumeration
    const response = {
      ok: true,
      message: 'If an account exists with this email, you will receive reset instructions.'
    };

    // If user not found, just return success response
    if (!user) {
      return NextResponse.json(response);
    }

    // Generate reset token (cryptographically secure)
    const resetToken = randomUUID();

    // Save reset token with 1-hour expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    // Queue reset email
    try {
      const origin = new URL(req.url).origin;
      const resetUrl = `${origin}/reset-password?token=${resetToken}`;
      await queueEmail('reset-password', email, 'Reset your NexDrop password', { name: user.fullName || email, resetUrl });
    } catch (emailError) {
      console.error('Queue reset email failed:', emailError);
    }

    // Log password reset request
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventType: 'PASSWORD_RESET_REQUESTED',
          metadata: { ip: clientIp }
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
