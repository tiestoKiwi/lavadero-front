import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";
import { money, toDonutSeries, toLineSeries } from "../utils/formatters";

export default function DashboardView({ metrics, dashboard }) {
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
            <span>Seguimiento a recaudo</span>
            <span>Lectura por canal</span>
          </div>
        </article>
      </section>
      <section className="kpi-grid">
        {[
          ["Reservas hoy", metrics.reservationsToday, "Consolidado de todos los canales."],
          ["En curso", metrics.activeNow, "Servicios ejecutandose ahora mismo."],
          ["Completadas", metrics.completedToday, "Ordenes cerradas con atencion finalizada."],
          ["Pendientes de pago", metrics.pendingPayments, "Casos para caja, factura o seguimiento."],
        ].map((item) => (
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
          <DonutChart data={toDonutSeries(dashboard.charts.channelMix)} valueFormatter={(value, total) => `${Math.round((value / total) * 100)}%`} />
        </article>
        <article className="section-card chart-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Grafica de torta</p>
              <h3>Estado operativo</h3>
            </div>
            <span className="section-note">Ideal para ver composicion del workload sin leer una tabla completa.</span>
          </div>
          <DonutChart data={toDonutSeries(dashboard.charts.statusMix)} valueFormatter={(value, total) => `${value} / ${total}`} />
        </article>
      </section>
    </>
  );
}
