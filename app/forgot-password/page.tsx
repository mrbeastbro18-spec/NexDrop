'use client';

import { useState } from 'react';
import { AuthShell, AuthLink } from '@/components/auth-shell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    setBusy(false);

    if (!res.ok) {
      setError(data.error || 'Request failed');
      return;
    }

    setMessage(data.message || 'If an account exists with that email, we sent reset instructions.');
  }

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Request a reset link for your account."
      description="We’ll send recovery instructions to the email address associated with your account, if one exists."
      footer={(
        <p>
          Remembered it? <AuthLink href="/login">Return to sign in</AuthLink>
        </p>
      )}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="stack-4">
          <label className="sr-only" htmlFor="email">Email</label>
          <input
            id="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
          />
        </div>
        {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
        {message ? <p className="text-sm text-[color:var(--muted)]">{message}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
      </form>
    </AuthShell>
  );
}