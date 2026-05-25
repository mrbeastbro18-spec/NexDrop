import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logServerError } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET() {
  const requestId = randomUUID();

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'x-request-id': requestId } });
  }

  try {
    const [users, files, shares] = await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.shareLink.count()
    ]);
    return NextResponse.json({ users, files, shares }, { headers: { 'x-request-id': requestId } });
  } catch (error) {
    logServerError('admin.stats.failed', error, { requestId });
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500, headers: { 'x-request-id': requestId } });
  }
}
