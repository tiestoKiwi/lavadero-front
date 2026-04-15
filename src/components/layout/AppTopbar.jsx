export default function AppTopbar({ meta }) {
  return (
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
  );
}
