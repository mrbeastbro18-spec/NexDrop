import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell stack-10 pt-5">
      <header className="glass-nav card nav-shell">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="brand-mark">N</span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">NexDrop</div>
              <div className="meta text-xs">Classic cloud storage for teams</div>
            </div>
          </Link>
        </div>
        <nav className="nav-links text-sm" aria-label="Public navigation">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </nav>
      </header>

      <section className="hero-shell">
        <div className="hero-copy stack-6">
          <span className="eyebrow">Cloud transfer workspace</span>
          <div className="stack-4">
            <h1 className="title-xl max-w-[11ch]">Ship files like a modern cloud workspace.</h1>
            <p className="supporting max-w-2xl text-lg leading-8">
              NexDrop blends the clarity of Google Drive with the share-first feel of MediaFire. Upload files, organize work, create share links, and move fast on desktop or mobile.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/register">Create account</Link>
            <Link className="btn btn-secondary" href="/login">Sign in</Link>
            <Link className="btn btn-ghost" href="/dashboard">Open dashboard</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="info-card">
              <div className="stat-number">10GB</div>
              <p className="detail mt-1 text-sm">Starter storage for new accounts</p>
            </div>
            <div className="info-card">
              <div className="stat-number">1 click</div>
              <p className="detail mt-1 text-sm">Share links from the dashboard</p>
            </div>
            <div className="info-card">
              <div className="stat-number">24/7</div>
              <p className="detail mt-1 text-sm">Access across phone and desktop</p>
            </div>
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

      <section className="hero-shell">
        <div className="section-card stack-5">
          <span className="eyebrow">Workspace flow</span>
          <div className="stack-4">
            <h2 className="title-lg max-w-[12ch]">A simple path from upload to share.</h2>
            <p className="supporting text-base leading-7">The interface keeps familiar file-app patterns while giving the important actions more hierarchy and breathing room.</p>
          </div>
          <div className="section-grid">
            <div className="feature-card">
              <p className="title-sm font-semibold">1. Upload</p>
              <p className="detail mt-2 text-sm leading-6">Add files from any device with progress feedback and quota awareness.</p>
            </div>
            <div className="feature-card">
              <p className="title-sm font-semibold">2. Organize</p>
              <p className="detail mt-2 text-sm leading-6">Keep track of files, preview items, and manage access in one place.</p>
            </div>
            <div className="feature-card">
              <p className="title-sm font-semibold">3. Share</p>
              <p className="detail mt-2 text-sm leading-6">Create clean links for downloads, clients, and team handoffs.</p>
            </div>
          </div>
        </div>
        <div className="section-card stack-5">
          <span className="eyebrow">Responsive by default</span>
          <div className="stack-4">
            <h2 className="title-lg max-w-[12ch]">Built to look steady on every screen.</h2>
            <p className="supporting text-base leading-7">Cards, spacing, and action groups collapse cleanly on mobile while staying wide and readable on desktop.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="info-card">
              <p className="title-sm font-semibold">Mobile</p>
              <p className="detail mt-2 text-sm leading-6">Stacks content, stretches buttons, and keeps key actions easy to tap.</p>
            </div>
            <div className="info-card">
              <p className="title-sm font-semibold">Desktop</p>
              <p className="detail mt-2 text-sm leading-6">Uses the wider viewport for clearer hierarchy and calmer scanning.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-shell">
        <div className="section-card stack-5">
          <span className="eyebrow">How it works</span>
          <div className="section-grid">
            <div className="feature-card">
              <span className="pill">01</span>
              <p className="title-sm mt-3 font-semibold">Upload in the dashboard</p>
              <p className="detail mt-2 text-sm leading-6">Drag and drop files, monitor progress, and stay within quota limits.</p>
            </div>
            <div className="feature-card">
              <span className="pill">02</span>
              <p className="title-sm mt-3 font-semibold">Create a share link</p>
              <p className="detail mt-2 text-sm leading-6">Publish a clean link for colleagues, clients, or public downloads.</p>
            </div>
            <div className="feature-card">
              <span className="pill">03</span>
              <p className="title-sm mt-3 font-semibold">Track everything</p>
              <p className="detail mt-2 text-sm leading-6">Manage files, shares, and admin tools from one familiar place.</p>
            </div>
          </div>
        </div>
        <div className="section-card stack-5">
          <span className="eyebrow">Designed for teams</span>
          <div className="stack-4">
            <h2 className="title-lg max-w-[13ch]">Classic layout, modern behavior.</h2>
            <p className="supporting text-base leading-7">
              The interface keeps the familiar structure people expect from file apps, but it adds cleaner spacing, stronger hierarchy, and a more premium visual style.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/register">Start free</Link>
            <Link className="btn btn-secondary" href="/dashboard">See dashboard</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
