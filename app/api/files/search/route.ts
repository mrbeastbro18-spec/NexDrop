import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import utils from '@/lib/utils.js';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const perPage = Math.min(50, Math.max(5, Number(url.searchParams.get('perPage') || '10')));

  const where = {
    userId: user.id,
    originalName: q ? { contains: q, mode: 'insensitive' } : undefined
  } as any;

  const total = await prisma.file.count({ where });
  const files = await prisma.file.findMany({
    where,
    include: { shareLink: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage
  });

  return NextResponse.json({
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    files: files.map((f: any) => ({
      id: f.id,
      originalName: f.originalName,
      mimeType: f.mimeType,
      size: utils.humanSize(f.size),
      createdAt: f.createdAt,
      shareToken: f.shareLink?.token || null
    }))
  });
}
