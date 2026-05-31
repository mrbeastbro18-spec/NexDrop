import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getReadableStream } from '@/lib/storage';
import { Readable } from 'stream';
import * as bcrypt from 'bcryptjs';
import { rateLimitShareDownload, getClientIp } from '@/lib/rate-limit';
import { downloads } from '@/lib/metrics';
import { shareTokenSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: any) {
  const params = await (ctx?.params ?? {});
  const { token } = params as { token: string };
  if (!shareTokenSchema.safeParse(token).success) {
    return new Response('Invalid share token', { status: 400 });
  }
  const share = await prisma.shareLink.findUnique({ where: { token }, include: { file: true } });
  if (!share) return new Response('Not found', { status: 404 });
  if (share.expiresAt && share.expiresAt < new Date()) return new Response('Expired', { status: 410 });

  // Rate limit share downloads
  const ip = getClientIp(req.headers);
  const rl = await rateLimitShareDownload(token);
  if (!rl.success) return new Response('Too many downloads for this share', { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });

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

  // Increment file download count and log analytics
  try {
    if (share.file && share.file.id) {
      await prisma.file.update({ where: { id: share.file.id }, data: { downloadCount: { increment: 1 } } });
      await prisma.analyticsEvent.create({ data: { eventType: 'SHARE_DOWNLOAD', metadata: { shareToken: token, fileId: share.file.id, ip } } });
      try { downloads.inc(); } catch (e) {}
    }
  } catch (e) {
    console.error('Share download logging error:', e);
  }

  // Support Range requests for streaming (for media previews)
  const rangeHeader = req.headers.get('range');
  if (rangeHeader) {
    const size = Number(share.file.size ?? 0n);
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    if (!match) return new Response('Invalid range', { status: 416 });
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : size - 1;
    if (start > end || start >= size) return new Response('Range Not Satisfiable', { status: 416 });

    const stream = await getReadableStream(share.file.storagePath, { start, end });
    const headers: Record<string, string> = {
      'Content-Type': share.file.mimeType,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1)
    };
    return new Response(Readable.toWeb(stream as any) as any, { status: 206, headers });
  }

  const stream = await getReadableStream(share.file.storagePath);
  return new Response(Readable.toWeb(stream as any) as any, {
    headers: {
      'Content-Type': share.file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(share.file.originalName)}"`
    }
  });
}
