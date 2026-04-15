export default function DonutChart({ data, valueFormatter }) {
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
