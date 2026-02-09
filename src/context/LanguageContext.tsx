import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations } from '../locales/translations';

type Language = 'en' | 'sn' | 'nd'; // English, Shona, Ndebele
type Currency = 'USD' | 'ZWL';

interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatPrice: (amount: number) => string;
}

const currencyRates = {
  USD: 1,
  ZWL: 28000, // Example rate - would be fetched from API in production
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mfh_language');
    return (saved as Language) || 'en';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('mfh_currency');
    return (saved as Currency) || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('mfh_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mfh_currency', currency);
  }, [currency]);

  const t = (key: string): string => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  const formatPrice = (amount: number): string => {
    const convertedAmount = currency === 'ZWL' ? amount * currencyRates.ZWL : amount;
    const symbol = currency === 'USD' ? '$' : 'ZWL';
    return `${symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <LanguageContext.Provider value={{ language, currency, setLanguage, setCurrency, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
