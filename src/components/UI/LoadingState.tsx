import { Loader2 } from 'lucide-react';
import '../../styles/loading-state.css';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

export default function LoadingState({ 
  message = 'Loading...', 
  size = 'medium',
  fullPage = false 
}: LoadingStateProps) {
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 64
  };

  if (fullPage) {
    return (
      <div className="loading-state-fullpage">
        <div className="loading-content">
          <Loader2 size={sizeMap[size]} className="loading-spinner" />
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-state loading-state-${size}`}>
      <Loader2 size={sizeMap[size]} className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

export function InlineLoader({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="loading-spinner inline-loader" />;
}
