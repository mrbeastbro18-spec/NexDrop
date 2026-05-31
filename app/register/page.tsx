'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell, AuthLink } from '@/components/auth-shell';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await res.json().catch(() => ({}));
      setBusy(false);

      if (!res.ok) {
        if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
          console.error('[auth/register] failed', { status: res.status, error: data?.error });
        }
        return setError(data?.error || 'Registration failed');
      }

      setCreated(true);
    } catch (err) {
      setBusy(false);
      if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') console.error('[auth/register] network error', err);
      setError('Network error while registering. Please try again.');
    }
  }

  async function resend() {
    setResendMsg(null);
    try {
      const res = await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setResendMsg(data?.error || 'Failed to queue verification');
      setResendMsg(data?.message || 'Verification email queued.');
    } catch (err) {
      setResendMsg('Network error. Please try again later.');
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Get a polished file space in minutes."
      description="Create an account to upload, share, and manage files from a faster, cleaner interface across desktop and mobile."
      footer={(
        <p>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </p>
      )}
    >
      {!created ? (
        <form onSubmit={submit} className="space-y-4">
          <div className="stack-4">
            <label className="sr-only" htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" autoComplete="name" required minLength={2} className="field" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <label className="sr-only" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              className="field"
              placeholder="Create a strong password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}"
              title="Use at least 8 characters with uppercase, lowercase, number, and special character."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="detail text-sm leading-6">Use at least 8 characters with uppercase, lowercase, a number, and a special character.</p>
          {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
          <button disabled={busy} className="btn btn-primary w-full" type="submit">{busy ? 'Creating...' : 'Create account'}</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="section-card border-[color:var(--success)] bg-[color:color-mix(in_oklab,var(--success)_10%,transparent)] p-4">
            <p className="font-medium text-[color:var(--success)]">Account created successfully.</p>
            <p className="detail mt-1 text-sm">Check your email for a verification link to activate your account.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={() => router.push('/login')}>Go to sign in</button>
            <button className="btn btn-outline" onClick={resend}>Resend verification</button>
          </div>
          {resendMsg ? <p className="text-sm mt-2">{resendMsg}</p> : null}
        </div>
      )}
    </AuthShell>
  );
}
