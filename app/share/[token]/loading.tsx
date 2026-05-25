export default function Loading() {
  return (
    <main className="page-shell" aria-busy="true" aria-label="Loading shared file">
      <div className="hero-shell items-stretch">
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-12 w-3/5" />
          <div className="skeleton h-6 w-4/5" />
          <div className="skeleton h-11 w-36 rounded-full" />
        </div>
        <div className="section-card stack-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-24 w-full rounded-[20px]" />
          <div className="skeleton h-24 w-full rounded-[20px]" />
        </div>
      </div>
    </main>
  );
}