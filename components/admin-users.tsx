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
    <div className="card p-4">
      <h2 className="text-lg font-semibold">Users</h2>
      {loading ? <div className="text-sm text-slate-400">Loading…</div> : null}
      <div className="mt-3 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-medium">{u.fullName || u.email}</div>
              <div className="text-xs text-slate-400">{u.email} • {new Date(u.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              {u.role !== 'ADMIN' ? <button className="btn btn-sm" onClick={() => action(u.id, 'promote')}>Promote</button> : <button className="btn btn-sm" onClick={() => action(u.id, 'demote')}>Demote</button>}
              <button className="btn btn-ghost btn-sm text-red-400" onClick={() => action(u.id, 'delete')}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
