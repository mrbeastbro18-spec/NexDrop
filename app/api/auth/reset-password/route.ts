import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { resetPasswordSchema } from '@/lib/validation';
import { rateLimitAuth, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers);
    const rateLimit = await rateLimitAuth(`reset:${clientIp}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    const body = await req.json().catch(() => null);
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 });
    }

    const { token, password } = validation.data;
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
