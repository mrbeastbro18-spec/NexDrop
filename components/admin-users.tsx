'use client';

import { useEffect, useState } from 'react';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function action(id: string, act: 'promote' | 'demote' | 'delete') {
    const method = act === 'delete' ? 'DELETE' : 'PATCH';
    const body: any = { id };
    if (act !== 'delete') body.action = act;
    const csrf = document.cookie.split('; ').find((c) => c.startsWith('nd_csrf='))?.split('=')[1] || '';
    await fetch('/api/admin/users', { method, headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify(body) });
    load();
  }

  return (
    <div className="section-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="title-md font-semibold">Users</h2>
          <p className="detail mt-1 text-sm">Promote, demote, or remove access from the admin console.</p>
        </div>
        {loading ? <span className="pill">Loading…</span> : null}
      </div>
      <div className="mt-4 space-y-3">
        {users.map((u) => (
          <div key={u.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{u.fullName || u.email}</div>
                <div className="meta text-xs">{u.email} • {new Date(u.createdAt).toLocaleString()}</div>
              </div>
              <span className="pill">{u.role}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {u.role !== 'ADMIN' ? <button className="btn btn-secondary btn-sm" onClick={() => action(u.id, 'promote')} type="button">Promote</button> : <button className="btn btn-secondary btn-sm" onClick={() => action(u.id, 'demote')} type="button">Demote</button>}
              <button className="btn btn-ghost btn-sm" onClick={() => action(u.id, 'delete')} type="button">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
