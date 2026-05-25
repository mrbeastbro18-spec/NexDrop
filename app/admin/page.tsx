import { Navbar } from '@/components/navbar';
import AdminUsersWrapper from '@/components/admin-users-wrapper';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BOOTSTRAP_ADMIN_SUBJECT } from '@/lib/admin-bootstrap';
import { redirect } from 'next/navigation';
// client wrapper imported above

export default async function AdminPage() {
  const user = await requireAdmin().catch(() => null);
  if (!user) {
    redirect('/login');
  }

  // If the admin logged in using the bootstrap env fallback, avoid hitting the
  // database (it may be unavailable). Show minimal admin UI and surface
  // that the database is offline instead of crashing the page.
  const isBootstrapAdmin = user.id === BOOTSTRAP_ADMIN_SUBJECT;

  let users: number | null = null;
  let files: number | null = null;
  let shares: number | null = null;

  if (!isBootstrapAdmin) {
    const results = await Promise.all([prisma.user.count(), prisma.file.count(), prisma.shareLink.count()]);
    users = results[0];
    files = results[1];
    shares = results[2];
  }

  return (
    <>
      <Navbar />
      <main className="page-shell stack-8 pb-12">
        <section className="hero-shell">
          <div className="hero-copy stack-6">
            <span className="eyebrow">Administration</span>
            <div className="stack-4">
              <h1 className="title-lg max-w-[10ch]">Run the platform from a cleaner control room.</h1>
              <p className="supporting max-w-2xl text-base leading-7">
                Summary stats, user controls, and metrics live in the same polished admin layout.
              </p>
            </div>
          </div>
          <div className="hero-panel stack-4">
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-number">{users ?? 'N/A'}</div>
                <p className="detail mt-1 text-sm">Users</p>
              </div>
              <div className="stat-card">
                <div className="stat-number">{files ?? 'N/A'}</div>
                <p className="detail mt-1 text-sm">Files</p>
              </div>
              <div className="stat-card">
                <div className="stat-number">{shares ?? 'N/A'}</div>
                <p className="detail mt-1 text-sm">Share links</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
          <div>
            {/* Client-side users management */}
            <AdminUsersWrapper />
          </div>
          <div className="section-card stack-4">
            <div>
              <h2 className="title-md font-semibold">Metrics</h2>
              <p className="detail mt-2 text-sm leading-6">Basic metrics are available in /api/admin/stats and /api/metrics.</p>
            </div>
            <a className="btn btn-secondary" href="/api/metrics">Open metrics</a>
            <a className="btn btn-ghost" href="/api/health">Health (live)</a>
            <a className="btn btn-ghost" href="/api/health/ready">Health (ready)</a>
          </div>
        </div>
      </main>
    </>
  );
}
