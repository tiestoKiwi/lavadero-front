export default function LineChart({ data, valueFormatter }) {
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
