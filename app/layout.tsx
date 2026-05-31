import './globals.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Manrope, Space_Grotesk } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display'
});

export const metadata = {
  title: {
    default: 'NexDrop',
    template: '%s | NexDrop'
  },
  description: 'NexDrop is a secure file storage, sharing, and admin platform with chunked uploads, verification, and polished account tools.',
  keywords: ['file storage', 'secure uploads', 'file sharing', 'admin dashboard', 'Next.js'],
  openGraph: {
    title: 'NexDrop',
    description: 'Secure file storage, sharing, and admin tools in one polished workspace.',
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f4f1ea" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0b1020" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="app-shell">
          <div className="app-shell__ambient app-shell__ambient--one" />
          <div className="app-shell__ambient app-shell__ambient--two" />
          <div className="app-shell__noise" />

          <header className="glass-nav card nav-shell">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            <div className="nav-links text-sm">
              <Link href="/login">Sign in</Link>
              <Link href="/register">Create account</Link>
            </div>
          </header>

          <div className="app-shell__content" id="main">{children}</div>
          <div className="app-shell__theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </body>
    </html>
  );
}
