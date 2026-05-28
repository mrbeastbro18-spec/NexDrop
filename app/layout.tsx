import './globals.css';
import { ThemeToggle } from '@/components/theme-toggle';
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
  title: 'NexDrop',
  description: 'Cloud file transfer and storage platform'
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
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="app-shell">
          <div className="app-shell__ambient app-shell__ambient--one" />
          <div className="app-shell__ambient app-shell__ambient--two" />
          <div className="app-shell__noise" />
          <div className="app-shell__content" id="main">{children}</div>
          <div className="app-shell__theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </body>
    </html>
  );
}
