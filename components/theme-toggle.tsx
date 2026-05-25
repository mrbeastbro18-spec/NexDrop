'use client';

import { useEffect, useSyncExternalStore } from 'react';

export function ThemeToggle() {
  const subscribe = (onStoreChange: () => void) => {
    window.addEventListener('storage', onStoreChange);
    window.addEventListener('themechange', onStoreChange);
    return () => {
      window.removeEventListener('storage', onStoreChange);
      window.removeEventListener('themechange', onStoreChange);
    };
  };
  const theme = useSyncExternalStore(
    subscribe,
    () => {
      try {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch {
        return 'light';
      }
    },
    () => 'light'
  );

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
      onClick={() => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem('theme', nextTheme);
        } catch {
          // Ignore storage failures in private browsing mode.
        }
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        document.documentElement.style.colorScheme = nextTheme;
        window.dispatchEvent(new Event('themechange'));
      }}
      type="button"
    >
      <span aria-hidden="true">{theme === 'dark' ? '◐' : '◑'}</span>
      {theme === 'dark' ? 'Dark' : 'Light'}
    </button>
  );
}
