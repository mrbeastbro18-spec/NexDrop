'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { AuthShell, AuthLink } from '@/components/auth-shell';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(() => searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const hasToken = useMemo(() => Boolean(token.trim()), [token]);

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
    <AuthShell
      eyebrow="Password reset"
      title="Choose a stronger password and get back in."
      description="Use the reset link from your email to set a new password and restore access to your account."
      footer={(
        <p>
          Remembered it? <AuthLink href="/login">Return to sign in</AuthLink>
        </p>
      )}
    >
      <form className="space-y-4" onSubmit={submit}>
        {done ? (
          <div className="section-card p-4">
            <p className="font-medium">Password updated.</p>
            <p className="detail mt-2 text-sm">Redirecting you to the login screen...</p>
          </div>
        ) : (
          <div className="stack-4">
            {!hasToken ? (
              <>
                <label className="sr-only" htmlFor="token">Reset token</label>
                <input id="token" className="field" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Reset token" autoComplete="one-time-code" />
              </>
            ) : (
              <p className="detail text-sm">Recovery token loaded from your email link.</p>
            )}
            <label className="sr-only" htmlFor="password">New password</label>
            <input id="password" className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" required minLength={8} />
            <button className="btn btn-primary w-full" type="submit">Update password</button>
          </div>
        )}
        {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
      </form>
    </AuthShell>
  );
}
