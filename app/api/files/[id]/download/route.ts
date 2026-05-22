import { NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import { Readable } from 'stream';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: any) {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const params = await (ctx?.params ?? {});
  const { id } = params as { id: string };
  const file = await prisma.file.findFirst({ where: { id, userId: user.id } });
  if (!file) return new Response('Not found', { status: 404 });

  const stream = fs.createReadStream(file.storagePath);
  return new Response(Readable.toWeb(stream) as any, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`
    }
  });
}
