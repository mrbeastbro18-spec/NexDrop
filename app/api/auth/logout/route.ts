import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth';
import { logServerError } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const refresh = req.cookies.get('nd_refresh')?.value;

  try {
    if (refresh) {
      await prisma.session.deleteMany({ where: { tokenHash: await hashToken(refresh) } });
    }
  } catch (error) {
    // Keep logout resilient even when session storage is unavailable.
    logServerError('auth.logout.session_cleanup_failed', error, { requestId });
  }

  const res = NextResponse.json({ ok: true }, { headers: { 'x-request-id': requestId } });
  res.cookies.set('nd_access', '', { path: '/', maxAge: 0 });
  res.cookies.set('nd_refresh', '', { path: '/', maxAge: 0 });
  res.cookies.set('nd_csrf', '', { path: '/', maxAge: 0 });
  return res;
}
