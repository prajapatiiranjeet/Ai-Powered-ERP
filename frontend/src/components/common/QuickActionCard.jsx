export default function QuickActionCard({ title, description, icon, accent = 'indigo', onClick, disabled = false }) {
  const styles = {
    indigo: 'hover:border-indigo-300 hover:bg-indigo-50/50 group-hover:[&_[data-icon]]:bg-indigo-600 group-hover:[&_[data-icon]]:text-white',
    purple: 'hover:border-purple-300 hover:bg-purple-50/50 group-hover:[&_[data-icon]]:bg-purple-600 group-hover:[&_[data-icon]]:text-white',
    blue: 'hover:border-blue-300 hover:bg-blue-50/50 group-hover:[&_[data-icon]]:bg-blue-600 group-hover:[&_[data-icon]]:text-white',
    teal: 'hover:border-teal-300 hover:bg-teal-50/50 group-hover:[&_[data-icon]]:bg-teal-600 group-hover:[&_[data-icon]]:text-white'
  };
  const iconBg = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group erp-card flex w-full items-center gap-4 p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[accent] ?? styles.indigo}`}
    >
      <div
        data-icon
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition ${iconBg[accent] ?? iconBg.indigo}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{title}</p>
        {description ? <p className="mt-0.5 truncate text-sm text-slate-500">{description}</p> : null}
      </div>
      <svg className="h-5 w-5 flex-shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
      </svg>
    </button>
  );
}
