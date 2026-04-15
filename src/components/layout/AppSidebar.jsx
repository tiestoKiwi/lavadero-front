import { initials } from "../../utils/formatters";

export default function AppSidebar({
  navGroups,
  activeView,
  onViewChange,
  session,
  sidebarStats,
  alerts,
  onLogout,
}) {
  return (
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
                  onClick={() => onViewChange(item[0])}
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
          {alerts.map((item) => <li key={item}>{item}</li>)}
          {!alerts.length ? <li>Sin alertas activas por ahora.</li> : null}
        </ul>
      </section>
      <button type="button" className="ghost-button logout-button" onClick={onLogout}>Cerrar sesion</button>
    </aside>
  );
}
