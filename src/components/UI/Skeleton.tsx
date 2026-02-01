import { type CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  variant = 'text',
  animation = 'pulse',
  className = ''
}: SkeletonProps) {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const variantClass = `skeleton-${variant}`;
  const animationClass = animation !== 'none' ? `skeleton-${animation}` : '';

  return (
    <div 
      className={`skeleton ${variantClass} ${animationClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton variant="rectangular" height={200} className="skeleton-image" />
      <div className="skeleton-content">
        <Skeleton variant="text" height={24} width="80%" />
        <Skeleton variant="text" height={16} width="60%" />
        <Skeleton variant="text" height={16} width="40%" />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Skeleton variant="rounded" height={36} width={100} />
          <Skeleton variant="rounded" height={36} width={100} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <Skeleton variant="circular" width={48} height={48} />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" height={20} width="70%" />
            <Skeleton variant="text" height={16} width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" height={20} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-stat-card">
            <Skeleton variant="text" height={16} width="60%" />
            <Skeleton variant="text" height={32} width="40%" />
          </div>
        ))}
      </div>
      <div className="skeleton-charts">
        <Skeleton variant="rectangular" height={300} />
      </div>
    </div>
  );
}
