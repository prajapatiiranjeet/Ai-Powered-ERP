import { NavLink } from 'react-router-dom';

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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-niu-green-800 via-niu-green-900 to-[#06120b] text-slate-100 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with NIU Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 p-1 backdrop-blur ring-1 ring-white/20">
            <img
              src="/noida-international-university-logo-png_seeklogo-505931-removebg-preview.png"
              alt="NIU Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold uppercase tracking-wide text-white">
              NIU ERP
            </p>
            <span className="inline-flex rounded-md border border-niu-gold-500/30 bg-niu-gold-500/10 px-2 py-0.5 text-[10px] font-bold text-niu-gold-400">
              {role} PORTAL
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 lg:hidden"
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
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="flex-1 truncate font-medium">{item.label}</span>
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
