import { useState } from 'react';
import { 
  Accessibility, 
  Eye, 
  Type, 
  Zap, 
  Volume2, 
  Keyboard,
  RotateCcw,
  X
} from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';
import './AccessibilityPanel.css';

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, resetSettings } = useAccessibility();

  const toggles = [
    {
      key: 'highContrast' as const,
      icon: Eye,
      label: 'High Contrast',
      description: 'Increase color contrast for better visibility',
    },
    {
      key: 'largeText' as const,
      icon: Type,
      label: 'Large Text',
      description: 'Increase text size throughout the app',
    },
    {
      key: 'reducedMotion' as const,
      icon: Zap,
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions',
    },
    {
      key: 'screenReaderMode' as const,
      icon: Volume2,
      label: 'Screen Reader Mode',
      description: 'Optimize for screen reader software',
    },
    {
      key: 'keyboardNavigation' as const,
      icon: Keyboard,
      label: 'Keyboard Navigation',
      description: 'Enable keyboard shortcuts (Alt+1: Main, Alt+2: Nav)',
    },
  ];

  return (
    <>
      <button
        className="accessibility-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Accessibility size={20} />
      </button>

      {isOpen && (
        <div className="accessibility-overlay" onClick={() => setIsOpen(false)}>
          <div 
            className="accessibility-panel" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Accessibility Settings"
          >
            <div className="panel-header">
              <h2>
                <Accessibility size={24} />
                Accessibility Settings
              </h2>
              <button 
                className="close-btn" 
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility settings"
              >
                <X size={20} />
              </button>
            </div>

            <div className="panel-content">
              {toggles.map((toggle) => (
                <div key={toggle.key} className="setting-item">
                  <div className="setting-info">
                    <toggle.icon size={20} />
                    <div>
                      <span className="setting-label">{toggle.label}</span>
                      <span className="setting-description">{toggle.description}</span>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings[toggle.key]}
                      onChange={(e) => updateSetting(toggle.key, e.target.checked)}
                      aria-label={toggle.label}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>

            <div className="panel-footer">
              <button className="reset-btn" onClick={resetSettings}>
                <RotateCcw size={16} />
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
