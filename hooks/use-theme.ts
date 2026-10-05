'use client';

import { useSyncExternalStore, useCallback, useEffect } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('theme-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('theme-change', callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): boolean {
  try {
    const saved = localStorage.getItem('sentinel_theme');
    if (saved !== null) return saved === 'dark';
  } catch {}
  return true;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sync the dark class to html document whenever isDark changes on client
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const nextVal = !getSnapshot();
    try {
      localStorage.setItem('sentinel_theme', nextVal ? 'dark' : 'light');
    } catch {}
    document.documentElement.classList.toggle('dark', nextVal);
    window.dispatchEvent(new Event('theme-change'));
  }, []);

  return { isDark, toggleTheme };
}
