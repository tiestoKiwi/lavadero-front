import { money, tone } from "../utils/formatters";

export default function ReservationsView({
  reservations,
  search,
  statusFilter,
  locationFilter,
  statusOptions,
  locationOptions,
  onSearchChange,
  onStatusFilterChange,
  onLocationFilterChange,
}) {
  return (
    <section className="section-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Centro operativo</p>
          <h3>Reservas del dia</h3>
        </div>
        <span className="section-note">{reservations.length} resultados visibles</span>
      </div>
      <div className="filters-row">
        <label>Buscar<input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Cliente, placa o reserva" /></label>
        <label>Estado<select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Sede<select value={locationFilter} onChange={(event) => onLocationFilterChange(event.target.value)}>{locationOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <div className="reservations-list">
        {reservations.map((item) => (
          <article key={item.id} className="reservation-row">
            <div className="reservation-main">
              <div className="reservation-header">
                <div>
                  <p className="reservation-id">{item.id}</p>
                  <h4>{item.customer}</h4>
                </div>
                <span className={`status-badge ${tone(item.status)}`}>{item.status}</span>
              </div>
              <p className="reservation-service">{item.service}</p>
              <div className="reservation-meta">
                <span>{item.time}</span>
                <span>{item.duration}</span>
                <span>{item.location}</span>
                <span>{item.channel}</span>
              </div>
            </div>
            <div className="reservation-side">
              <p>{item.vehicle}</p>
              <small>Placa {item.plate}</small>
              <strong>{money.format(item.ticket)}</strong>
              <small>{item.payment}</small>
              <small>{item.staff}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
