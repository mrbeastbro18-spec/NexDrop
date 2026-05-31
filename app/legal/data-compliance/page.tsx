import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function DataCompliancePage() {
  return (
    <main className="page-shell stack-6">
      <header className="glass-nav card nav-shell">
        <Logo />
        <div className="nav-links text-sm">
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </div>
      </header>

      <section className="hero-shell items-stretch">
        <div className="hero-copy stack-5">
          <span className="eyebrow">Compliance</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[28ch]">Data Compliance & Controls</h1>
            <p className="supporting max-w-3xl text-base leading-7">We maintain operational controls to protect user data. This page describes retention, deletion, encryption, access reviews, and logging practices.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            <Link className="btn btn-secondary" href="/legal/terms">Terms</Link>
          </div>
        </div>

        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <p className="title-sm font-semibold">Retention & disposal</p>
            <p className="detail text-sm leading-6">Files and user data are retained until deletion by the user or account termination. Logs and backups are retained per our operational policy and removed on a regular schedule.</p>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">Deletion requests</span><p className="detail mt-3 text-sm leading-6">Users can request account/data deletion via settings or by contacting support; we provide confirmation and follow a secure wipe procedure.</p></div>
            <div className="feature-card"><span className="pill">Encryption</span><p className="detail mt-3 text-sm leading-6">All data at rest and in transit is encrypted using industry-standard algorithms. Access to storage is restricted and logged.</p></div>
            <div className="feature-card"><span className="pill">Access controls</span><p className="detail mt-3 text-sm leading-6">Administrative access is limited by role, audited regularly, and protected by MFA for privileged accounts.</p></div>
            <div className="feature-card"><span className="pill">Audits & logs</span><p className="detail mt-3 text-sm leading-6">We maintain audit logs for security-relevant actions and monitor for suspicious activity. Incident response plans are in place.</p></div>
          </div>
        </div>
      </section>

      <section className="section-card stack-4">
        <span className="eyebrow">Operational controls</span>
        <div className="section-grid">
          <div className="info-card"><p className="title-sm font-semibold">Access review</p><p className="detail mt-2 text-sm leading-6">Privileged access is reviewed and limited to approved operators.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">Logging</p><p className="detail mt-2 text-sm leading-6">Security-relevant actions are logged for monitoring and incident response.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">Data minimization</p><p className="detail mt-2 text-sm leading-6">We keep only what is needed to run the service and support your account.</p></div>
        </div>
      </section>
    </main>
  );
}