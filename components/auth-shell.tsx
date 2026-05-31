import Link from 'next/link';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="page-shell">
      <div className="hero-shell items-stretch">
        <aside className="auth-aside hidden overflow-hidden p-6 lg:flex lg:flex-col lg:justify-between">
          <div className="stack-4">
            <span className="eyebrow">{eyebrow}</span>
            <div className="stack-4">
              <h1 className="title-xl max-w-[12ch]">{title}</h1>
              <p className="supporting max-w-xl text-base leading-7">{description}</p>
            </div>
          </div>

          <div className="stack-4">
            <div className="section-card p-4">
              <p className="title-sm font-semibold">Fast file delivery</p>
              <p className="detail mt-2 text-sm leading-6">Upload, preview, and share files with a clean, MediaFire-style workflow.</p>
            </div>
            <div className="section-card p-4">
              <p className="title-sm font-semibold">Built for clarity</p>
              <p className="detail mt-2 text-sm leading-6">Large touch targets, stronger contrast, and focused actions across the app.</p>
            </div>
          </div>
        </aside>

        <section className="auth-panel p-5 sm:p-6 lg:p-8">
          <div className="lg:hidden stack-4">
            <span className="eyebrow">{eyebrow}</span>
            <div className="stack-4">
              <h1 className="title-lg">{title}</h1>
              <p className="supporting text-base leading-7">{description}</p>
            </div>
          </div>

          <div className="mt-6 lg:mt-0">{children}</div>
          <div className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[color:var(--muted)]">{footer}</div>
        </section>
      </div>
    </main>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="link-strong" href={href}>
      {children}
    </Link>
  );
}