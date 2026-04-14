import React, { useEffect, useMemo, useState } from "react";

const SESSION_KEY = "lavadero_admin_session";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

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
      ["staff", "Staff", "Usuarios internos", "CRUD"],
      ["operacion", "Operacion", "Sedes y equipos", "Turnos"],
      ["servicios", "Servicios", "Oferta y margen", "Catalogo"],
    ],
  },
  {
    title: "Relacion comercial",
    items: [["clientes", "Clientes", "Cartera y recurrencia", "CRM"]],
  },
];


const emptyStaffForm = {
  companyId: "",
  locationId: "",
  fullName: "",
  email: "",
  phone: "",
  role: "washer",
  hourlyRate: "",
  commissionPct: "",
  isActive: true,
};

const moduleMeta = {
  dashboard: ["Lectura gerencial", "KPIs diarios con foco administrativo", "Vista ejecutiva para revisar demanda, caja y sedes."],
  reservas: ["Control operativo", "Agenda, filtros y seguimiento de reservas", "Seguimiento del servicio del dia con estado, cobro y asignacion."],
  clientes: ["Relacion comercial", "Clientes frecuentes, corporativos y en riesgo", "Lectura comercial de valor, recurrencia y seguimiento."],
  servicios: ["Oferta y margen", "Servicios principales y oportunidades", "Portafolio para decidir que promocionar y que proteger."],
  staff: ["Talento interno", "CRUD de staff_users por compania", "Gestion administrativa de usuarios internos por empresa y sede."],
  operacion: ["Sedes y talento", "Capacidad instalada y ritmo del equipo", "Control de sedes y ritmo operativo."],
  finanzas: ["Caja y recaudo", "Cobros pendientes y pulso diario", "Visibilidad rapida para gerencia administrativa."],
};

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const emptyDashboard = {
  summary: {
    reservationsToday: 0,
    activeNow: 0,
    completedToday: 0,
    pendingPayments: 0,
    pendingCollection: 0,
    revenueToday: 0,
    avgTicket: 0,
    noShowRate: "0%",
  },
  sidebarStats: [],
  alerts: [],
  charts: {
    dashboardTrend: [],
    weeklyCashTrend: [],
    channelMix: [],
    statusMix: [],
    paymentMix: [],
  },
};

function tone(value) {
  return value.toLowerCase().replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function normalizeError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "No fue posible completar la operacion.";
}

function buildEmptyStaffForm(meta) {
  const firstCompanyId = meta?.companies?.[0]?.id ? String(meta.companies[0].id) : "";
  const firstLocation = meta?.locations?.find((item) => String(item.companyId) === firstCompanyId);

  return {
    companyId: firstCompanyId,
    locationId: firstLocation ? String(firstLocation.id) : "",
    fullName: "",
    email: "",
    phone: "",
    role: "washer",
    hourlyRate: "",
    commissionPct: "",
    isActive: true,
  };
}

async function apiRequest(path, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
    throw new Error(message || `La API respondio con estado ${response.status}.`);
  }

  return payload;
}

function toLineSeries(data) {
  return (data ?? []).map((item) => [item.label, item.value]);
}

function toDonutSeries(data) {
  return (data ?? []).map((item) => [item.label, item.value, item.color]);
}

function LineChart({ data, valueFormatter }) {
  if (!data.length) {
    return <div className="chart-shell"><p className="section-note">Sin datos suficientes para la grafica.</p></div>;
  }

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
  if (!data.length) {
    return <div className="donut-layout"><p className="section-note">Sin datos suficientes para la grafica.</p></div>;
  }

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
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reservationMeta, setReservationMeta] = useState({ statusOptions: ["todas"], locationOptions: ["todas"] });
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [staffMeta, setStaffMeta] = useState({ companies: [], locations: [], roles: [] });
  const [staffCompanyFilter, setStaffCompanyFilter] = useState("todas");
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [staffMessage, setStaffMessage] = useState("");
  const [staffError, setStaffError] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
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

  useEffect(() => {
    let cancelled = false;

    async function loadDemoAccounts() {
      try {
        const response = await apiRequest("/api/admin/demo-accounts");
        if (!cancelled) {
          setDemoAccounts(response.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setLoginError(normalizeError(error));
        }
      }
    }

    loadDemoAccounts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadConsoleData() {
      setPageLoading(true);
      try {
        const [dashboardResponse, customersResponse, servicesResponse, locationsResponse] = await Promise.all([
          apiRequest("/api/dashboard"),
          apiRequest("/api/customers"),
          apiRequest("/api/services"),
          apiRequest("/api/locations"),
        ]);

        if (cancelled) return;

        setDashboard(dashboardResponse ?? emptyDashboard);
        setCustomers(customersResponse.data ?? []);
        setServices(servicesResponse.data ?? []);
        setLocations(locationsResponse.data ?? []);
        setPageError("");
      } catch (error) {
        if (!cancelled) {
          setPageError(normalizeError(error));
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    loadConsoleData();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadReservations() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "todas") params.set("status", statusFilter);
        if (locationFilter !== "todas") params.set("location", locationFilter);
        if (search.trim()) params.set("search", search.trim());
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await apiRequest(`/api/reservations${query}`);
        if (cancelled) return;
        setReservations(response.data ?? []);
        setReservationMeta(response.filters ?? { statusOptions: ["todas"], locationOptions: ["todas"] });
        setPageError("");
      } catch (error) {
        if (!cancelled) {
          setPageError(normalizeError(error));
        }
      }
    }

    loadReservations();

    return () => {
      cancelled = true;
    };
  }, [session, search, statusFilter, locationFilter]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadStaffMeta() {
      try {
        const meta = await apiRequest("/api/staff-users/meta/options");
        if (cancelled) return;
        setStaffMeta(meta);
        setStaffForm((current) => {
          if (current.companyId) {
            return current;
          }
          return buildEmptyStaffForm(meta);
        });
      } catch (error) {
        if (!cancelled) {
          setStaffError(normalizeError(error));
        }
      }
    }

    loadStaffMeta();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadStaffUsers() {
      setStaffLoading(true);
      try {
        const query = staffCompanyFilter !== "todas" ? `?companyId=${staffCompanyFilter}` : "";
        const response = await apiRequest(`/api/staff-users${query}`);
        if (cancelled) return;
        setStaffUsers(response.data ?? []);
        setStaffError("");
      } catch (error) {
        if (!cancelled) {
          setStaffError(normalizeError(error));
        }
      } finally {
        if (!cancelled) {
          setStaffLoading(false);
        }
      }
    }

    loadStaffUsers();

    return () => {
      cancelled = true;
    };
  }, [session, staffCompanyFilter]);

  const metrics = dashboard.summary;
  const sidebarStats = dashboard.sidebarStats;
  const dashboardAlerts = dashboard.alerts;
  const statusOptions = reservationMeta.statusOptions ?? ["todas"];
  const locationOptions = reservationMeta.locationOptions ?? ["todas"];
  const staffCompanyOptions = useMemo(() => {
    return [{ id: "todas", name: "Todas" }, ...staffMeta.companies];
  }, [staffMeta.companies]);

  const availableStaffLocations = useMemo(() => {
    if (!staffForm.companyId) {
      return staffMeta.locations;
    }
    return staffMeta.locations.filter((item) => String(item.companyId) === String(staffForm.companyId));
  }, [staffForm.companyId, staffMeta.locations]);

  function updateCredentials(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }));
    setLoginError("");
  }

  function updateStaffForm(field, value) {
    setStaffForm((current) => {
      if (field === "companyId") {
        const nextLocations = staffMeta.locations.filter((item) => String(item.companyId) === String(value));
        const keepLocation = nextLocations.some((item) => String(item.id) === String(current.locationId));
        return {
          ...current,
          companyId: value,
          locationId: keepLocation ? current.locationId : (nextLocations[0] ? String(nextLocations[0].id) : ""),
        };
      }
      return { ...current, [field]: value };
    });
    setStaffMessage("");
    setStaffError("");
  }

  function quickAccess(account) {
    setCredentials({ email: account.email, password: account.password });
    setLoginError("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginLoading(true);
    try {
      const response = await apiRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });

      setSession(response.user);
      setActiveView("dashboard");
      setLoginError("");
    } catch (error) {
      setLoginError(normalizeError(error));
    } finally {
      setLoginLoading(false);
    }
  }

  function resetStaffForm() {
    setEditingStaffId(null);
    setStaffForm(buildEmptyStaffForm(staffMeta));
    setStaffMessage("");
    setStaffError("");
  }

  function startEditStaff(staff) {
    setEditingStaffId(staff.id);
    setStaffForm({
      companyId: String(staff.companyId ?? ""),
      locationId: staff.locationId ? String(staff.locationId) : "",
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone ?? "",
      role: staff.role,
      hourlyRate: String(staff.hourlyRate ?? ""),
      commissionPct: String(staff.commissionPct ?? ""),
      isActive: staff.isActive,
    });
    setStaffMessage("");
    setStaffError("");
  }

  async function submitStaffForm(event) {
    event.preventDefault();

    if (!staffForm.companyId || !staffForm.fullName || !staffForm.email || !staffForm.role) {
      setStaffMessage("Completa compania, nombre, correo y rol para guardar.");
      return;
    }

    const payload = {
      companyId: Number(staffForm.companyId),
      locationId: staffForm.locationId ? Number(staffForm.locationId) : null,
      fullName: staffForm.fullName.trim(),
      email: staffForm.email.trim(),
      phone: staffForm.phone.trim(),
      role: staffForm.role,
      hourlyRate: staffForm.hourlyRate === "" ? 0 : Number(staffForm.hourlyRate),
      commissionPct: staffForm.commissionPct === "" ? 0 : Number(staffForm.commissionPct),
      isActive: staffForm.isActive,
    };

    setStaffSaving(true);
    try {
      if (editingStaffId) {
        await apiRequest(`/api/staff-users/${editingStaffId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setStaffMessage("Usuario interno actualizado en base de datos.");
      } else {
        await apiRequest("/api/staff-users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setStaffMessage("Usuario interno creado en base de datos.");
      }

      setStaffCompanyFilter(String(payload.companyId));
      setEditingStaffId(null);
      setStaffForm(buildEmptyStaffForm(staffMeta));
      const response = await apiRequest(`/api/staff-users?companyId=${payload.companyId}`);
      setStaffUsers(response.data ?? []);
      setStaffError("");
    } catch (error) {
      setStaffError(normalizeError(error));
    } finally {
      setStaffSaving(false);
    }
  }

  async function deleteStaff(id) {
    setStaffSaving(true);
    try {
      await apiRequest(`/api/staff-users/${id}`, { method: "DELETE" });
      if (editingStaffId === id) {
        setEditingStaffId(null);
        setStaffForm(buildEmptyStaffForm(staffMeta));
      }
      const query = staffCompanyFilter !== "todas" ? `?companyId=${staffCompanyFilter}` : "";
      const response = await apiRequest(`/api/staff-users${query}`);
      setStaffUsers(response.data ?? []);
      setStaffMessage("Usuario interno desactivado en base de datos.");
      setStaffError("");
    } catch (error) {
      setStaffError(normalizeError(error));
    } finally {
      setStaffSaving(false);
    }
  }

  function renderCards(items, formatter) {
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
              <LineChart data={toLineSeries(dashboard.charts.dashboardTrend)} valueFormatter={(value) => money.format(value)} />
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
                data={toDonutSeries(dashboard.charts.channelMix)}
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
                data={toDonutSeries(dashboard.charts.statusMix)}
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
            <span className="section-note">{reservations.length} resultados visibles</span>
          </div>
          <div className="filters-row">
            <label>Buscar<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cliente, placa o reserva" /></label>
            <label>Estado<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Sede<select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>{locationOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
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

    if (activeView === "clientes") {
      return <section className="section-card">{renderCards(customers, (item) => money.format(item.lifetimeValue))}</section>;
    }

    if (activeView === "servicios") {
      return <section className="section-card">{renderCards(services, (item) => money.format(item.price))}</section>;
    }

    if (activeView === "staff") {
      return (
        <section className="workspace-grid">
          <section className="section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Staff users</p>
                <h3>Listado por compania</h3>
              </div>
              <span className="section-note">
                {staffLoading ? "Cargando staff..." : `${staffUsers.length} usuarios visibles`}
              </span>
            </div>

            <div className="filters-row">
              <label>
                Compania
                <select
                  value={staffCompanyFilter}
                  onChange={(event) => setStaffCompanyFilter(event.target.value)}
                >
                  {staffCompanyOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {staffError ? <p className="staff-message">{staffError}</p> : null}

            <div className="staff-list">
              {staffUsers.map((staff) => (
                <article key={staff.id} className="staff-row">
                  <div className="staff-main">
                    <div>
                      <p className="reservation-id">{staff.id}</p>
                      <h4>{staff.fullName}</h4>
                    </div>
                    <span className={`status-badge ${staff.isActive ? "activa" : "riesgo"}`}>
                      {staff.isActive ? "activo" : "inactivo"}
                    </span>
                  </div>
                  <p className="staff-copy">
                    {staff.company} - {staff.location || "Sin sede"} - {staff.roleLabel || staff.role}
                  </p>
                  <div className="reservation-meta">
                    <span>{staff.email}</span>
                    <span>{staff.phone || "Sin telefono"}</span>
                    <span>{money.format(Number(staff.hourlyRate || 0))}/hora</span>
                    <span>{staff.commissionPct}% comision</span>
                  </div>
                  <div className="staff-actions">
                    <button type="button" className="ghost-button" onClick={() => startEditStaff(staff)} disabled={staffSaving}>
                      Editar
                    </button>
                    <button type="button" className="ghost-button" onClick={() => deleteStaff(staff.id)} disabled={staffSaving}>
                      Desactivar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Formulario</p>
                <h3>{editingStaffId ? "Editar staff_user" : "Nuevo staff_user"}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={resetStaffForm}>
                Limpiar
              </button>
            </div>

            <form className="staff-form" onSubmit={submitStaffForm}>
              <label>
                Compania
                <select value={staffForm.companyId} onChange={(event) => updateStaffForm("companyId", event.target.value)}>
                  {staffMeta.companies.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sede
                <select value={staffForm.locationId} onChange={(event) => updateStaffForm("locationId", event.target.value)}>
                  <option value="">Sin sede</option>
                  {availableStaffLocations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nombre completo
                <input value={staffForm.fullName} onChange={(event) => updateStaffForm("fullName", event.target.value)} placeholder="Nombre del usuario interno" />
              </label>
              <label>
                Correo
                <input type="email" value={staffForm.email} onChange={(event) => updateStaffForm("email", event.target.value)} placeholder="correo@empresa.com" />
              </label>
              <label>
                Telefono
                <input value={staffForm.phone} onChange={(event) => updateStaffForm("phone", event.target.value)} placeholder="3001234567" />
              </label>
              <label>
                Rol
                <select value={staffForm.role} onChange={(event) => updateStaffForm("role", event.target.value)}>
                  {staffMeta.roles.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tarifa por hora
                <input value={staffForm.hourlyRate} onChange={(event) => updateStaffForm("hourlyRate", event.target.value)} placeholder="25000" />
              </label>
              <label>
                Comision %
                <input value={staffForm.commissionPct} onChange={(event) => updateStaffForm("commissionPct", event.target.value)} placeholder="2.5" />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={staffForm.isActive}
                  onChange={(event) => updateStaffForm("isActive", event.target.checked)}
                />
                Usuario activo
              </label>
              {staffMessage ? <p className="staff-message">{staffMessage}</p> : null}
              <button type="submit" className="primary-button" disabled={staffSaving || staffLoading}>
                {staffSaving ? "Guardando..." : editingStaffId ? "Guardar cambios" : "Crear usuario"}
              </button>
            </form>
          </section>
        </section>
      );
    }

    if (activeView === "operacion") {
      return <section className="section-card">{renderCards(locations)}</section>;
    }

    return (
      <section className="workspace-grid">
        <section className="section-card">
          {renderCards([
            { id: "fin-1", name: "Ingreso bruto hoy", value: metrics.revenueToday, secondary: "Caja proyectada", note: "Suma de tickets activos" },
            { id: "fin-2", name: "Pendiente por cobrar", value: metrics.pendingCollection, secondary: "Seguimiento manual", note: "Reservas abiertas para caja" },
            { id: "fin-3", name: "Ticket promedio", value: metrics.avgTicket, secondary: "Lectura del dia", note: `No show ${metrics.noShowRate}` },
          ], (item) => money.format(item.value))}
        </section>
        <section className="section-card chart-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Grafica de linea</p>
              <h3>Recaudo de la semana</h3>
            </div>
            <span className="section-note">La linea ayuda a detectar tendencia de caja entre dias, no solo fotografia actual.</span>
          </div>
          <LineChart data={toLineSeries(dashboard.charts.weeklyCashTrend)} valueFormatter={(value) => money.format(value)} />
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
            data={toDonutSeries(dashboard.charts.paymentMix)}
            valueFormatter={(value, total) => `${Math.round((value / total) * 100)}%`}
          />
        </section>
        <section className="section-card">
          <div className="section-heading"><h3>Alertas de caja</h3></div>
          <ul className="alert-list light">{dashboardAlerts.map((item) => <li key={item}>{item}</li>)}</ul>
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
            <h1>Ingreso administrativo de desarrollo conectado al backend.</h1>
            <p>Las cuentas visibles se leen desde la API y validan contra los usuarios activos almacenados en la base de datos.</p>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <label>Correo<input type="email" value={credentials.email} onChange={(event) => updateCredentials("email", event.target.value)} placeholder="admin@lavadero.com" /></label>
            <label>Clave<input type="password" value={credentials.password} onChange={(event) => updateCredentials("password", event.target.value)} placeholder="Ingresa la clave temporal" /></label>
            {loginError ? <p className="login-error">{loginError}</p> : null}
            <button type="submit" className="primary-button" disabled={loginLoading}>{loginLoading ? "Validando..." : "Ingresar a la consola"}</button>
          </form>
        </section>
        <section className="section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Accesos de desarrollo</p>
              <h3>Usuarios disponibles desde la base de datos</h3>
            </div>
          </div>
          <div className="login-accounts">
            {demoAccounts.map((item) => (
              <article key={item.id} className="login-account">
                <div className="login-account-top">
                  <div className="avatar-chip">{initials(item.name)}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.role}</p>
                  </div>
                </div>
                <span>{item.email}</span>
                <span>{item.password}</span>
                <button type="button" className="ghost-button" onClick={() => quickAccess(item)}>Usar este acceso</button>
              </article>
            ))}
            {!demoAccounts.length ? <p className="section-note">Cargando cuentas de desarrollo...</p> : null}
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
          <p className="supporting-copy">Panel administrativo alimentado por la API y la base de datos operativa.</p>
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
                <article key={item.label} className="summary-tile">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
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
            {dashboard.alerts.map((item) => <li key={item}>{item}</li>)}
            {!dashboard.alerts.length ? <li>Sin alertas activas por ahora.</li> : null}
          </ul>
        </section>
        <button type="button" className="ghost-button logout-button" onClick={() => setSession(null)}>Cerrar sesion</button>
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
        {pageLoading ? <p className="section-note top-summary">Actualizando informacion operativa...</p> : null}
        {pageError ? <p className="staff-message">{pageError}</p> : null}
        {renderModule()}
      </main>
    </div>
  );
}

export default App;
