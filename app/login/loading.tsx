export default function Loading() {
  return (
    <main className="page-shell" aria-busy="true" aria-label="Loading sign in page">
      <div className="hero-shell items-stretch">
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-12 w-3/5" />
          <div className="skeleton h-6 w-4/5" />
        </div>
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-11 w-full rounded-full" />
        </div>
      </div>
    </main>
  );
}