import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import utils from '@/lib/utils.js';
import { paginationSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const validation = paginationSchema.safeParse({
    page: url.searchParams.get('page'),
    perPage: url.searchParams.get('perPage')
  });
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
  }

  const { page, perPage } = validation.data;

  const where = { userId: user.id };
  const total = await prisma.file.count({ where });
  const files = await prisma.file.findMany({
    where,
    include: { shareLink: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage
  });

  return NextResponse.json({
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage)
    },
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
