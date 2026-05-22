import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import { Readable } from 'stream';
import * as bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: any) {
  const params = await (ctx?.params ?? {});
  const { token } = params as { token: string };
  const share = await prisma.shareLink.findUnique({ where: { token }, include: { file: true } });
  if (!share) return new Response('Not found', { status: 404 });
  if (share.expiresAt && share.expiresAt < new Date()) return new Response('Expired', { status: 410 });

  const password = new URL(req.url).searchParams.get('password');
  if (share.isPasswordProtected) {
    if (!password || !share.passwordHash || !(await bcrypt.compare(password, share.passwordHash))) {
      return new Response('Password required or invalid', { status: 401 });
    }
  }

  if (share.maxDownloads && share.currentDownloads >= share.maxDownloads) {
    return new Response('Download limit reached', { status: 429 });
  }

  await prisma.shareLink.update({
    where: { token },
    data: { currentDownloads: { increment: 1 } }
  });

  const stream = fs.createReadStream(share.file.storagePath);
  return new Response(Readable.toWeb(stream) as any, {
    headers: {
      'Content-Type': share.file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(share.file.originalName)}"`
    }
  });
}
