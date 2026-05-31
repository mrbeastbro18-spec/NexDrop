import { NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';
import { getReadableStream } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: any) {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const params = await (ctx?.params ?? {});
  const { id } = params as { id: string };
  const file = await prisma.file.findFirst({ where: { id, userId: user.id } });
  if (!file) return new Response('Not found', { status: 404 });

  const rangeHeader = req.headers.get('range');
  const size = Number(file.size ?? 0n);
  if (rangeHeader) {
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    if (!match) return new Response('Invalid range', { status: 416 });
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : size - 1;
    if (start > end || start >= size) return new Response('Range Not Satisfiable', { status: 416 });

    const stream = await getReadableStream(file.storagePath, { start, end });
    const headers: Record<string, string> = {
      'Content-Type': file.mimeType,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1),
      'Cache-Control': 'private, no-store'
    };
    return new Response(Readable.toWeb(stream as any) as any, { status: 206, headers });
  }

  const stream = await getReadableStream(file.storagePath);
  return new Response(Readable.toWeb(stream as any) as any, {
    headers: {
      'Content-Type': file.mimeType,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; img-src 'self' data:; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none';"
    }
  });
}
