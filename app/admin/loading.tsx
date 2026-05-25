export default function Loading() {
  return (
    <main className="page-shell stack-8 pb-12" aria-busy="true" aria-label="Loading admin page">
      <div className="hero-shell">
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-12 w-3/5" />
          <div className="skeleton h-6 w-4/5" />
        </div>
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-40 w-full rounded-[24px]" />
          <div className="skeleton h-40 w-full rounded-[24px]" />
        </div>
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-11 w-40 rounded-full" />
        </div>
      </div>
    </main>
  );
}