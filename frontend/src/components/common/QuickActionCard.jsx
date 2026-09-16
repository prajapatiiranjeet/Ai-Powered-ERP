export default function QuickActionCard({ title, description, icon, accent = 'indigo', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group erp-action-card flex w-full items-center gap-4 p-5 text-left disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div
        data-icon
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-niu-green-50 text-niu-green-700 ring-1 ring-niu-green-200 transition-colors group-hover:bg-niu-green-600 group-hover:text-white dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700/40 dark:group-hover:bg-emerald-600 dark:group-hover:text-white"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        {description ? <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      <svg className="h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-niu-green-700 dark:text-slate-500 dark:group-hover:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
      </svg>
    </button>
  );
}
