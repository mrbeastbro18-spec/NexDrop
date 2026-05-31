import Link from 'next/link';

type LogoProps = {
  href?: string;
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ href = '/', className = '', showWordmark = true }: LogoProps) {
  const logo = (
    <>
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="presentation" focusable="false">
          <path
            d="M18 50H13C6.9 50 2 45.1 2 39s4.9-11 11-11c1.1 0 2.2.2 3.3.5C17.4 18.1 25.5 11 35.5 11c9.4 0 17.2 6.4 19.8 15.1C60.2 26.1 64 30.5 64 36c0 7.2-5.8 13-13 13H48"
            fill="none"
            stroke="url(#nd-cloud-gradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M20 27h18l7 7v22H20z" fill="#15347a" />
          <path
            d="M38 27v7h7"
            fill="none"
            stroke="#eff5ff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 48V34"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M22 40l8-8 8 8"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="nd-cloud-gradient" x1="6" y1="10" x2="58" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e88ff" />
              <stop offset="1" stopColor="#3a6cff" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      {showWordmark ? (
        <span className="logo-wordmark" aria-label="NexDrop">
          <span className="logo-wordmark__dark">Nex</span>
          <span className="logo-wordmark__blue">Drop</span>
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={`logo ${className}`}>{logo}</div>;
  }

  return (
    <Link href={href} className={`logo ${className}`} aria-label="NexDrop home">
      {logo}
    </Link>
  );
}