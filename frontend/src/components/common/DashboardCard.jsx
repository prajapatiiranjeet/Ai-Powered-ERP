export default function DashboardCard({ title, value, icon, accent = 'indigo', description, children }) {
  return (
    <div className="erp-stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title ? <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p> : null}
          {value !== undefined && value !== null ? (
            <p className="mt-2 break-words text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{value}</p>
          ) : null}
          {description ? <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
          {children ?? null}
        </div>
        {icon ? (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-niu-green-50 text-niu-green-700 ring-1 ring-niu-green-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700/40">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
