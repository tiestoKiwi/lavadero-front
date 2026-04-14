import React, { useEffect, useMemo, useState } from "react";

const SESSION_KEY = "lavadero_admin_session";

const users = [
  ["Paula Herrera", "Gerencia general", "admin@lavadero.com", "Admin123*"],
  ["Camilo Rojas", "Coordinacion operativa", "operaciones@lavadero.com", "Turnos123*"],
  ["Luisa Gomez", "Cuenta corporativa", "comercial@lavadero.com", "Ventas123*"],
];

const navGroups = [
  {
    title: "Vision del negocio",
    items: [
      ["dashboard", "Dashboard", "Resumen ejecutivo", "KPIs"],
      ["finanzas", "Finanzas", "Caja y cobros", "Caja"],
    ],
  },
  {
    title: "Operacion diaria",
    items: [
      ["reservas", "Reservas", "Agenda del dia", "Agenda"],
      ["operacion", "Operacion", "Sedes y equipos", "Turnos"],
      ["servicios", "Servicios", "Oferta y margen", "Catalogo"],
    ],
  },
  {
    title: "Relacion comercial",
    items: [["clientes", "Clientes", "Cartera y recurrencia", "CRM"]],
  },
];

const reservations = [
  ["RES-2401", "Andrea Pardo", "Mazda CX-5", "KXR219", "Chapinero", "App movil", "en proceso", "08:30", "55 min", 78000, "Pagado", "Equipo Norte", "Lavado premium + motor"],
  ["RES-2402", "Carlos Varela", "Renault Logan", "JTW441", "Cedritos", "WhatsApp", "confirmada", "09:10", "40 min", 46000, "Pendiente", "Equipo Express", "Lavado basico"],
  ["RES-2403", "Marta Rueda", "Toyota Prado", "KLO880", "Chapinero", "Recepcion", "completada", "07:40", "70 min", 124000, "Pagado", "Equipo Detail", "Detail interior"],
  ["RES-2404", "Logistica Delta", "Nissan Frontier", "FLT552", "Zona Industrial", "Web admin", "confirmada", "10:00", "60 min", 98000, "Facturar", "Equipo Flotas", "Lavado flota ejecutiva"],
  ["RES-2405", "Sara Ospina", "Kia Picanto", "MFP203", "Cedritos", "App movil", "pendiente", "10:25", "35 min", 38000, "Pendiente", "Por asignar", "Lavado rapido"],
  ["RES-2406", "Grupo Nova", "Chevrolet Tracker", "NVA901", "Chapinero", "Asesor comercial", "no show", "08:50", "45 min", 62000, "Sin cobro", "Equipo Norte", "Lavado premium"],
].map(([id, customer, vehicle, plate, location, channel, status, time, duration, ticket, payment, staff, service]) => ({
  id,
  customer,
  vehicle,
  plate,
  location,
  channel,
  status,
  time,
  duration,
  ticket,
  payment,
  staff,
  service,
}));

const customers = [
  ["Logistica Delta", "Corporativo", 2480000, "Hoy 10:00", "activa", "Cuenta premium con foco en facturacion semanal."],
  ["Andrea Pardo", "Frecuente", 234000, "Hoy 08:30", "fidelizada", "Alta aceptacion de servicios adicionales."],
  ["Grupo Nova", "Corporativo", 1180000, "Hoy 08:50", "riesgo", "Requiere seguimiento por no show en sede principal."],
  ["Carlos Varela", "Recurrente", 92000, "Hoy 09:10", "activa", "Buen potencial para upsell a premium."],
];

const services = [
  ["Lavado premium", 68000, "61%", "55 min"],
  ["Lavado basico", 38000, "47%", "35 min"],
  ["Detail interior", 124000, "66%", "70 min"],
  ["Lavado flota ejecutiva", 98000, "58%", "60 min"],
];

const locations = [
  ["Chapinero", "86%", "4 de 5 bahias", "Mayor demanda del dia."],
  ["Cedritos", "64%", "3 de 4 bahias", "Captar walk-ins de media manana."],
  ["Zona Industrial", "72%", "2 de 3 bahias", "Prioridad en bloque corporativo."],
];

const financeAlerts = [
  "Tres reservas requieren cierre manual en caja.",
  "Una cuenta corporativa debe salir con factura hoy.",
  "Validar recaudo de Cedritos antes del cierre de turno.",
];

const dashboardTrend = [
  ["07:00", 32000],
  ["08:00", 78000],
  ["09:00", 124000],
  ["10:00", 182000],
  ["11:00", 246000],
  ["12:00", 318000],
  ["13:00", 384000],
];

const weeklyCashTrend = [
  ["Lun", 285000],
  ["Mar", 312000],
  ["Mie", 298000],
  ["Jue", 356000],
  ["Vie", 402000],
  ["Sab", 448000],
  ["Hoy", 384000],
];

const channelMix = [
  ["App movil", 2, "#c65a2f"],
  ["WhatsApp", 1, "#d69732"],
  ["Recepcion", 1, "#2f7065"],
  ["Web admin", 1, "#17313b"],
  ["Asesor comercial", 1, "#b94b4b"],
];

const statusMix = [
  ["Confirmadas", 2, "#d69732"],
  ["En proceso", 1, "#2f7065"],
  ["Completadas", 1, "#1f8f72"],
  ["Pendientes", 1, "#c65a2f"],
  ["No show", 1, "#b94b4b"],
];

const paymentMix = [
  ["Pagado", 2, "#2f7065"],
  ["Pendiente", 2, "#c65a2f"],
  ["Facturar", 1, "#d69732"],
  ["Sin cobro", 1, "#b94b4b"],
];

const moduleMeta = {
  dashboard: ["Lectura gerencial", "KPIs diarios con foco administrativo", "Vista ejecutiva para revisar demanda, caja y sedes."],
  reservas: ["Control operativo", "Agenda, filtros y seguimiento de reservas", "Seguimiento del servicio del dia con estado, cobro y asignacion."],
  clientes: ["Relacion comercial", "Clientes frecuentes, corporativos y en riesgo", "Lectura comercial de valor, recurrencia y seguimiento."],
  servicios: ["Oferta y margen", "Servicios principales y oportunidades", "Portafolio para decidir que promocionar y que proteger."],
  operacion: ["Sedes y talento", "Capacidad instalada y ritmo del equipo", "Control de sedes y ritmo operativo."],
  finanzas: ["Caja y recaudo", "Cobros pendientes y pulso diario", "Visibilidad rapida para gerencia administrativa."],
};

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

function tone(value) {
  return value.toLowerCase().replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function LineChart({ data, valueFormatter }) {
  const width = 640;
  const height = 240;
  const padding = 20;
  const max = Math.max(...data.map((item) => item[1]));
  const min = Math.min(...data.map((item) => item[1]));
  const range = Math.max(max - min, 1);

  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((item[1] - min) / range) * (height - padding * 2);
    return { x, y, label: item[0], value: item[1] };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" aria-hidden="true">
        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(198, 90, 47, 0.34)" />
            <stop offset="100%" stopColor="rgba(198, 90, 47, 0.02)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((step) => {
          const y = padding + ((height - padding * 2) * step) / 3;
          return <line key={step} x1={padding} y1={y} x2={width - padding} y2={y} className="chart-grid-line" />;
        })}
        <polygon points={area} fill="url(#lineFill)" />
        <polyline points={polyline} fill="none" stroke="#c65a2f" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="5" fill="#17313b" stroke="#fff7ef" strokeWidth="3" />
        ))}
      </svg>
      <div className="chart-footer">
        {points.map((point) => (
          <div key={point.label} className="chart-footer-item">
            <span>{point.label}</span>
            <strong>{valueFormatter(point.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, valueFormatter }) {
  const total = data.reduce((sum, item) => sum + item[1], 0);
  let current = 0;
  const gradient = data
    .map((item) => {
      const start = (current / total) * 100;
      current += item[1];
      const end = (current / total) * 100;
      return `${item[2]} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="donut-layout">
      <div className="donut-ring" style={{ backgroundImage: `conic-gradient(${gradient})` }}>
        <div className="donut-hole">
          <strong>{total}</strong>
          <span>Total</span>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((item) => (
          <div key={item[0]} className="legend-row">
            <div className="legend-label">
              <i style={{ backgroundColor: item[2] }} />
              <span>{item[0]}</span>
            </div>
            <strong>{valueFormatter(item[1], total)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [locationFilter, setLocationFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [session, setSession] = useState(() => {
    const stored = typeof window === "undefined" ? null : window.localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const metrics = useMemo(() => {
    const completed = reservations.filter((item) => item.status === "completada").length;
    const active = reservations.filter((item) => item.status === "en proceso").length;
    const pendingCount = reservations.filter((item) => item.payment === "Pendiente").length;
    const pendingCollection = reservations.reduce((sum, item) => {
      return item.payment === "Pendiente" || item.payment === "Facturar" ? sum + item.ticket : sum;
    }, 0);
    const revenue = reservations.reduce((sum, item) => (item.status === "no show" ? sum : sum + item.ticket), 0);
    return {
      reservationsToday: reservations.length,
      activeNow: active,
      completedToday: completed,
      pendingPayments: pendingCount,
      pendingCollection,
      revenueToday: revenue,
      avgTicket: Math.round(revenue / Math.max(reservations.length - 1, 1)),
      noShowRate: `${Math.round((1 / reservations.length) * 100)}%`,
    };
  }, []);

  const sidebarStats = useMemo(() => {
    return [
      ["Reservas", String(metrics.reservationsToday)],
      ["Cobros", String(metrics.pendingPayments)],
      ["Sedes", String(locations.length)],
      ["Clientes", String(customers.length)],
    ];
  }, [metrics]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      const matchesStatus = statusFilter === "todas" || item.status === statusFilter;
      const matchesLocation = locationFilter === "todas" || item.location === locationFilter;
      const haystack = `${item.customer} ${item.vehicle} ${item.plate} ${item.id}`.toLowerCase();
      const matchesSearch = search.trim() === "" || haystack.includes(search.toLowerCase());
      return matchesStatus && matchesLocation && matchesSearch;
    });
  }, [locationFilter, search, statusFilter]);

  const statusOptions = ["todas", ...new Set(reservations.map((item) => item.status))];
  const locationOptions = ["todas", ...new Set(reservations.map((item) => item.location))];

  function updateCredentials(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }));
    setLoginError("");
  }

  function quickAccess([name, role, email, password]) {
    setCredentials({ email, password });
    setLoginError("");
  }

  function handleLogin(event) {
    event.preventDefault();
    const match = users.find((item) => item[2].toLowerCase() === credentials.email.trim().toLowerCase() && item[3] === credentials.password);
    if (!match) {
      setLoginError("Credenciales invalidas. Usa uno de los accesos de prueba.");
      return;
    }
    setSession({ name: match[0], role: match[1], email: match[2] });
    setActiveView("dashboard");
  }

  function renderCards(items, formatter) {
    return (
      <div className="card-grid">
        {items.map((item) => (
          <article key={item[0]} className="catalog-card">
            <p>{item[0]}</p>
            <strong>{formatter ? formatter(item) : item[1]}</strong>
            <span>{item[2]}</span>
            <small>{item[3]}</small>
          </article>
        ))}
      </div>
    );
  }

  function renderModule() {
    if (activeView === "dashboard") {
      return (
        <>
          <section className="hero-grid">
            <article className="hero-card hero-card-primary">
              <p className="card-kicker">Ingreso del dia</p>
              <h3>{money.format(metrics.revenueToday)}</h3>
              <p>Flujo actual con {metrics.reservationsToday} reservas registradas y {metrics.activeNow} servicios en proceso.</p>
              <div className="metric-strip">
                <span>Ticket promedio: {money.format(metrics.avgTicket)}</span>
                <span>No show: {metrics.noShowRate}</span>
              </div>
            </article>
            <article className="hero-card hero-card-secondary">
              <p className="card-kicker">Cobro pendiente</p>
              <h3>{money.format(metrics.pendingCollection)}</h3>
              <p>Caja administrativa con foco en reservas por cerrar y cuentas corporativas del dia.</p>
              <div className="mini-pill-row">
                <span>Chapinero lidera demanda</span>
                <span>Flotas al mediodia</span>
              </div>
            </article>
          </section>
          <section className="kpi-grid">
            {[["Reservas hoy", metrics.reservationsToday, "Consolidado de todos los canales."], ["En curso", metrics.activeNow, "Servicios ejecutandose ahora mismo."], ["Completadas", metrics.completedToday, "Ordenes cerradas con atencion finalizada."], ["Pendientes de pago", metrics.pendingPayments, "Casos para caja, factura o seguimiento."]].map((item) => (
              <article key={item[0]} className="kpi-card">
                <p>{item[0]}</p>
                <strong>{item[1]}</strong>
                <span>{item[2]}</span>
              </article>
            ))}
          </section>
          <section className="chart-grid">
            <article className="section-card chart-card wide">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Grafica de linea</p>
                  <h3>Ingreso acumulado por hora</h3>
                </div>
                <span className="section-note">La linea funciona mejor aqui porque importa ver el ritmo del dia y no solo el total.</span>
              </div>
              <LineChart data={dashboardTrend} valueFormatter={(value) => money.format(value)} />
            </article>
            <article className="section-card chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Grafica de torta</p>
                  <h3>Reservas por canal</h3>
                </div>
                <span className="section-note">La torta muestra rapido que canal pesa mas dentro de la mezcla del dia.</span>
              </div>
              <DonutChart
                data={channelMix}
                valueFormatter={(value, total) => `${Math.round((value / total) * 100)}%`}
              />
            </article>
            <article className="section-card chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Grafica de torta</p>
                  <h3>Estado operativo</h3>
                </div>
                <span className="section-note">Ideal para ver composicion del workload sin leer una tabla completa.</span>
              </div>
              <DonutChart
                data={statusMix}
                valueFormatter={(value, total) => `${value} / ${total}`}
              />
            </article>
          </section>
        </>
      );
    }

    if (activeView === "reservas") {
      return (
        <section className="section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Centro operativo</p>
              <h3>Reservas del dia</h3>
            </div>
            <span className="section-note">{filteredReservations.length} resultados visibles</span>
          </div>
          <div className="filters-row">
            <label>Buscar<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cliente, placa o reserva" /></label>
            <label>Estado<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Sede<select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>{locationOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          </div>
          <div className="reservations-list">
            {filteredReservations.map((item) => (
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

    if (activeView === "clientes") {
      return <section className="section-card">{renderCards(customers, (item) => money.format(item[2]))}</section>;
    }

    if (activeView === "servicios") {
      return <section className="section-card">{renderCards(services, (item) => money.format(item[1]))}</section>;
    }

    if (activeView === "operacion") {
      return <section className="section-card">{renderCards(locations)}</section>;
    }

    return (
      <section className="workspace-grid">
        <section className="section-card">
          {renderCards([["Ingreso bruto hoy", metrics.revenueToday, "Caja proyectada", "Suma de tickets activos"], ["Pendiente por cobrar", metrics.pendingCollection, "Seguimiento manual", "Reservas abiertas para caja"], ["Facturacion corporativa", 98000, "Cuenta empresa", "Bloque reservado del dia"]], (item) => money.format(item[1]))}
        </section>
        <section className="section-card chart-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Grafica de linea</p>
              <h3>Recaudo de la semana</h3>
            </div>
            <span className="section-note">La linea ayuda a detectar tendencia de caja entre dias, no solo fotografia actual.</span>
          </div>
          <LineChart data={weeklyCashTrend} valueFormatter={(value) => money.format(value)} />
        </section>
        <section className="section-card chart-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Grafica de torta</p>
              <h3>Distribucion de cobro</h3>
            </div>
            <span className="section-note">La torta deja ver de inmediato donde esta la friccion del recaudo.</span>
          </div>
          <DonutChart
            data={paymentMix}
            valueFormatter={(value, total) => `${Math.round((value / total) * 100)}%`}
          />
        </section>
        <section className="section-card">
          <div className="section-heading"><h3>Alertas de caja</h3></div>
          <ul className="alert-list light">{financeAlerts.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </section>
    );
  }

  if (!session) {
    return (
      <div className="login-shell">
        <section className="login-panel">
          <div className="login-copy">
            <p className="eyebrow">Lavadero Admin</p>
            <h1>Ingreso administrativo temporal con data quemada.</h1>
            <p>Este login es temporal para avanzar el frontend mientras cerramos la conexion real con autenticacion y base de datos.</p>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <label>Correo<input type="email" value={credentials.email} onChange={(event) => updateCredentials("email", event.target.value)} placeholder="admin@lavadero.com" /></label>
            <label>Clave<input type="password" value={credentials.password} onChange={(event) => updateCredentials("password", event.target.value)} placeholder="Ingresa la clave temporal" /></label>
            {loginError ? <p className="login-error">{loginError}</p> : null}
            <button type="submit" className="primary-button">Ingresar a la consola</button>
          </form>
        </section>
        <section className="section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Accesos de prueba</p>
              <h3>Usuarios mock habilitados</h3>
            </div>
          </div>
          <div className="login-accounts">
            {users.map((item) => (
              <article key={item[2]} className="login-account">
                <div className="login-account-top">
                  <div className="avatar-chip">{initials(item[0])}</div>
                  <div>
                    <strong>{item[0]}</strong>
                    <p>{item[1]}</p>
                  </div>
                </div>
                <span>{item[2]}</span>
                <span>{item[3]}</span>
                <button type="button" className="ghost-button" onClick={() => quickAccess(item)}>Usar este acceso</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const meta = moduleMeta[activeView];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Lavadero Admin</p>
          <h1>Consola administrativa para operar el negocio cada dia.</h1>
          <p className="supporting-copy">Login temporal mock activo mientras conectamos autenticacion y base de datos reales.</p>
        </div>
        <section className="session-card">
          <div className="avatar-chip">{initials(session.name)}</div>
          <div>
            <strong>{session.name}</strong>
            <p>{session.role}</p>
            <span>{session.email}</span>
          </div>
        </section>
        <section className="menu-summary">
          <p className="panel-kicker">Pulso rapido</p>
          <div className="summary-grid">
            {sidebarStats.map((item) => (
              <article key={item[0]} className="summary-tile">
                <strong>{item[1]}</strong>
                <span>{item[0]}</span>
              </article>
            ))}
          </div>
        </section>

        <div className="nav-groups" aria-label="Navegacion principal">
          {navGroups.map((group) => (
            <section key={group.title} className="nav-group">
              <p className="nav-group-title">{group.title}</p>
              <nav className="nav-list">
                {group.items.map((item) => (
                  <button
                    key={item[0]}
                    type="button"
                    className={activeView === item[0] ? "nav-item active" : "nav-item"}
                    onClick={() => setActiveView(item[0])}
                  >
                    <div className="nav-item-copy">
                      <span>{item[1]}</span>
                      <small>{item[2]}</small>
                    </div>
                    <b className="nav-pill">{item[3]}</b>
                  </button>
                ))}
              </nav>
            </section>
          ))}
        </div>
        <section className="side-panel">
          <p className="panel-kicker">Alertas del dia</p>
          <ul className="alert-list">
            <li>2 reservas pendientes de asignar equipo.</li>
            <li>1 no show requiere seguimiento comercial.</li>
            <li>Facturacion corporativa en Zona Industrial antes de las 4 pm.</li>
          </ul>
        </section>
        <button type="button" className="ghost-button logout-button" onClick={() => setSession(null)}>Cerrar sesion mock</button>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">{meta[0]}</p>
            <h2>{meta[1]}</h2>
            <p className="section-note top-summary">{meta[2]}</p>
          </div>
          <div className="topbar-actions">
            <button type="button" className="ghost-button">Exportar corte</button>
            <button type="button" className="primary-button">Nueva accion manual</button>
          </div>
        </header>
        {renderModule()}
      </main>
    </div>
  );
}

export default App;
