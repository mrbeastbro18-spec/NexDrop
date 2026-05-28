export default function Loading() {
  return (
    <main className="page-shell stack-8 pb-12" aria-busy="true" aria-label="Loading dashboard">
      <div className="hero-shell">
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-36" />
          <div className="skeleton h-12 w-3/5" />
          <div className="skeleton h-6 w-4/5" />
        </div>
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
      <div className="section-card stack-4">
        <div className="skeleton h-4 w-32" />
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="skeleton h-36 w-full rounded-[24px]" />
          <div className="skeleton h-36 w-full rounded-[24px]" />
          <div className="skeleton h-36 w-full rounded-[24px]" />
          <div className="skeleton h-36 w-full rounded-[24px]" />
        </div>
      </div>
    </main>
  );
}