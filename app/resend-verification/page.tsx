'use client';

import { useState } from 'react';
import { AuthShell, AuthLink } from '@/components/auth-shell';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));
      setBusy(false);
      if (!res.ok) return setError(data?.error || 'Failed to send verification');
      setMessage(data?.message || 'If an account exists we queued a verification email.');
    } catch (err) {
      setBusy(false);
      setError('Network error. Please try again later.');
    }
  }

  return (
    <AuthShell
      eyebrow="Resend verification"
      title="Resend your verification email"
      description="Enter the email address you used to sign up and we'll send another verification link."
      footer={(
        <p>
          Back to <AuthLink href="/login">Sign in</AuthLink> or <AuthLink href="/register">Create an account</AuthLink>.
        </p>
      )}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="stack-4">
          <label className="sr-only" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
        {message ? <div className="section-card bg-[color:color-mix(in_oklab,var(--success)_10%,transparent)] p-4"><p className="font-medium text-[color:var(--success)]">{message}</p></div> : null}
        <button disabled={busy} className="btn btn-primary w-full" type="submit">{busy ? 'Sending...' : 'Send verification'}</button>
      </form>
    </AuthShell>
  );
}
