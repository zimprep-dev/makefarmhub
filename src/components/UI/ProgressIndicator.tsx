import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = false,
  size = 'md',
  color = 'primary',
  animated = true
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress-bar-wrapper progress-bar-${size}`}>
      <div className="progress-bar">
        <div 
          className={`progress-bar-fill progress-bar-${color} ${animated ? 'animated' : ''}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <span className="progress-label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}

export function CircularProgress({ 
  value, 
  max = 100,
  size = 64,
  strokeWidth = 4,
  showLabel = true,
  color = 'primary'
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    primary: 'var(--primary-green)',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-light)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="circular-progress-label">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export function StepProgress({ 
  steps, 
  currentStep 
}: { 
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="step-progress">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`step-progress-item ${
            index < currentStep ? 'completed' : 
            index === currentStep ? 'active' : 
            'pending'
          }`}
        >
          <div className="step-progress-circle">
            {index < currentStep ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M13.3333 4L6 11.3333L2.66667 8" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <div className="step-progress-label">{step}</div>
          {index < steps.length - 1 && (
            <div className={`step-progress-line ${index < currentStep ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="scroll-progress-bar">
      <div 
        className="scroll-progress-fill" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function LoadingDots({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`loading-dots loading-dots-${size}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

export function Spinner({ size = 'md', color = 'primary' }: { 
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'muted';
}) {
  return (
    <div className={`spinner spinner-${size} spinner-${color}`} />
  );
}
