'use client';

import { useEffect, useState } from 'react';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bootstrapMode, setBootstrapMode] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    setBootstrapMode(false);

    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json().catch(() => ({}));
      if (meRes.ok && (meData?.user?.bootstrap || meData?.user?.id === 'env-admin')) {
        setBootstrapMode(true);
        setUsers([]);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/users');
      const requestId = res.headers.get('x-request-id') || 'n/a';
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 503 && data?.bootstrap) {
          setBootstrapMode(true);
        }
        setError(data?.error || `Failed to load users (request ${requestId})`);
        if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
          console.error('[admin/users] load failed', { status: res.status, requestId, error: data?.error });
        }
        setUsers([]);
        setLoading(false);
        return;
      }

      setUsers(data.users || []);
    } catch (err) {
      setError('Network error while loading users.');
      if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
        console.error('[admin/users] load network error', err);
      }
    } finally {
      setLoading(false);
    }
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

    try {
      const res = await fetch('/api/admin/users', {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        body: JSON.stringify(body)
      });

      const requestId = res.headers.get('x-request-id') || 'n/a';
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || `Action failed (request ${requestId})`);
        if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
          console.error('[admin/users] action failed', { status: res.status, requestId, error: data?.error, action: act, id });
        }
        return;
      }

      await load();
    } catch (err) {
      setError('Network error while applying user action.');
      if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
        console.error('[admin/users] action network error', err);
      }
    }
  }

  return (
    <div className="section-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="title-md font-semibold">Users</h2>
          <p className="detail mt-1 text-sm">Promote, demote, or remove access from the admin console.</p>
        </div>
        {loading ? <span className="pill">Loading…</span> : null}
      </div>
      <div className="mt-4 space-y-3">
        {bootstrapMode ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 text-sm">
            Bootstrap admin mode is active. Database-backed user management is disabled until the normal auth/database path is restored.
          </div>
        ) : null}
        {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
        {!loading && !error && !users.length && !bootstrapMode ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 text-sm text-[color:var(--muted)]">
            No users were returned by the admin API.
          </div>
        ) : null}
        {users.map((u) => (
          <div key={u.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-medium">{u.fullName || u.email}</div>
                <div className="meta text-xs">{u.email} • {new Date(u.createdAt).toLocaleString()}</div>
              </div>
              <span className="pill">{u.role}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {u.role !== 'ADMIN' ? <button className="btn btn-secondary btn-sm w-full sm:w-auto" disabled={bootstrapMode} onClick={() => action(u.id, 'promote')} type="button">Promote</button> : <button className="btn btn-secondary btn-sm w-full sm:w-auto" disabled={bootstrapMode} onClick={() => action(u.id, 'demote')} type="button">Demote</button>}
              <button className="btn btn-ghost btn-sm w-full sm:w-auto" disabled={bootstrapMode} onClick={() => action(u.id, 'delete')} type="button">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
