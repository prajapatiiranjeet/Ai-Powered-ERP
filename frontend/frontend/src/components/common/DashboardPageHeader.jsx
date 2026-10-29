export default function DashboardPageHeader({ eyebrow, title, description, actions, meta }) {
  return (
    <header className="dashboard-page-header">
      <div className="min-w-0">
        {eyebrow ? <p className="dashboard-eyebrow">{eyebrow}</p> : null}
        <h1 className="dashboard-page-title">{title}</h1>
        {description ? <p className="dashboard-page-description">{description}</p> : null}
      </div>
      {(meta || actions) ? <div className="dashboard-page-header__aside">{meta}{actions}</div> : null}
    </header>
  );
}
