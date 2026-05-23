import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function SharePage({ params }: { params: { token: string } }) {
  const { token } = params;
  const share = await prisma.shareLink.findUnique({
    where: { token },
    include: { file: true }
  });

  if (!share) notFound();

  if (share.expiresAt && share.expiresAt < new Date()) {
    return <main className="page-shell"><div className="section-card">This link has expired.</div></main>;
  }

  return (
    <main className="page-shell">
      <div className="hero-shell items-stretch">
        <div className="hero-copy stack-6">
          <span className="eyebrow">Shared file</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[14ch]">{share.file.originalName}</h1>
            <p className="supporting max-w-xl text-base leading-7">{share.file.mimeType}</p>
          </div>
          <Link className="btn btn-primary w-fit" href={`/api/shares/${share.token}/download`}>Download file</Link>
        </div>
        <div className="hero-panel stack-4">
          <div className="section-card">
            <p className="title-sm font-semibold">Access details</p>
            <p className="detail mt-2 text-sm leading-6">This public view keeps the experience simple and direct while preserving the file’s metadata.</p>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">Secure</span><p className="detail mt-3 text-sm leading-6">Share downloads go through a dedicated route.</p></div>
            <div className="feature-card"><span className="pill">Ready</span><p className="detail mt-3 text-sm leading-6">Open on mobile or desktop without losing clarity.</p></div>
          </div>
        </div>
      </div>
    </main>
  );
}
