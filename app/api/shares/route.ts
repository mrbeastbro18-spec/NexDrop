import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const fileId = String(body?.fileId || '');
  const expiresInDays = Number(body?.expiresInDays || 7);
  const password = body?.password ? String(body.password) : null;
  const maxDownloads = body?.maxDownloads ? Number(body.maxDownloads) : null;

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
