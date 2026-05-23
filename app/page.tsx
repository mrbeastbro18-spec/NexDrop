import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell stack-8 pt-5">
      <section className="hero-shell">
        <div className="hero-copy stack-6">
          <span className="eyebrow">Cloud transfer workspace</span>
          <div className="stack-4">
            <h1 className="title-xl max-w-[11ch]">Ship files with a polished experience.</h1>
            <p className="supporting max-w-2xl text-lg leading-8">
              NexDrop brings uploads, sharing, authentication, and admin tools into one refined dashboard designed for desktop and mobile.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/register">Create account</Link>
            <Link className="btn btn-secondary" href="/login">Sign in</Link>
            <Link className="btn btn-ghost" href="/dashboard">Open dashboard</Link>
          </div>
        </div>

        <div className="hero-panel stack-6">
          <div className="section-card stack-4">
            <span className="pill">Product highlights</span>
            <div className="section-grid">
              <div className="feature-card">
                <p className="title-sm font-semibold">Elegant dashboard</p>
                <p className="detail mt-2 text-sm leading-6">A clearer file workspace with stronger hierarchy, better spacing, and faster scanning.</p>
              </div>
              <div className="feature-card">
                <p className="title-sm font-semibold">Clean auth flow</p>
                <p className="detail mt-2 text-sm leading-6">Login, registration, reset, and recovery screens now read like a finished product.</p>
              </div>
              <div className="feature-card">
                <p className="title-sm font-semibold">Theme-aware UI</p>
                <p className="detail mt-2 text-sm leading-6">Switch between light and dark without losing clarity or polish.</p>
              </div>
              <div className="feature-card">
                <p className="title-sm font-semibold">Responsive by design</p>
                <p className="detail mt-2 text-sm leading-6">Layouts collapse cleanly on mobile and stay spacious on desktop.</p>
              </div>
            </div>
          </div>
          <div className="section-grid">
            <div className="feature-card">
              <span className="pill">Fast</span>
              <p className="detail mt-3 text-sm leading-6">Chunked uploads, instant share links, and responsive feedback.</p>
            </div>
            <div className="feature-card">
              <span className="pill">Accessible</span>
              <p className="detail mt-3 text-sm leading-6">Better contrast, focus states, and keyboard-friendly navigation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card stack-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">What changed</span>
            <h2 className="title-lg mt-3">A more premium shell across the app</h2>
          </div>
          <p className="supporting max-w-2xl text-sm leading-6">
            The shared styles now drive all core routes so the landing page, auth pages, dashboard, admin area, and public share view feel consistent.
          </p>
        </div>
        <div className="section-grid">
          <div className="info-card">
            <p className="title-sm font-semibold">Sharper cards</p>
            <p className="detail mt-2 text-sm leading-6">Glass surfaces, stronger borders, and softer shadows create depth without looking busy.</p>
          </div>
          <div className="info-card">
            <p className="title-sm font-semibold">Clearer hierarchy</p>
            <p className="detail mt-2 text-sm leading-6">Large titles, compact labels, and restrained body text make every page easier to scan.</p>
          </div>
          <div className="info-card">
            <p className="title-sm font-semibold">Device-friendly</p>
            <p className="detail mt-2 text-sm leading-6">Layouts collapse cleanly on mobile while staying spacious on desktop.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
