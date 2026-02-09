import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sn', name: 'Shona', flag: '🇿🇼' },
  { code: 'nd', name: 'Ndebele', flag: '🇿🇼' },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ZWL', symbol: 'ZWL', name: 'Zimbabwe Dollar' },
];

export default function LanguageSwitcher() {
  const { language, currency, setLanguage, setCurrency } = useLanguage();

  return (
    <div className="language-switcher">
      <button className="lang-trigger">
        <Globe size={18} />
        <span>{languages.find(l => l.code === language)?.flag}</span>
      </button>
      
      <div className="lang-dropdown">
        <div className="lang-section">
          <h4>Language</h4>
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`lang-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => setLanguage(lang.code as any)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.name}</span>
            </button>
          ))}
        </div>
        
        <div className="lang-divider"></div>
        
        <div className="lang-section">
          <h4>Currency</h4>
          {currencies.map(curr => (
            <button
              key={curr.code}
              className={`lang-option ${currency === curr.code ? 'active' : ''}`}
              onClick={() => setCurrency(curr.code as any)}
            >
              <span className="currency-symbol">{curr.symbol}</span>
              <span className="currency-name">{curr.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
