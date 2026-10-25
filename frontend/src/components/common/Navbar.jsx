import { useEffect, useState } from 'react';

function readInitialTheme() {
  try {
    const stored = localStorage.getItem('niu-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  } catch {
    return false;
  }
}

export default function Navbar({ title, subtitle, userEmail, userName, onLogout, onMenuToggle }) {
  const [darkMode, setDarkMode] = useState(readInitialTheme);
  const initials = (userName || userEmail || '?').trim().charAt(0).toUpperCase();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    let preference = null;
    try { preference = localStorage.getItem('niu-theme'); } catch { /* Storage is optional. */ }
    if (preference === 'dark' || preference === 'light') return undefined;
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const syncSystemTheme = (event) => setDarkMode(event.matches);
    media.addEventListener?.('change', syncSystemTheme);
    return () => media.removeEventListener?.('change', syncSystemTheme);
  }, []);
  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    try { localStorage.setItem('niu-theme', next ? 'dark' : 'light'); } catch { /* Theme preference is optional. */ }
  };

  return <header className="dashboard-topbar">
    <button type="button" className="dashboard-menu-button" onClick={onMenuToggle} aria-label="Open navigation menu">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <div className="min-w-0 flex-1"><p className="dashboard-topbar__title">{title}</p>{subtitle ? <p className="dashboard-topbar__subtitle">{subtitle}</p> : null}</div>
    <div className="dashboard-topbar__identity"><div className="dashboard-topbar__avatar" aria-hidden="true">{initials}</div><div className="min-w-0"><p className="dashboard-topbar__name">{userName || 'Account'}</p><p className="dashboard-topbar__email">{userEmail || '—'}</p></div></div>
    <button type="button" className="dashboard-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
      {darkMode ? <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg> : <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z"/></svg>}
    </button>
    <button type="button" onClick={onLogout} className="dashboard-signout" title="Sign out">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg><span>Sign out</span>
    </button>
  </header>;
}
