import { NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';
import { getReadableStream } from '@/lib/storage';
import { env } from '@/lib/env';
import { rateLimitDownload, getClientIp } from '@/lib/rate-limit';
import { downloads } from '@/lib/metrics';

export const runtime = 'nodejs';

function contentDispositionFilename(name: string) {
  const safe = name.replace(/[\r\n"]/g, '_');
  return `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(req: NextRequest, ctx: any) {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Rate limit by client IP
  const ip = getClientIp(req.headers);
  const rl = await rateLimitDownload(ip);
  if (!rl.success) return new Response('Too many downloads', { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });

  const params = await (ctx?.params ?? {});
  const { id } = params as { id: string };
  const file = await prisma.file.findFirst({ where: { id, userId: user.id } });
  if (!file) return new Response('Not found', { status: 404 });

  // Increment download counter
  try {
    await prisma.file.update({ where: { id }, data: { downloadCount: { increment: 1 } } });
    await prisma.analyticsEvent.create({ data: { userId: user.id, eventType: 'FILE_DOWNLOAD', metadata: { fileId: id, ip } } });
    try { downloads.inc(); } catch (e) {}
  } catch (e) {
    console.error('Download logging error:', e);
  }

  // Support Range requests for streaming
  const rangeHeader = req.headers.get('range');
  if (rangeHeader) {
    // parse bytes=start-end
    const size = Number(file.size ?? 0n);
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    if (!match) return new Response('Invalid range', { status: 416 });
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : size - 1;
    if (start > end || start >= size) return new Response('Range Not Satisfiable', { status: 416 });
    if (start < 0 || end < 0 || !Number.isFinite(start) || !Number.isFinite(end)) {
      return new Response('Invalid range', { status: 416 });
    }

    if (env.S3_ENABLED) {
      // S3 will handle Range via GetObjectCommand internally through getReadableStream
      const stream = await getReadableStream(file.storagePath, { start, end });
      const headers: Record<string, string> = {
        'Content-Type': file.mimeType,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(end - start + 1)
      };
      return new Response(Readable.toWeb(stream as any) as any, { status: 206, headers });
    }

    // Local file
    const stream = await getReadableStream(file.storagePath, { start, end });
    const headers: Record<string, string> = {
      'Content-Type': file.mimeType,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1)
    };
    return new Response(Readable.toWeb(stream as any) as any, { status: 206, headers });
  }

  const stream = await getReadableStream(file.storagePath);
  return new Response(Readable.toWeb(stream as any) as any, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': contentDispositionFilename(file.originalName),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    }
  });
}
