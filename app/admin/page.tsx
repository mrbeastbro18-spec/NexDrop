import { Navbar } from '@/components/navbar';
import AdminUsersWrapper from '@/components/admin-users-wrapper';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
// client wrapper imported above

export default async function AdminPage() {
  const user = await requireAdmin().catch(() => null);
  if (!user) {
    redirect('/login');
  }

  const [users, files, shares] = await Promise.all([
    prisma.user.count(),
    prisma.file.count(),
    prisma.shareLink.count()
  ]);

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
                <div className="stat-number">{users}</div>
                <p className="detail mt-1 text-sm">Users</p>
              </div>
              <div className="stat-card">
                <div className="stat-number">{files}</div>
                <p className="detail mt-1 text-sm">Files</p>
              </div>
              <div className="stat-card">
                <div className="stat-number">{shares}</div>
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
          </div>
        </div>
      </main>
    </>
  );
}
