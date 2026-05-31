import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function IpInfringementPage() {
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
          <span className="eyebrow">Policy</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[30ch]">IP Infringement & Takedown</h1>
            <p className="supporting max-w-3xl text-base leading-7">If you believe content on NexDrop infringes your intellectual property rights, follow the procedure below to notify us. We respond promptly and in accordance with applicable law.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            <Link className="btn btn-secondary" href="/legal/privacy">Privacy</Link>
          </div>
        </div>

        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <p className="title-sm font-semibold">How to report</p>
            <p className="detail text-sm leading-6">Send a notice to <strong>abuse@your-domain.example</strong> with: (1) identification of the allegedly infringing material, (2) location (URL), (3) contact info, (4) a statement of good-faith belief, and (5) a physical or electronic signature of the rights holder or agent.</p>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">Review</span><p className="detail mt-3 text-sm leading-6">We will review notices and may remove or disable access to content that appears to infringe.</p></div>
            <div className="feature-card"><span className="pill">Counter‑notice</span><p className="detail mt-3 text-sm leading-6">If your content is removed, you may submit a counter‑notice. We will follow legal requirements when processing counter‑notices.</p></div>
            <div className="feature-card"><span className="pill">Repeat offenders</span><p className="detail mt-3 text-sm leading-6">Accounts that repeatedly upload infringing content may be suspended or terminated.</p></div>
            <div className="feature-card"><span className="pill">Contact</span><p className="detail mt-3 text-sm leading-6">Use <strong>abuse@your-domain.example</strong> for infringement reports; include required proof and contact details.</p></div>
          </div>
        </div>
      </section>

      <section className="section-card stack-4">
        <span className="eyebrow">Notice checklist</span>
        <div className="section-grid">
          <div className="info-card"><p className="title-sm font-semibold">1. Identify the work</p><p className="detail mt-2 text-sm leading-6">Include the copyrighted or trademarked work and explain the issue.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">2. Link the material</p><p className="detail mt-2 text-sm leading-6">Provide the exact NexDrop URL where the content appears.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">3. Confirm authority</p><p className="detail mt-2 text-sm leading-6">State your relationship to the rights owner and include a signature.</p></div>
        </div>
      </section>
    </main>
  );
}