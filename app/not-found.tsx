import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell">
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
        <div className="hero-panel section-card stack-4">
          <div className="title-sm font-semibold">Need help?</div>
          <p className="detail text-sm leading-6">Try the search bar from the dashboard or sign in again if you were redirected unexpectedly.</p>
        </div>
      </div>
    </main>
  );
}
