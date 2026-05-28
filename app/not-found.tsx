import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell stack-6">
      <div className="hero-shell items-stretch">
        <div className="hero-copy stack-6">
          <span className="eyebrow">404</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[12ch]">That page does not exist.</h1>
            <p className="supporting max-w-xl text-base leading-7">The route may have moved or the link is stale. Head back to the homepage or dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            <Link className="btn btn-secondary" href="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <div className="title-sm font-semibold">Need help?</div>
            <p className="detail text-sm leading-6">Try the search bar from the dashboard or sign in again if you were redirected unexpectedly.</p>
          </div>
          <div className="section-grid">
            <div className="feature-card"><span className="pill">Fast path</span><p className="detail mt-3 text-sm leading-6">Use the homepage to get back to the main entry points.</p></div>
            <div className="feature-card"><span className="pill">Support</span><p className="detail mt-3 text-sm leading-6">Return to sign in if your session expired.</p></div>
          </div>
        </div>
      </div>
    </main>
  );
}
