'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useAppStore();

  // On mount, read cookie
  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )theme=([^;]+)'));
    if (match) {
      setTheme(match[2] as 'system' | 'light' | 'dark');
    }
  }, [setTheme]);

  // Apply theme and listen to system changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const activeTheme = theme === 'system' 
        ? (mediaQuery.matches ? 'dark' : 'light') 
        : theme;
      document.body.setAttribute('data-theme', activeTheme);
      document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    };

    applyTheme();

    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Render children immediately (it uses standard CSS variables so slight flash might happen before JS runs, but cookie could be handled in layout later if needed)
  return <>{children}</>;
}
