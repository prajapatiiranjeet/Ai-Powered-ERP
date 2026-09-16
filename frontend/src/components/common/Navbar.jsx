export default function Navbar({ title, subtitle, userEmail, userName, onLogout, onMenuToggle, roleAccent }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-emerald-500/15 dark:bg-slate-900/95 md:gap-4 md:px-8">
      <button
        type="button"
        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M2 6.75A.75.75 0 012.75 6h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 6.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 3.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Brand Header Title */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <img
            src="/Mainlogoerp.png"
            alt="New Innovation University logo"
            className="h-9 w-9 object-contain"
          />
          <h1 className="truncate text-lg font-bold text-slate-900 md:text-xl">{title}</h1>
        </div>
        {subtitle ? <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 md:block">{subtitle}</p> : null}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* User Badge */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pl-3 dark:border-emerald-500/20 dark:bg-slate-800/70 dark:text-slate-100 md:gap-3 md:pl-3.5">
          <div className="hidden min-w-0 text-right md:block">
            {userName ? <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{userName}</p> : null}
            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{userEmail ?? '—'}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-niu-green-600 to-niu-green-800 text-xs font-black text-niu-gold-400 shadow-sm ring-2 ring-niu-gold-400/50">
            {(userName ?? userEmail ?? '?').charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="erp-btn-secondary hidden !px-3.5 !py-2 text-xs font-semibold text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 md:inline-flex"
          title="Sign out"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114L8.704 10.75h9.546A.75.75 0 0019 10z"
              clipRule="evenodd"
            />
          </svg>
          Logout
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Sign out"
          title="Sign out"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114L8.704 10.75h9.546A.75.75 0 0019 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
