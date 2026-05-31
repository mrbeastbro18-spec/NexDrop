import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function PrivacyPage() {
  return (
    <main className="page-shell stack-6">
      <header className="glass-nav card nav-shell">
        <Logo />
        <div className="nav-links text-sm">
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </div>
      </header>
      <div className="hero-shell items-stretch">
        <div className="hero-copy stack-5">
          <span className="eyebrow">Privacy</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[28ch]">Privacy Policy</h1>
            <p className="supporting max-w-3xl text-base leading-7">NexDrop (we, us) respects your privacy. This page explains what we collect, why we collect it, how we use it, and the choices available to you.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            <Link className="btn btn-secondary" href="/register">Create account</Link>
          </div>
        </div>
        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <p className="title-sm font-semibold">What we collect</p>
            <p className="detail text-sm leading-6">We collect account information (email, name), authentication data, and file metadata necessary to provide file storage and sharing services. We do not access file contents except when required to comply with law or to operate the service (e.g., virus scanning, moderation).</p>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">How we use data</span><p className="detail mt-3 text-sm leading-6">To authenticate, store files, process uploads/downloads, send notifications, and improve the service.</p></div>
            <div className="feature-card"><span className="pill">Retention & access</span><p className="detail mt-3 text-sm leading-6">Files remain until you delete them or your account is removed. Shared links follow expiry rules configured by the creator.</p></div>
            <div className="feature-card"><span className="pill">Your controls</span><p className="detail mt-3 text-sm leading-6">You can request access, correction, or deletion of personal data, subject to legal and operational limits.</p></div>
            <div className="feature-card"><span className="pill">Security</span><p className="detail mt-3 text-sm leading-6">We use encryption in transit, access controls, logging, and rate limits to protect the platform.</p></div>
          </div>
        </div>
      </div>

      <section className="section-card stack-4">
        <span className="eyebrow">Quick summary</span>
        <div className="section-grid">
          <div className="info-card"><p className="title-sm font-semibold">Account data</p><p className="detail mt-2 text-sm leading-6">Used to sign you in and manage your workspace.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">File metadata</p><p className="detail mt-2 text-sm leading-6">Used to display, organize, and share your uploads.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">Cookies</p><p className="detail mt-2 text-sm leading-6">Used for sessions, security, and service functionality.</p></div>
        </div>
      </section>
    </main>
  );
}
