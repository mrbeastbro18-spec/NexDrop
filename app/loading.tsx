export default function Loading() {
  return (
    <main className="page-shell stack-8 pt-5" aria-busy="true" aria-label="Loading page">
      <div className="section-card stack-4">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-12 w-3/5" />
        <div className="skeleton h-6 w-4/5" />
        <div className="flex gap-3">
          <div className="skeleton h-11 w-32 rounded-full" />
          <div className="skeleton h-11 w-28 rounded-full" />
        </div>
      </div>
      <div className="hero-shell">
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
        </div>
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    </main>
  );
}