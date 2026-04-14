import React, { useMemo, useState } from "react";

const reservations = [
  {
    id: "RES-2401",
    customer: "Andrea Pardo",
    vehicle: "Mazda CX-5",
    plate: "KXR219",
    location: "Chapinero",
    channel: "App movil",
    status: "en proceso",
    time: "08:30",
    duration: "55 min",
    ticket: 78000,
    payment: "Pagado",
    staff: "Equipo Norte",
    service: "Lavado premium + motor",
  },
  {
    id: "RES-2402",
    customer: "Carlos Varela",
    vehicle: "Renault Logan",
    plate: "JTW441",
    location: "Cedritos",
    channel: "WhatsApp",
    status: "confirmada",
    time: "09:10",
    duration: "40 min",
    ticket: 46000,
    payment: "Pendiente",
    staff: "Equipo Express",
    service: "Lavado basico",
  },
  {
    id: "RES-2403",
    customer: "Marta Rueda",
    vehicle: "Toyota Prado",
    plate: "KLO880",
    location: "Chapinero",
    channel: "Recepcion",
    status: "completada",
    time: "07:40",
    duration: "70 min",
    ticket: 124000,
    payment: "Pagado",
    staff: "Equipo Detail",
    service: "Detail interior",
  },
  {
    id: "RES-2404",
    customer: "Logistica Delta",
    vehicle: "Nissan Frontier",
    plate: "FLT552",
    location: "Zona Industrial",
    channel: "Web admin",
    status: "confirmada",
    time: "10:00",
    duration: "60 min",
    ticket: 98000,
    payment: "Facturar",
    staff: "Equipo Flotas",
    service: "Lavado flota ejecutiva",
  },
  {
    id: "RES-2405",
    customer: "Sara Ospina",
    vehicle: "Kia Picanto",
    plate: "MFP203",
    location: "Cedritos",
    channel: "App movil",
    status: "pendiente",
    time: "10:25",
    duration: "35 min",
    ticket: 38000,
    payment: "Pendiente",
    staff: "Por asignar",
    service: "Lavado rapido",
  },
  {
    id: "RES-2406",
    customer: "Grupo Nova",
    vehicle: "Chevrolet Tracker",
    plate: "NVA901",
    location: "Chapinero",
    channel: "Asesor comercial",
    status: "no show",
    time: "08:50",
    duration: "45 min",
    ticket: 62000,
    payment: "Sin cobro",
    staff: "Equipo Norte",
    service: "Lavado premium",
  },
];

const priorityCards = [
  {
    title: "Capacidad del dia",
    value: "82%",
    note: "49 de 60 cupos ya tienen movimiento operativo.",
  },
  {
    title: "Tiempo promedio",
    value: "47 min",
    note: "Bajamos 6 min frente al cierre de ayer.",
  },
  {
    title: "Pendientes por cobrar",
    value: "$184k",
    note: "Tres reservas requieren cierre de caja o factura.",
  },
];

const customerSignals = [
  {
    name: "Logistica Delta",
    value: "12 servicios este mes",
    note: "Cuenta corporativa con ticket promedio alto.",
  },
  {
    name: "Andrea Pardo",
    value: "3 visitas en 14 dias",
    note: "Cliente frecuente con alta aceptacion de adicionales.",
  },
  {
    name: "Grupo Nova",
    value: "1 alerta activa",
    note: "Registrar seguimiento por inasistencia de hoy.",
  },
];

const teamBoard = [
  { team: "Equipo Norte", progress: 86, focus: "Sostener puntualidad en Chapinero" },
  { team: "Equipo Express", progress: 64, focus: "Reducir tiempos muertos entre reservas" },
  { team: "Equipo Detail", progress: 91, focus: "Cerrar ordenes premium antes de las 3 pm" },
  { team: "Equipo Flotas", progress: 72, focus: "Preparar bloque corporativo de mediodia" },
];

const dayTimeline = [
  {
    time: "08:30",
    title: "Pico de ingreso matutino",
    detail: "Chapinero concentra el mayor flujo y ya opera con dos bahias activas.",
  },
  {
    time: "10:00",
    title: "Bloque corporativo",
    detail: "Reserva de flota con margen alto y prioridad de facturacion.",
  },
  {
    time: "12:30",
    title: "Ventana de redistribucion",
    detail: "Momento ideal para mover personal a Cedritos si sigue la demanda.",
  },
];

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function statusTone(status) {
  return status
    .toLowerCase()
    .replaceAll(" ", "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function App() {
  const [activeView, setActiveView] = useState("reservas");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [locationFilter, setLocationFilter] = useState("todas");
  const [search, setSearch] = useState("");

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesStatus =
        statusFilter === "todas" || reservation.status === statusFilter;
      const matchesLocation =
        locationFilter === "todas" || reservation.location === locationFilter;
      const matchesSearch =
        search.trim() === "" ||
        `${reservation.customer} ${reservation.vehicle} ${reservation.plate} ${reservation.id}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesStatus && matchesLocation && matchesSearch;
    });
  }, [locationFilter, search, statusFilter]);

  const metrics = useMemo(() => {
    const completed = reservations.filter(
      (reservation) => reservation.status === "completada",
    );
    const inProgress = reservations.filter(
      (reservation) => reservation.status === "en proceso",
    );
    const pendingPayment = reservations.filter(
      (reservation) => reservation.payment === "Pendiente",
    );
    const revenue = reservations.reduce(
      (total, reservation) =>
        reservation.status === "no show" ? total : total + reservation.ticket,
      0,
    );

    return {
      reservationsToday: reservations.length,
      activeNow: inProgress.length,
      completedToday: completed.length,
      revenueToday: revenue,
      avgTicket: Math.round(revenue / Math.max(reservations.length - 1, 1)),
      noShowRate: `${Math.round((1 / reservations.length) * 100)}%`,
      pendingPayments: pendingPayment.length,
    };
  }, []);

  const locations = ["todas", ...new Set(reservations.map((item) => item.location))];
  const statuses = ["todas", ...new Set(reservations.map((item) => item.status))];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Lavadero Admin</p>
          <h1>Operacion con foco en reservas y valor diario.</h1>
          <p className="supporting-copy">
            Consola administrativa para duenos, gerentes y coordinadores de sede.
          </p>
        </div>

        <nav className="nav-list" aria-label="Navegacion principal">
          {[
            ["dashboard", "Dashboard ejecutivo"],
            ["reservas", "Reservas y agenda"],
            ["clientes", "Clientes y cuentas"],
            ["operacion", "Operacion de sedes"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={activeView === value ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView(value)}
            >
              <span>{label}</span>
              <small>{value === "reservas" ? "Prioridad" : "Proximo modulo"}</small>
            </button>
          ))}
        </nav>

        <section className="side-panel">
          <p className="panel-kicker">Alertas del dia</p>
          <ul className="alert-list">
            <li>2 reservas pendientes de asignar equipo.</li>
            <li>1 no show requiere seguimiento comercial.</li>
            <li>Facturacion corporativa en Zona Industrial antes de las 4 pm.</li>
          </ul>
        </section>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Vista administrativa</p>
            <h2>
              {activeView === "reservas"
                ? "Reservas con lectura operativa del negocio"
                : "Panel estrategico en construccion"}
            </h2>
          </div>

          <div className="topbar-actions">
            <button type="button" className="ghost-button">
              Exportar corte
            </button>
            <button type="button" className="primary-button">
              Nueva reserva manual
            </button>
          </div>
        </header>

        <section className="hero-grid">
          <article className="hero-card hero-card-primary">
            <p className="card-kicker">Ingreso del dia</p>
            <h3>{moneyFormatter.format(metrics.revenueToday)}</h3>
            <p>
              Flujo actual con {metrics.reservationsToday} reservas registradas y{" "}
              {metrics.activeNow} servicios en proceso.
            </p>
            <div className="metric-strip">
              <span>Ticket promedio: {moneyFormatter.format(metrics.avgTicket)}</span>
              <span>No show: {metrics.noShowRate}</span>
            </div>
          </article>

          <article className="hero-card hero-card-secondary">
            <p className="card-kicker">Agenda viva</p>
            <h3>{metrics.completedToday} cierres efectivos</h3>
            <p>
              {metrics.pendingPayments} reservas siguen pendientes de cobro y
              requieren atencion administrativa.
            </p>
            <div className="mini-pill-row">
              <span>Chapinero lidera demanda</span>
              <span>Flotas al mediodia</span>
            </div>
          </article>
        </section>

        <section className="kpi-grid">
          <article className="kpi-card">
            <p>Reservas hoy</p>
            <strong>{metrics.reservationsToday}</strong>
            <span>Consolidado de todos los canales.</span>
          </article>
          <article className="kpi-card">
            <p>En curso</p>
            <strong>{metrics.activeNow}</strong>
            <span>Servicios ejecutandose ahora mismo.</span>
          </article>
          <article className="kpi-card">
            <p>Completadas</p>
            <strong>{metrics.completedToday}</strong>
            <span>Ordenes cerradas con atencion finalizada.</span>
          </article>
          <article className="kpi-card">
            <p>Pendientes de pago</p>
            <strong>{metrics.pendingPayments}</strong>
            <span>Casos para caja, factura o seguimiento.</span>
          </article>
        </section>

        <section className="workspace-grid">
          <div className="workspace-main">
            <section className="section-card filters-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Centro operativo</p>
                  <h3>Reservas del dia</h3>
                </div>
                <span className="section-note">
                  Disenado para administracion, no para el flujo del cliente final.
                </span>
              </div>

              <div className="filters-row">
                <label>
                  Buscar
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cliente, placa o reserva"
                  />
                </label>

                <label>
                  Estado
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Sede
                  <select
                    value={locationFilter}
                    onChange={(event) => setLocationFilter(event.target.value)}
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="section-card reservations-card">
              <div className="section-heading">
                <h3>Agenda y control</h3>
                <span className="section-note">
                  {filteredReservations.length} resultados visibles
                </span>
              </div>

              <div className="reservations-list">
                {filteredReservations.map((reservation) => (
                  <article key={reservation.id} className="reservation-row">
                    <div className="reservation-main">
                      <div className="reservation-header">
                        <div>
                          <p className="reservation-id">{reservation.id}</p>
                          <h4>{reservation.customer}</h4>
                        </div>
                        <span
                          className={`status-badge ${statusTone(reservation.status)}`}
                        >
                          {reservation.status}
                        </span>
                      </div>

                      <p className="reservation-service">{reservation.service}</p>

                      <div className="reservation-meta">
                        <span>{reservation.time}</span>
                        <span>{reservation.duration}</span>
                        <span>{reservation.location}</span>
                        <span>{reservation.channel}</span>
                      </div>
                    </div>

                    <div className="reservation-side">
                      <p>{reservation.vehicle}</p>
                      <small>Placa {reservation.plate}</small>
                      <strong>{moneyFormatter.format(reservation.ticket)}</strong>
                      <small>{reservation.payment}</small>
                      <small>{reservation.staff}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="workspace-side">
            <section className="section-card">
              <div className="section-heading">
                <h3>Indicadores de gestion</h3>
              </div>
              <div className="priority-stack">
                {priorityCards.map((card) => (
                  <article key={card.title} className="signal-card">
                    <p>{card.title}</p>
                    <strong>{card.value}</strong>
                    <span>{card.note}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-card">
              <div className="section-heading">
                <h3>Radar de clientes</h3>
              </div>
              <div className="customer-stack">
                {customerSignals.map((signal) => (
                  <article key={signal.name} className="customer-signal">
                    <strong>{signal.name}</strong>
                    <p>{signal.value}</p>
                    <span>{signal.note}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-card">
              <div className="section-heading">
                <h3>Equipos por sede</h3>
              </div>
              <div className="team-board">
                {teamBoard.map((team) => (
                  <article key={team.team} className="team-row">
                    <div className="team-copy">
                      <strong>{team.team}</strong>
                      <span>{team.focus}</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${team.progress}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-card">
              <div className="section-heading">
                <h3>Ritmo del dia</h3>
              </div>
              <div className="timeline">
                {dayTimeline.map((item) => (
                  <article key={item.time} className="timeline-item">
                    <span>{item.time}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
