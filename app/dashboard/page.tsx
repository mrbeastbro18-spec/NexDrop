import { Navbar } from '@/components/navbar';
import { UploadZone } from '@/components/upload-zone';
import { DashboardFiles } from '@/components/dashboard-files';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import utils from '@/lib/utils.js';
import { redirect } from 'next/navigation';

type Props = {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const user = await currentUser();
  if (!user) redirect('/login');

  const resolvedSearchParams = (await searchParams) ?? {};

  const page = Math.max(1, Number(resolvedSearchParams.page || '1'));
  const perPage = Math.min(100, Math.max(5, Number(resolvedSearchParams.perPage || '20')));

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
      <main className="page-shell stack-8 pb-12">
        <section className="hero-shell">
          <div className="hero-copy stack-6">
            <span className="eyebrow">Workspace overview</span>
            <div className="stack-4">
              <h1 className="title-lg max-w-[12ch]">Your files, shares, and storage at a glance.</h1>
              <p className="supporting max-w-2xl text-base leading-7">
                Keep track of uploads, storage usage, and sharing actions from a dashboard that is easier to scan on every screen.
              </p>
            </div>
          </div>
          <div className="hero-panel stack-4">
            <div className="section-card">
              <p className="title-sm font-semibold">Storage used</p>
              <p className="stat-number mt-2 text-[2.2rem]">{utils.humanSize(user.storageUsed)}</p>
              <p className="detail mt-2 text-sm">of {utils.humanSize(user.storageLimit)} available</p>
            </div>
            <div className="section-grid">
              <div className="feature-card">
                <span className="pill">Files</span>
                <p className="detail mt-3 text-sm leading-6">Browse recent uploads and actions from the updated file grid.</p>
              </div>
              <div className="feature-card">
                <span className="pill">Shares</span>
                <p className="detail mt-3 text-sm leading-6">Create or open share links with fewer clicks.</p>
              </div>
            </div>
          </div>
        </section>

        <UploadZone />

        <section className="stack-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="eyebrow">Recent files</span>
              <h2 className="title-md mt-3">Latest uploads</h2>
            </div>
            <p className="meta text-sm">Page {page} of {Math.max(1, Math.ceil(total / perPage))}</p>
          </div>
          <DashboardFiles
            files={files.map((file: any) => ({
              id: file.id,
              originalName: file.originalName,
              mimeType: file.mimeType,
              size: utils.humanSize(file.size),
              createdAt: file.createdAt.toISOString(),
              shareToken: file.shareLink?.token ?? null
            }))}
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[color:var(--muted)]">Showing {files.length} of {total} files</div>
          <div className="flex gap-2">
            {page > 1 ? <a className="btn btn-secondary btn-sm" href={`?page=${page - 1}&perPage=${perPage}`}>Previous</a> : null}
            {page * perPage < total ? <a className="btn btn-secondary btn-sm" href={`?page=${page + 1}&perPage=${perPage}`}>Next</a> : null}
          </div>
        </div>
      </main>
    </>
  );
}
