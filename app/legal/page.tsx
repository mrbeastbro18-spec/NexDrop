import Link from 'next/link';
import { Logo } from '@/components/logo';

const policies = [
  ['Terms of Service', '/legal/terms'],
  ['Privacy Policy', '/legal/privacy'],
  ['Cookie Policy', '/legal/cookie-policy'],
  ['Acceptable Use Policy', '/legal/acceptable-use'],
  ['Copyright Policy', '/legal/copyright-policy'],
  ['DMCA / IP Policy', '/legal/ip-infringement'],
  ['Data Protection Policy', '/legal/data-compliance'],
  ['Data Retention Policy', '/legal/data-retention'],
  ['Content Removal Policy', '/legal/content-removal'],
  ['Abuse Reporting Policy', '/legal/abuse-reporting'],
  ['Security Disclosure Policy', '/legal/security-disclosure']
] as const;

export default function LegalIndexPage() {
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
          <span className="eyebrow">Legal</span>
          <div className="stack-4">
            <h1 className="title-lg max-w-[28ch]">Policies and notices for NexDrop.</h1>
            <p className="supporting max-w-3xl text-base leading-7">This hub collects the platform policies that govern account use, privacy, retention, abuse handling, security reporting, and content removal.</p>
          </div>
        </div>
        <div className="hero-panel stack-4">
          <div className="section-card stack-4">
            <p className="title-sm font-semibold">Policy set</p>
            <p className="detail text-sm leading-6">Each page is written for product use and can be adapted to a production deployment without placeholder-only content.</p>
          </div>
        </div>
      </section>

      <section className="section-card stack-4">
        <span className="eyebrow">Policies</span>
        <div className="section-grid">
          {policies.map(([label, href]) => (
            <Link key={href} href={href} className="feature-card">
              <p className="title-sm font-semibold">{label}</p>
              <p className="detail mt-2 text-sm leading-6">Open policy</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}