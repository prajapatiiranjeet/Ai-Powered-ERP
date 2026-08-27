import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const syncThemeWithSystem = () => {
      const isDark = mediaQuery.matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply system preference immediately on load
    syncThemeWithSystem();

    // Listen live to system theme changes (Light/Dark switch)
    try {
      mediaQuery.addEventListener('change', syncThemeWithSystem);
      return () => mediaQuery.removeEventListener('change', syncThemeWithSystem);
    } catch {
      try {
        mediaQuery.addListener(syncThemeWithSystem);
        return () => mediaQuery.removeListener(syncThemeWithSystem);
      } catch {
        // Fallback
      }
    }
  }, []);

  return <AppRoutes />;
}
