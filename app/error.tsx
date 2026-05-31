"use client";

import Head from 'next/head';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <main className="page-shell">
      <Head>
        <title>Error — NexDrop</title>
      </Head>
      <div className="hero-shell items-stretch">
        <div className="hero-copy stack-6">
          <span className="eyebrow">Something went wrong</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[12ch]">An unexpected error occurred.</h1>
            <p className="supporting max-w-xl text-base leading-7">Try refreshing the page or return to the homepage. If the problem persists, contact support.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={reset} type="button">Try again</button>
            <Link className="btn btn-secondary" href="/">Home</Link>
          </div>
        </div>
        <div className="hero-panel section-card stack-4">
          <div className="title-sm font-semibold">Need help?</div>
          <p className="detail text-sm leading-6">Return to the dashboard or try again after a moment.</p>
        </div>
      </div>
    </main>
  );
}
