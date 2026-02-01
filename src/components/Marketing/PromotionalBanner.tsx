import { useState, useEffect } from 'react';
import { X, Tag, TrendingUp, Gift } from 'lucide-react';
import './PromotionalBanner.css';

interface Banner {
  id: string;
  title: string;
  message: string;
  type: 'sale' | 'announcement' | 'promotion';
  backgroundColor: string;
  textColor: string;
  link?: string;
  dismissible: boolean;
  expiresAt?: string;
}

const defaultBanners: Banner[] = [
  {
    id: 'welcome-2026',
    title: '🎉 New Year Sale!',
    message: 'Get 10% off all organic vegetables this month',
    type: 'sale',
    backgroundColor: 'var(--primary-green)',
    textColor: '#ffffff',
    dismissible: true,
  },
  {
    id: 'free-delivery',
    title: '🚚 Free Delivery',
    message: 'Free transport on orders above $50',
    type: 'promotion',
    backgroundColor: 'var(--accent-gold)',
    textColor: 'var(--text-primary)',
    dismissible: true,
  },
];

export default function PromotionalBanner() {
  const [banners, setBanners] = useState<Banner[]>(() => {
    const dismissed = JSON.parse(localStorage.getItem('mfh_dismissed_banners') || '[]');
    return defaultBanners.filter(b => !dismissed.includes(b.id));
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const dismissBanner = (bannerId: string) => {
    const dismissed = JSON.parse(localStorage.getItem('mfh_dismissed_banners') || '[]');
    dismissed.push(bannerId);
    localStorage.setItem('mfh_dismissed_banners', JSON.stringify(dismissed));
    setBanners(banners.filter(b => b.id !== bannerId));
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const getIcon = () => {
    switch (currentBanner.type) {
      case 'sale':
        return <Tag size={20} />;
      case 'promotion':
        return <Gift size={20} />;
      default:
        return <TrendingUp size={20} />;
    }
  };

  return (
    <div 
      className="promotional-banner"
      style={{
        backgroundColor: currentBanner.backgroundColor,
        color: currentBanner.textColor,
      }}
    >
      <div className="banner-content">
        <div className="banner-icon">{getIcon()}</div>
        <div className="banner-text">
          <strong>{currentBanner.title}</strong>
          <span>{currentBanner.message}</span>
        </div>
      </div>

      {currentBanner.dismissible && (
        <button
          className="banner-close"
          onClick={() => dismissBanner(currentBanner.id)}
          aria-label="Dismiss banner"
        >
          <X size={18} />
        </button>
      )}

      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
