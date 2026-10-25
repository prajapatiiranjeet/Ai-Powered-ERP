export default function CohortContextRail({ items, label = 'Academic context' }) {
  const visibleItems = items.filter((item) => item.value && item.value !== '—');
  if (visibleItems.length === 0) return null;

  return (
    <section className="cohort-context-rail" aria-label={label}>
      <span className="cohort-context-rail__mark" aria-hidden="true">↗</span>
      <dl className="cohort-context-rail__items">
        {visibleItems.map(({ label: itemLabel, value }) => (
          <div className="cohort-context-rail__item" key={itemLabel}>
            <dt>{itemLabel}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
