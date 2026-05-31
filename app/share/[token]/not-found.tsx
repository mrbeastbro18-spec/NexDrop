import Link from 'next/link';

export const metadata = {
  title: 'Share not found — NexDrop'
};

export default function ShareTokenNotFound() {
  return (
    <main className="page-shell">
      <div className="hero-shell items-stretch">
        <div className="hero-copy stack-6">
          <span className="eyebrow">Shared file</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[12ch]">That share link could not be found.</h1>
            <p className="supporting max-w-xl text-base leading-7">The file may have been removed or the link may be stale. Go back to the homepage or dashboard to find another copy.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            <Link className="btn btn-secondary" href="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div className="hero-panel section-card stack-4">
          <div className="title-sm font-semibold">Need another link?</div>
          <p className="detail text-sm leading-6">Return to your dashboard and create a new share from the file row actions.</p>
        </div>
      </div>
    </main>
  );
}
