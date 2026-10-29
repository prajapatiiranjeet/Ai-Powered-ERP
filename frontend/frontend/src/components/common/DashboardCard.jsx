export default function DashboardCard({ title, value, icon, accent = 'indigo', description, children }) {
  return (
    <article className={`dashboard-metric-card dashboard-metric-card--${accent}`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title ? <p className="dashboard-metric-card__title">{title}</p> : null}
          {value !== undefined && value !== null ? <p className="dashboard-metric-card__value">{value}</p> : null}
          {description ? <p className="dashboard-metric-card__description">{description}</p> : null}
          {children ?? null}
        </div>
        {icon ? <div className="dashboard-action-link__icon">{icon}</div> : null}
      </div>
    </article>
  );
}
