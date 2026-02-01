interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  height?: number;
}

export default function SimpleBarChart({ data, title, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="simple-bar-chart">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container" style={{ height: `${height}px` }}>
        <div className="chart-bars">
          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            return (
              <div key={index} className="bar-wrapper">
                <div className="bar-value">${item.value.toLocaleString()}</div>
                <div
                  className="bar"
                  style={{
                    height: `${heightPercent}%`,
                    background: item.color || '#2E7D32',
                  }}
                  title={`${item.label}: $${item.value.toLocaleString()}`}
                />
                <div className="bar-label">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
