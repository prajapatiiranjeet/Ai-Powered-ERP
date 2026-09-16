import { NavLink } from 'react-router-dom';

function NavIcon({ name }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    students: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a4 4 0 0 1 3 4v2" /></>,
    faculty: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5h5M18.5 2.5v5" /></>,
    departments: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 11h1m4 0h1m-6 4h1m4 0h1" /></>,
    attendance: <><path d="m5 12 4 4L19 6" /><rect x="3" y="3" width="18" height="18" rx="3" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    academic: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11v5c3 2 7 2 10 0v-5M21 9v6" /></>,
    security: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>
  };
  return <svg aria-hidden="true" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.dashboard}</svg>;
}

export default function Sidebar({ items, role, roleAccent, onNavigate, onClose, open, userEmail, userName }) {
  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
      <aside
          className={`brand-sidebar fixed inset-y-0 left-0 z-50 w-64 transform text-slate-100 shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 p-1 backdrop-blur ring-1 ring-white/20">
            <img
              src="/Mainlogoerp.png"
              alt="New Innovation University logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold uppercase tracking-wide text-white">
              New Innovation University ERP
            </p>
            <span className="inline-flex rounded-md border border-niu-gold-500/30 bg-niu-gold-500/10 px-2 py-0.5 text-[10px] font-bold text-niu-gold-400">
              {role} PORTAL
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 md:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex h-[calc(100%-5rem)] flex-col px-3 py-5">
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    isActive ? 'erp-sidebar-link-active' : 'erp-sidebar-link-inactive'
                  }
                >
                  <NavIcon name={item.icon} />
                  <span className="min-w-0 flex-1 break-words font-medium">{item.label}</span>
                  {item.comingSoon ? (
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-niu-gold-300">
                      Soon
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* User Profile Badge at bottom */}
          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur">
              {userName ? (
                <p className="truncate text-sm font-semibold text-white">{userName}</p>
              ) : null}
              <p className="truncate text-xs text-emerald-200/70">{userEmail ?? '—'}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-niu-gold-400">
                Authorized {role}
              </p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
