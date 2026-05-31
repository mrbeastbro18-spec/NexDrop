import Link from 'next/link';
import { Logo } from './logo';

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  links?: Array<{ href: string; label: string }>;
};

export function LegalPage({ eyebrow, title, intro, sections, links = [] }: LegalPageProps) {
  return (
    <main className="page-shell stack-6">
      <header className="glass-nav card nav-shell">
        <Logo />
        <div className="nav-links text-sm">
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </div>
      </header>

      <section className="hero-shell items-stretch">
        <div className="hero-copy stack-5">
          <span className="eyebrow">{eyebrow}</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[30ch]">{title}</h1>
            <p className="supporting max-w-3xl text-base leading-7">{intro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/">Home</Link>
            {links.map((link) => (
              <Link key={link.href} className="btn btn-secondary" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hero-panel stack-4">
          {sections.slice(0, 4).map((section) => (
            <div key={section.title} className="section-card stack-3">
              <p className="title-sm font-semibold">{section.title}</p>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="detail text-sm leading-6">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section-card stack-4">
        <span className="eyebrow">Details</span>
        <div className="section-grid">
          {sections.map((section) => (
            <div key={section.title} className="info-card">
              <p className="title-sm font-semibold">{section.title}</p>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="detail mt-2 text-sm leading-6">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}