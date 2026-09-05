'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { applyTheme, defaultTheme, themes, themeStorageKey, type Theme } from '@/lib/themes';

let memoryTheme = defaultTheme.id;
function snapshot() {
  try {
    return localStorage.getItem(themeStorageKey) ?? memoryTheme;
  } catch {
    return memoryTheme;
  }
}
function subscribe(callback: () => void) {
  const sync = () => {
    applyTheme(themes.find((t) => t.id === snapshot()) ?? defaultTheme);
    callback();
  };
  window.addEventListener('storage', sync);
  window.addEventListener('strata-theme', sync);
  return () => {
    window.removeEventListener('storage', sync);
    window.removeEventListener('strata-theme', sync);
  };
}
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({
  theme: defaultTheme,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const id = useSyncExternalStore(subscribe, snapshot, () => defaultTheme.id);
  const theme = themes.find((theme) => theme.id === id) ?? defaultTheme;
  const setTheme = (next: Theme) => {
    memoryTheme = next.id;
    try {
      localStorage.setItem(themeStorageKey, next.id);
    } catch {
      /* Session-only when storage is unavailable. */
    }
    applyTheme(next);
    window.dispatchEvent(new Event('strata-theme'));
  };
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
