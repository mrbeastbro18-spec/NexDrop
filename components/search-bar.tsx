'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const timeout = useRef<number | null>(null);

  function scheduleSearch(val: string) {
    if (timeout.current) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => doSearch(val), 300);
  }

  async function doSearch(val: string) {
    if (!val.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/files/search?q=${encodeURIComponent(val)}&perPage=6`);
      const data = await res.json();
      if (res.ok) setResults(data.files || []);
      else setResults([]);
    } catch (err) {
      setResults([]);
    } finally { setLoading(false); }
  }

  return (
    <div className="relative">
      <label htmlFor="search" className="sr-only">Search files</label>
      <input
        id="search"
        aria-label="Search files"
        placeholder="Search files..."
        className="search-input"
        value={q}
        onChange={(e) => { setQ(e.target.value); scheduleSearch(e.target.value); }}
      />
      {results && (
        <div className="search-results absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] shadow-[0_22px_55px_rgba(15,23,42,0.16)] md:left-auto md:right-0 md:w-96">
          {loading ? <div className="p-3 text-sm text-[color:var(--muted)]">Searching…</div> : null}
          {results.length === 0 ? <div className="p-3 text-sm text-[color:var(--muted)]">No results</div> : null}
          {results.map((r) => (
            <Link key={r.id} href={`/dashboard`} className="search-result-item block border-b border-[var(--border)] px-3 py-2 last:border-b-0">
              <div className="text-sm font-medium">{r.originalName}</div>
              <div className="text-xs text-[color:var(--muted)]">{r.size} • {new Date(r.createdAt).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
