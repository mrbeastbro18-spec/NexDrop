'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from './search-bar';
import { Logo } from './logo';

export function Navbar() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="page-shell pb-0 pt-4">
      <nav role="navigation" aria-label="Main navigation" className="glass-nav card nav-shell">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="pill hidden sm:inline-flex">Cloud workspace</span>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
          <div className="w-full md:w-72 lg:w-80">
            <SearchBar />
          </div>
          <div className="nav-links text-sm">
            <Link href="/dashboard" aria-label="Dashboard">Dashboard</Link>
            <Link href="/admin" aria-label="Admin">Admin</Link>
            <button onClick={logout} className="btn btn-ghost btn-sm" aria-label="Logout" type="button">Logout</button>
          </div>
        </div>
      </nav>
    </div>
  );
}
