export default function QuickActionCard({ title, description, icon, accent = 'indigo', onClick, disabled = false }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`group erp-action-card flex min-h-[88px] w-full items-center gap-4 p-4 text-left disabled:cursor-not-allowed disabled:opacity-60 dashboard-action-${accent}`}>
      <span className="dashboard-action-link__icon">{icon}</span>
      <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-slate-900 dark:text-white">{title}</span>{description ? <span className="mt-1 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">{description}</span> : null}</span>
      <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/></svg>
    </button>
  );
}
