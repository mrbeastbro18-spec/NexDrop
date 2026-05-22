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
      <main className="container pb-12">
        <div className="card p-6">
          <h1 className="text-3xl font-bold">Admin</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card p-4">Users: {users}</div>
            <div className="card p-4">Files: {files}</div>
            <div className="card p-4">Share links: {shares}</div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              {/* Client-side users management */}
              <AdminUsersWrapper />
            </div>
            <div className="card p-4">
              <h2 className="text-lg font-semibold">Metrics</h2>
              <p className="text-sm text-slate-400">Basic metrics available in /api/admin/stats and /api/metrics.</p>
              <a className="btn btn-ghost mt-3" href="/api/metrics">Open metrics</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
