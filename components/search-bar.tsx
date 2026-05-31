'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Search, File as FileIcon, Loader2 } from 'lucide-react';

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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" aria-hidden />
        <input
          id="search"
          aria-label="Search files"
          placeholder="Search files..."
          className="search-input pl-10"
          value={q}
          onChange={(e) => { setQ(e.target.value); scheduleSearch(e.target.value); }}
        />
      </div>
      {results && (
        <div className="search-results absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-[18px] border border-[color:var(--border-strong)] bg-[color:var(--panel-strong)] shadow-[14px_14px_0_rgba(30,36,48,0.16)] md:left-auto md:right-0 md:w-[28rem]">
          {loading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-[color:var(--muted)]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </div>
          ) : null}
          {!loading && results.length === 0 ? <div className="p-4 text-sm text-[color:var(--muted)]">No results</div> : null}
          {results.map((r) => (
            <Link key={r.id} href={`/dashboard`} className="search-result-item flex items-center gap-3 border-b border-[color:var(--border)] px-4 py-3 last:border-b-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--accent)_8%,var(--panel))] text-[color:var(--accent-strong)]">
                <FileIcon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{r.originalName}</div>
                <div className="text-xs text-[color:var(--muted)]">{r.size} • {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
