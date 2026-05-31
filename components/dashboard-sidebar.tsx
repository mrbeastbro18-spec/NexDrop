'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardDrive, Clock3, Share2, Trash2, BadgePlus, Settings2, LifeBuoy, MessageCircleMore, MoreHorizontal, User2, LogOut } from 'lucide-react';

type DashboardSidebarProps = {
  user?: {
    fullName?: string | null;
    email: string;
    storageUsed: bigint | number;
    storageLimit: bigint | number;
  };
};

function bytesToGb(value: bigint | number) {
  return Number(value) / (1024 * 1024 * 1024);
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const router = useRouter();
  const used = bytesToGb(user?.storageUsed ?? 0);
  const limit = bytesToGb(user?.storageLimit ?? 1);
  const percent = Math.min(100, Math.round((used / limit) * 100));

  return (
    <aside className="dashboard-sidebar stack-3">
      <div className="flex items-center gap-3 pb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,#2f9bff,#0d7ef2)] text-sm font-bold text-white">
          <User2 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[0.82rem] font-semibold text-white">{user?.fullName || 'NexDrop user'}</p>
          <p className="truncate text-[0.72rem] text-[color:var(--muted)]">{user?.email || 'user@example.com'}</p>
        </div>
      </div>

      <Link href="/dashboard" className="dashboard-sidebar__button bg-[rgba(13,126,242,0.14)] text-white">
        <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
        My Files
      </Link>

      <div className="dashboard-sidebar__section stack-1">
        <Link href="/dashboard?tab=recent" className="dashboard-sidebar__link">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          Recent Files
        </Link>
        <Link href="/dashboard?tab=shared" className="dashboard-sidebar__link">
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          Shared With Me
        </Link>
        <Link href="/dashboard?tab=trash" className="dashboard-sidebar__link">
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Trash
        </Link>
      </div>

      <div className="dashboard-sidebar__section stack-1">
        <Link href="/dashboard?tab=earn" className="dashboard-sidebar__link">
          <BadgePlus className="h-3.5 w-3.5" aria-hidden="true" />
          Earn Space
        </Link>
        <Link href="/dashboard?tab=settings" className="dashboard-sidebar__link">
          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          Account
        </Link>
        <button type="button" className="dashboard-sidebar__button text-left" onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/');
          router.refresh();
        }}>
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Logout
        </button>
        <Link href="/help" className="dashboard-sidebar__link">
          <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
          Help
        </Link>
        <Link href="https://discord.com" className="dashboard-sidebar__link" target="_blank" rel="noreferrer">
          <MessageCircleMore className="h-3.5 w-3.5" aria-hidden="true" />
          Discord
        </Link>
        <button type="button" className="dashboard-sidebar__button text-left">
          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          More
        </button>
      </div>

      <div className="dashboard-sidebar__section stack-3 rounded-[10px] border border-[color:var(--border)] bg-[color:var(--panel-strong)] p-3.5">
        <p className="text-[0.82rem] font-semibold text-white">MediaFire Pro</p>
        <p className="text-[0.72rem] leading-5 text-[color:var(--muted)]">1 TB of storage, 50 GB per file, and ad-free sharing.</p>
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#3ddc84,#0d7ef2)]" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[0.7rem] text-[color:var(--muted)]">
            <span>{used.toFixed(2)} GB used</span>
            <span>{limit.toFixed(0)} GB</span>
          </div>
        </div>
        <Link href="/register" className="btn btn-primary w-full">
          Upgrade
        </Link>
      </div>

      <div className="dashboard-sidebar__section space-y-2.5">
        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Storage usage</div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#ff4d4f,#0d7ef2)]" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex items-center justify-between text-[0.7rem] text-[color:var(--muted)]">
          <span>{percent}% full</span>
          <Link href="/register" className="text-[color:#89bfff] hover:underline">Upgrade</Link>
        </div>
      </div>
    </aside>
  );
}