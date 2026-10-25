import { NavLink } from 'react-router-dom';

function MenuIcon({ name }) {
  const iconPaths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    students: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a4 4 0 0 1 3 4v2"/></>,
    faculty: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5h5M18.5 2.5v5"/></>,
    departments: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 11h1m4 0h1m-6 4h1m4 0h1"/></>,
    attendance: <><path d="m5 12 4 4L19 6"/><rect x="3" y="3" width="18" height="18" rx="3"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    academic: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 11v5c3 2 7 2 10 0v-5M21 9v6"/></>,
    security: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>
  };
  return <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name] ?? iconPaths.dashboard}</svg>;
}

export default function Sidebar({ items, role, onNavigate, onClose, open, userEmail, userName }) {
  const displayName = userName || userEmail || 'Account';
  return <>
    {open ? <button type="button" className="dashboard-sidebar-backdrop" onClick={onClose} aria-label="Close navigation" /> : null}
    <aside className={`brand-sidebar dashboard-sidebar ${open ? 'is-open' : ''}`} aria-label={`${role} workspace`}>
      <div className="dashboard-sidebar__brand">
        <div className="dashboard-sidebar__logo"><img src="/Mainlogoerp.png" alt="" /></div>
        <div className="min-w-0"><p className="dashboard-sidebar__brand-title">NIU Campus</p><p className="dashboard-sidebar__role">{role.toLowerCase()} workspace</p></div>
        <button type="button" onClick={onClose} className="dashboard-sidebar__close" aria-label="Close navigation">×</button>
      </div>
      <nav className="dashboard-sidebar__nav" aria-label="Main navigation">
        <p className="dashboard-sidebar__section-label">Workspace</p>
        <ul>
          {items.map((item) => <li key={item.path}>
            {item.comingSoon ? (
              <div className="dashboard-nav-disabled" aria-disabled="true"><MenuIcon name={item.icon}/><span>{item.label}</span><span className="dashboard-nav-disabled__badge">Soon</span></div>
            ) : (
              <NavLink to={item.path} onClick={onNavigate} end={item.end} className={({ isActive }) => `dashboard-nav-link${isActive ? ' is-active' : ''}`}>
                <MenuIcon name={item.icon}/><span>{item.label}</span>
              </NavLink>
            )}
          </li>)}
        </ul>
      </nav>
      <div className="dashboard-sidebar__account">
        <div className="dashboard-sidebar__avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</div>
        <div className="min-w-0"><p className="dashboard-sidebar__account-name">{displayName}</p><p className="dashboard-sidebar__account-email">{userEmail || 'Signed in'}</p></div>
      </div>
    </aside>
  </>;
}
