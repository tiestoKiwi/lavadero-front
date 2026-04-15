export default function CatalogCards({ items, formatter }) {
  return (
    <div className="card-grid">
      {items.map((item) => (
        <article key={item.id ?? item.name} className="catalog-card">
          <p>{item.name}</p>
          <strong>{formatter ? formatter(item) : item.segment ?? item.margin ?? item.occupancy ?? item.value}</strong>
          <span>{item.nextReservation ?? item.duration ?? item.capacity ?? item.secondary ?? ""}</span>
          <small>{item.notes ?? item.note ?? item.status ?? ""}</small>
        </article>
      ))}
    </div>
  );
}
