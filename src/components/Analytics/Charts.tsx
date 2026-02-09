import { useState, useEffect, useRef } from 'react';
import './Charts.css';

// ==========================================
// Pure CSS/Canvas Chart Components
// No external dependencies required
// ==========================================

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

// ==========================================
// BAR CHART
// ==========================================
interface BarChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
}

export function BarChart({
  data,
  title,
  height = 250,
  showValues = true,
  animated = true,
}: BarChartProps) {
  const [animatedData, setAnimatedData] = useState<DataPoint[]>(
    animated ? data.map((d) => ({ ...d, value: 0 })) : data
  );

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedData(data), 100);
      return () => clearTimeout(timer);
    }
  }, [data, animated]);

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const defaultColors = ['#0a6b2b', '#22c55e', '#16a34a', '#15803d', '#166534', '#4ade80', '#86efac'];

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="bar-chart" style={{ height }}>
        <div className="bar-chart-grid">
          {[100, 75, 50, 25, 0].map((pct) => (
            <div key={pct} className="grid-line">
              <span className="grid-label">{Math.round((maxValue * pct) / 100)}</span>
            </div>
          ))}
        </div>
        <div className="bar-chart-bars">
          {animatedData.map((item, i) => (
            <div key={i} className="bar-group">
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || defaultColors[i % defaultColors.length],
                    transition: animated ? 'height 0.8s ease-out' : 'none',
                  }}
                >
                  {showValues && item.value > 0 && (
                    <span className="bar-value">{item.value.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <span className="bar-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// LINE CHART (Canvas-based)
// ==========================================
interface LineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  lineColor?: string;
  fillColor?: string;
  showDots?: boolean;
}

export function LineChart({
  data,
  title,
  height = 250,
  lineColor = '#0a6b2b',
  fillColor = 'rgba(10, 107, 43, 0.1)',
  showDots = true,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const minVal = 0;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Grid labels
      const val = maxVal - (maxVal / 4) * i;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val.toLocaleString(), padding.left - 8, y + 4);
    }

    // X-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    data.forEach((point, i) => {
      const x = padding.left + (chartW / (data.length - 1 || 1)) * i;
      ctx.fillText(point.label, x, h - 10);
    });

    // Points
    const points = data.map((point, i) => ({
      x: padding.left + (chartW / (data.length - 1 || 1)) * i,
      y: padding.top + chartH - ((point.value - minVal) / (maxVal - minVal || 1)) * chartH,
    }));

    // Fill area
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    if (showDots) {
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [data, lineColor, fillColor, showDots]);

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
}

// ==========================================
// DONUT / PIE CHART (Canvas-based)
// ==========================================
interface DonutChartProps {
  data: DataPoint[];
  title?: string;
  size?: number;
  donutWidth?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  title,
  size = 200,
  donutWidth = 40,
  showLegend = true,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const defaultColors = ['#0a6b2b', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - donutWidth) / 2 - 5;
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;

    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, radius - donutWidth, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color || defaultColors[i % defaultColors.length];
      ctx.fill();

      startAngle = endAngle;
    });

    // Center text
    if (centerValue) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(centerValue, centerX, centerY - 8);
    }
    if (centerLabel) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(centerLabel, centerX, centerY + 16);
    }
  }, [data, size, donutWidth, centerLabel, centerValue]);

  return (
    <div className="chart-container donut-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="donut-wrapper">
        <canvas ref={canvasRef} style={{ width: size, height: size }} />
        {showLegend && (
          <div className="chart-legend">
            {data.map((item, i) => (
              <div key={i} className="legend-item">
                <span
                  className="legend-color"
                  style={{
                    backgroundColor:
                      item.color || defaultColors[i % defaultColors.length],
                  }}
                />
                <span className="legend-label">{item.label}</span>
                <span className="legend-value">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ title, value, change, icon, color = '#0a6b2b' }: StatCardProps) {
  return (
    <div className="stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <strong className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</strong>
        {change !== undefined && (
          <span className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// PROGRESS BAR
// ==========================================
interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function ProgressBar({ label, value, max, color = '#0a6b2b' }: ProgressBarProps) {
  const percentage = Math.min((value / (max || 1)) * 100, 100);

  return (
    <div className="progress-item">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-value">
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
