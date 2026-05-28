import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="page-shell stack-6">
      <header className="glass-nav card nav-shell">
        <Link href="/" className="flex items-center gap-3">
          <span className="brand-mark">N</span>
          <span className="font-semibold tracking-tight">NexDrop</span>
        </Link>
        <div className="nav-links text-sm">
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </div>
      </header>
      <div className="hero-shell items-stretch">
        <div className="hero-copy stack-5">
          <span className="eyebrow">Terms</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[11ch]">Terms of Service</h1>
            <p className="supporting max-w-3xl text-base leading-7">This is a starter terms page for NexDrop. Replace it with your production terms before launch.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            <Link className="btn btn-secondary" href="/login">Sign in</Link>
          </div>
        </div>
        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <p className="title-sm font-semibold">Key sections</p>
            <p className="detail text-sm leading-6">Cover account rules, acceptable use, file ownership, and service limits here.</p>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">Use</span><p className="detail mt-3 text-sm leading-6">State permitted and prohibited actions.</p></div>
            <div className="feature-card"><span className="pill">Limits</span><p className="detail mt-3 text-sm leading-6">Define quotas, rate limits, and sharing rules.</p></div>
          </div>
        </div>
      </div>
    </main>
  );
}
