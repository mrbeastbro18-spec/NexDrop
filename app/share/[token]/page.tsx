import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import utils from '@/lib/utils.js';

type Props = {
  params?: Promise<{ token: string }>;
};

export default async function SharePage({ params }: Props) {
  const { token } = (await params) ?? {} as { token: string };
  if (!token) notFound();

  const share = await prisma.shareLink.findUnique({
    where: { token },
    include: { file: true }
  });

  if (!share) notFound();

  if (share.expiresAt && share.expiresAt < new Date()) {
    return (
      <main className="page-shell stack-6">
        <header className="glass-nav card nav-shell">
          <Link href="/" className="flex items-center gap-3">
            <span className="brand-mark">N</span>
            <span className="font-semibold tracking-tight">NexDrop</span>
          </Link>
          <div className="nav-links text-sm">
            <Link href="/login">Sign in</Link>
            <Link href="/register">Create account</Link>
          </div>
        </header>
        <div className="hero-shell items-stretch">
          <div className="hero-copy stack-5">
            <span className="eyebrow">Shared file</span>
            <div className="stack-4">
              <h1 className="title-lg max-w-[14ch]">This link has expired.</h1>
              <p className="supporting max-w-xl text-base leading-7">The owner set an expiry date on this share. Ask for a new link or return to the homepage.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="btn btn-primary w-fit" href="/">Home</Link>
              <Link className="btn btn-secondary w-fit" href="/login">Sign in</Link>
            </div>
          </div>
          <div className="hero-panel stack-4">
            <div className="section-card">
              <p className="title-sm font-semibold">Share status</p>
              <p className="detail mt-2 text-sm leading-6">Expired links are locked to keep shared files under the owner’s control.</p>
            </div>
            <div className="section-grid">
              <div className="feature-card"><span className="pill">Secure</span><p className="detail mt-3 text-sm leading-6">Access is limited by time, password, or download count when configured.</p></div>
              <div className="feature-card"><span className="pill">Modern</span><p className="detail mt-3 text-sm leading-6">The same page pattern works across desktop and mobile.</p></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const fileSize = utils.humanSize(Number(share.file.size ?? 0n));
  const expiresAt = share.expiresAt ? new Date(share.expiresAt).toLocaleString() : 'No expiry set';

  return (
    <main className="page-shell stack-6">
      <header className="glass-nav card nav-shell">
        <Link href="/" className="flex items-center gap-3">
          <span className="brand-mark">N</span>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">NexDrop</div>
            <div className="meta text-xs">Shared download</div>
          </div>
        </Link>
        <div className="nav-links text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </div>
      </header>

      <div className="hero-shell items-stretch">
        <div className="hero-copy stack-6">
          <span className="eyebrow">Shared file</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[14ch]">{share.file.originalName}</h1>
            <p className="supporting max-w-xl text-base leading-7">A clean share page for quick downloads, with the same premium visual language as the rest of NexDrop.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary w-fit" href={`/api/shares/${share.token}/download`}>Download file</Link>
            <a className="btn btn-secondary w-fit" href={`mailto:?subject=${encodeURIComponent(share.file.originalName)}&body=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/share/${share.token}`)}`}>Share link</a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="info-card">
              <div className="stat-number">{fileSize}</div>
              <p className="detail mt-1 text-sm">File size</p>
            </div>
            <div className="info-card">
              <div className="stat-number">{share.currentDownloads}</div>
              <p className="detail mt-1 text-sm">Downloads</p>
            </div>
            <div className="info-card">
              <div className="stat-number">{share.isPasswordProtected ? 'Yes' : 'Open'}</div>
              <p className="detail mt-1 text-sm">Password status</p>
            </div>
          </div>
        </div>
        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <div className="flex flex-wrap gap-2">
              <span className="pill">Secure</span>
              <span className="pill">Mobile ready</span>
              <span className="pill">Classic UI</span>
            </div>
            <div className="stack-3">
              <p className="title-sm font-semibold">Access details</p>
              <p className="detail text-sm leading-6">This public view keeps the experience simple and direct while preserving the file’s metadata.</p>
            </div>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">Type</span><p className="detail mt-3 text-sm leading-6">{share.file.mimeType}</p></div>
            <div className="feature-card"><span className="pill">Expiry</span><p className="detail mt-3 text-sm leading-6">{expiresAt}</p></div>
          </div>
        </div>
      </div>

      <section className="section-card stack-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">What to expect</span>
            <h2 className="title-md mt-3">A familiar download experience, without the clutter.</h2>
          </div>
          <p className="supporting max-w-2xl text-sm leading-6">
            Share links work well for public handoffs, client deliveries, and quick file transfers when you want a polished page instead of a raw file endpoint.
          </p>
        </div>
        <div className="section-grid">
          <div className="feature-card">
            <p className="title-sm font-semibold">Fast access</p>
            <p className="detail mt-2 text-sm leading-6">One tap takes the viewer directly to the download route.</p>
          </div>
          <div className="feature-card">
            <p className="title-sm font-semibold">Responsive layout</p>
            <p className="detail mt-2 text-sm leading-6">The share page stays readable on small screens and widescreen desktops.</p>
          </div>
          <div className="feature-card">
            <p className="title-sm font-semibold">Controlled sharing</p>
            <p className="detail mt-2 text-sm leading-6">Owners can use expiry, passwords, and download caps when they need extra control.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
