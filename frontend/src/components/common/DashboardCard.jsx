export default function DashboardCard({ title, value, icon, accent = 'indigo', description, children }) {
  const borderColors = {
    indigo: 'border-indigo-500',
    purple: 'border-purple-500',
    blue: 'border-blue-500',
    teal: 'border-teal-500',
    emerald: 'border-emerald-500',
    amber: 'border-amber-500',
    rose: 'border-rose-500'
  };
  const bgColors = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
  };
  return (
    <div className={`erp-stat-card ${borderColors[accent] ?? borderColors.indigo}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title ? <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p> : null}
          {value !== undefined && value !== null ? (
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{value}</p>
          ) : null}
          {description ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
          {children ?? null}
        </div>
        {icon ? (
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${bgColors[accent] ?? bgColors.indigo}`}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
