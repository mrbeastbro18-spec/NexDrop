import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function TermsPage() {
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
          <span className="eyebrow">Terms</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[28ch]">Terms of Service</h1>
            <p className="supporting max-w-3xl text-base leading-7">Welcome to NexDrop. By using our service you agree to these Terms. Please read them carefully; they govern your use of the platform.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            <Link className="btn btn-secondary" href="/login">Sign in</Link>
          </div>
        </div>
        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <p className="title-sm font-semibold">Accounts & conduct</p>
            <p className="detail text-sm leading-6">You are responsible for your account and activity. Prohibited actions include unlawful activity, abuse of sharing, malware distribution, and attempts to circumvent limits.</p>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">Ownership</span><p className="detail mt-3 text-sm leading-6">You retain ownership of content you upload. You grant NexDrop a limited license to operate and serve that content.</p></div>
            <div className="feature-card"><span className="pill">Limits & termination</span><p className="detail mt-3 text-sm leading-6">We may set quotas, rate limits, and suspend accounts for violations. Liability and warranty are limited as permitted by law.</p></div>
            <div className="feature-card"><span className="pill">Billing</span><p className="detail mt-3 text-sm leading-6">If paid plans are added later, pricing and renewal terms will be disclosed before purchase and shown in your account area.</p></div>
            <div className="feature-card"><span className="pill">Updates</span><p className="detail mt-3 text-sm leading-6">We may update these Terms from time to time. Continued use means you accept the revised terms.</p></div>
          </div>
        </div>
      </div>

      <section className="section-card stack-4">
        <span className="eyebrow">Highlights</span>
        <div className="section-grid">
          <div className="info-card"><p className="title-sm font-semibold">Use responsibly</p><p className="detail mt-2 text-sm leading-6">No abuse, no illegal uploads, and no attempts to break service limits.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">Your content</p><p className="detail mt-2 text-sm leading-6">You keep ownership of what you upload; we only operate the service.</p></div>
          <div className="info-card"><p className="title-sm font-semibold">Service changes</p><p className="detail mt-2 text-sm leading-6">Features and limits may evolve as the platform grows.</p></div>
        </div>
      </section>
    </main>
  );
}
