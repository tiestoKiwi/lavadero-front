export const SESSION_KEY = "lavadero_admin_session";

export const navGroups = [
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

export const moduleMeta = {
  dashboard: ["Lectura gerencial", "KPIs diarios con foco administrativo", "Vista ejecutiva para revisar demanda, caja y sedes."],
  reservas: ["Control operativo", "Agenda, filtros y seguimiento de reservas", "Seguimiento del servicio del dia con estado, cobro y asignacion."],
  clientes: ["Relacion comercial", "Clientes frecuentes, corporativos y en riesgo", "Lectura comercial de valor, recurrencia y seguimiento."],
  servicios: ["Oferta y margen", "Servicios principales y oportunidades", "Portafolio para decidir que promocionar y que proteger."],
  staff: ["Talento interno", "CRUD de staff_users por compania", "Gestion administrativa de usuarios internos por empresa y sede."],
  operacion: ["Sedes y talento", "Capacidad instalada y ritmo del equipo", "Control de sedes y ritmo operativo."],
  finanzas: ["Caja y recaudo", "Cobros pendientes y pulso diario", "Visibilidad rapida para gerencia administrativa."],
};

export const emptyStaffForm = {
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

export const emptyDashboard = {
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
