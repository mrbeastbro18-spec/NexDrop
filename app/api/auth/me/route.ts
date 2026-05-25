import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { currentUser } from '@/lib/auth';
import { logServerError } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const user = await currentUser();
    return NextResponse.json({ user }, { headers: { 'x-request-id': requestId } });
  } catch (error) {
    logServerError('auth.me.failed', error, { requestId });
    return NextResponse.json({ user: null }, { headers: { 'x-request-id': requestId } });
  }
}
