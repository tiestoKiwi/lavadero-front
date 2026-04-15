import CatalogCards from "../components/shared/CatalogCards";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";
import { money, toDonutSeries, toLineSeries } from "../utils/formatters";

export default function FinanceView({ metrics, dashboardAlerts, dashboard }) {
  return (
    <section className="workspace-grid">
      <section className="section-card">
        <CatalogCards
          items={[
            { id: "fin-1", name: "Ingreso bruto hoy", value: metrics.revenueToday, secondary: "Caja proyectada", note: "Suma de tickets activos" },
            { id: "fin-2", name: "Pendiente por cobrar", value: metrics.pendingCollection, secondary: "Seguimiento manual", note: "Reservas abiertas para caja" },
            { id: "fin-3", name: "Ticket promedio", value: metrics.avgTicket, secondary: "Lectura del dia", note: `No show ${metrics.noShowRate}` },
          ]}
          formatter={(item) => money.format(item.value)}
        />
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
        <DonutChart data={toDonutSeries(dashboard.charts.paymentMix)} valueFormatter={(value, total) => `${Math.round((value / total) * 100)}%`} />
      </section>
      <section className="section-card">
        <div className="section-heading"><h3>Alertas de caja</h3></div>
        <ul className="alert-list light">{dashboardAlerts.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </section>
  );
}
