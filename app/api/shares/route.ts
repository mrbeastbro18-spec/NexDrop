import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { createShareSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // CSRF protection: double-submit cookie pattern
  const csrfHeader = req.headers.get('x-csrf-token') || '';
  const csrfCookie = req.cookies.get('nd_csrf')?.value || '';
  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const validation = createShareSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || 'Invalid share request' }, { status: 400 });
  }

  // Prevent abuse: limit share creation per user
  const rl = await rateLimit({ key: `share-create:${user.id}`, limit: 20, window: 3600 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Share creation rate limit exceeded' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  }

  const { fileId, expiresInDays, password, maxDownloads } = validation.data;

  const file = await prisma.file.findFirst({ where: { id: fileId, userId: user.id } });
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  const token = randomUUID().replace(/-/g, '');
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  const share = await prisma.shareLink.upsert({
    where: { fileId },
    update: {
      token,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      isPasswordProtected: !!password,
      passwordHash,
      maxDownloads,
      createdById: user.id
    },
    create: {
      fileId,
      token,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      isPasswordProtected: !!password,
      passwordHash,
      maxDownloads,
      createdById: user.id
    }
  });

  await prisma.file.update({ where: { id: fileId }, data: { isPublic: true } });

  return NextResponse.json({ ok: true, token: share.token, url: `/share/${share.token}` });
}
