'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore storage failures in private browsing mode.
    }
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      className="btn btn-secondary btn-sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      type="button"
    >
      <span aria-hidden="true">{theme === 'dark' ? '◐' : '◑'}</span>
      {theme === 'dark' ? 'Dark' : 'Light'}
    </button>
  );
}
