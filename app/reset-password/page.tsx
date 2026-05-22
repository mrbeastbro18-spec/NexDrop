'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return new URLSearchParams(window.location.search).get('token') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Failed');
    setDone(true);
    setTimeout(() => router.push('/login'), 1200);
  }

  return (
    <main className="container py-10">
      <form className="card mx-auto max-w-md space-y-4 p-6" onSubmit={submit}>
        <h1 className="text-2xl font-semibold">Reset password</h1>
        {done ? <p>Done. Redirecting...</p> : <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {!done ? <button className="btn btn-primary w-full">Update password</button> : null}
      </form>
    </main>
  );
}
