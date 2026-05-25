'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell, AuthLink } from '@/components/auth-shell';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const registered = searchParams.get('registered') === '1';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error || 'Login failed');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your NexDrop workspace."
      description="Access your files, shares, and admin tools from a refined dashboard built for fast daily use."
      footer={(
        <p>
          New here? <AuthLink href="/register">Create an account</AuthLink>. <AuthLink href="/forgot-password">Reset your password</AuthLink> if needed.
        </p>
      )}
    >
      <form onSubmit={submit} className="space-y-4">
        {registered ? (
          <div className="section-card border-[color:var(--success)] bg-[color:color-mix(in_oklab,var(--success)_10%,transparent)] p-4">
            <p className="font-medium text-[color:var(--success)]">Account created successfully.</p>
            <p className="detail mt-1 text-sm">You can sign in with your new credentials now.</p>
          </div>
        ) : null}
        <div className="stack-4">
          <label className="sr-only" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="sr-only" htmlFor="password">Password</label>
          <input id="password" name="password" className="field" placeholder="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="detail">Use the same email address tied to your account.</span>
          <AuthLink href="/forgot-password">Forgot?</AuthLink>
        </div>
        <button disabled={busy} className="btn btn-primary w-full" type="submit">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </AuthShell>
  );
}
