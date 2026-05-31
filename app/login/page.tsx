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
  const [showResend, setShowResend] = useState(false);
  const registered = searchParams.get('registered') === '1';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const requestId = res.headers.get('x-request-id') || 'n/a';
      const data = await res.json().catch(() => ({}));

      setBusy(false);
      if (!res.ok) {
        if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
          console.error('[auth/login] failed', { status: res.status, requestId, error: data?.error || 'Login failed' });
        }
        // Show inline resend option if account is unverified
        if (res.status === 403 && data?.error && String(data.error).toLowerCase().includes('not verified')) {
          setError('Email not verified. Check your inbox.');
          setShowResend(true);
          return;
        }
        return setError(data?.error || `Login failed (request ${requestId})`);
      }

      if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
        console.log('[auth/login] success', { requestId });
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setBusy(false);
      if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
        console.error('[auth/login] network error', err);
      }
      setError('Network error while logging in. Please try again.');
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your NexDrop workspace."
      description="Access your files, shares, and admin tools from a refined dashboard built for fast daily use."
      footer={(
        <p>
          New here? <AuthLink href="/register">Create an account</AuthLink>. <AuthLink href="/forgot-password">Reset your password</AuthLink>.
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
        <div className="space-y-2">
          <button disabled={busy} className="btn btn-primary w-full" type="submit">{busy ? 'Signing in...' : 'Sign in'}</button>
          {showResend ? (
            <div className="pt-2">
              <p className="detail text-sm">Didn&apos;t get the verification email?</p>
              <button type="button" className="btn btn-outline mt-2" onClick={async () => {
                try {
                  const res = await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
                  const data = await res.json().catch(() => ({}));
                  setError(data?.message || 'If an account exists we queued a verification email.');
                } catch (err) {
                  setError('Network error while resending verification.');
                }
              }}>Resend verification</button>
            </div>
          ) : null}
        </div>
      </form>
    </AuthShell>
  );
}
