import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { clearAuthCookies, hashToken, rotateTokens, saveSession, setAuthCookies, signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('nd_access')?.value;
  if (!token) return NextResponse.json({ user: null });

  try {
    const { verifyAccessToken } = await import('@/lib/auth');
    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, fullName: true, role: true, storageUsed: true, storageLimit: true, isVerified: true }
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
