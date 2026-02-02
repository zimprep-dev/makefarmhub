import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) return; // Don't show for 7 days after dismissal
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 30 seconds on the page
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show custom prompt after delay
    if (iOS && !standalone) {
      setTimeout(() => setShowPrompt(true), 30000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <button className="install-dismiss" onClick={handleDismiss}>
          <X size={18} />
        </button>
        
        <div className="install-icon">
          <Smartphone size={32} />
        </div>
        
        <div className="install-text">
          <h3>Install MAKEFARMHUB</h3>
          <p>Get quick access and work offline</p>
        </div>

        {isIOS ? (
          <div className="ios-instructions">
            <p>
              Tap <span className="share-icon">⬆️</span> then "Add to Home Screen"
            </p>
          </div>
        ) : (
          <button className="install-button" onClick={handleInstall}>
            <Download size={18} />
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
