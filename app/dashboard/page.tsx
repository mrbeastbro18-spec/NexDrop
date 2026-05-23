import { Navbar } from '@/components/navbar';
import { UploadZone } from '@/components/upload-zone';
import { FileGrid } from '@/components/file-grid';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { humanSize } from '@/lib/utils';
import { redirect } from 'next/navigation';

type Props = {
  searchParams?: { [key: string]: string | undefined };
};

export default async function DashboardPage({ searchParams }: Props) {
  const user = await currentUser();
  if (!user) redirect('/login');

  const page = Math.max(1, Number(searchParams?.page || '1'));
  const perPage = Math.min(100, Math.max(5, Number(searchParams?.perPage || '20')));

  const where = { userId: user.id };
  const total = await prisma.file.count({ where });
  const files = await prisma.file.findMany({
    where,
    include: { shareLink: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage
  });

  return (
    <>
      <Navbar />
      <main className="container pb-12 space-y-6">
        <div className="card p-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-slate-300">
            Storage used: {humanSize(user.storageUsed)} / {humanSize(user.storageLimit)}
          </p>
        </div>

        <UploadZone />

        <FileGrid
          files={files.map((file: any) => ({
            id: file.id,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: humanSize(file.size),
            createdAt: file.createdAt.toISOString(),
            shareToken: file.shareLink?.token ?? null
          }))}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">Page {page} of {Math.max(1, Math.ceil(total / perPage))}</div>
          <div className="flex gap-2">
            {page > 1 ? <a className="btn btn-ghost" href={`?page=${page - 1}&perPage=${perPage}`}>Previous</a> : null}
            {page * perPage < total ? <a className="btn btn-ghost" href={`?page=${page + 1}&perPage=${perPage}`}>Next</a> : null}
          </div>
        </div>
      </main>
    </>
  );
}
