import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

const translations = {
  en: {
    // Navigation
    'nav.marketplace': 'Marketplace',
    'nav.orders': 'Orders',
    'nav.messages': 'Messages',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Marketplace
    'marketplace.title': 'Marketplace',
    'marketplace.subtitle': 'Discover fresh produce from verified farmers across Zimbabwe',
    'marketplace.search': 'Search for crops, livestock, equipment...',
    'marketplace.filters': 'Filters',
    'marketplace.sort': 'Sort by',
    'marketplace.noResults': 'No products found',
    
    // Listing
    'listing.price': 'Price',
    'listing.quantity': 'Quantity',
    'listing.location': 'Location',
    'listing.seller': 'Seller',
    'listing.verified': 'Verified',
    'listing.organic': 'Organic',
    'listing.addToCart': 'Add to Cart',
    'listing.buyNow': 'Buy Now',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
  },
  sn: {
    // Navigation (Shona)
    'nav.marketplace': 'Musika',
    'nav.orders': 'Maodha',
    'nav.messages': 'Meseji',
    'nav.wallet': 'Chikwama',
    'nav.profile': 'Profile',
    'nav.logout': 'Buda',
    
    // Marketplace
    'marketplace.title': 'Musika',
    'marketplace.subtitle': 'Wana zvirimwa zvitsva kubva kuvarimi vakasimbiswa muZimbabwe',
    'marketplace.search': 'Tsvaga zvirimwa, mhuka, michina...',
    'marketplace.filters': 'Sefa',
    'marketplace.sort': 'Ronga ne',
    'marketplace.noResults': 'Hapana zvigadzirwa zvakawanikwa',
    
    // Listing
    'listing.price': 'Mutengo',
    'listing.quantity': 'Huwandu',
    'listing.location': 'Nzvimbo',
    'listing.seller': 'Mutengesi',
    'listing.verified': 'Akasimbiswa',
    'listing.organic': 'Organic',
    'listing.addToCart': 'Isa muKati',
    'listing.buyNow': 'Tenga Izvozvi',
    
    // Common
    'common.save': 'Chengetedza',
    'common.cancel': 'Kanzura',
    'common.delete': 'Dzima',
    'common.edit': 'Shandura',
    'common.close': 'Vhara',
    'common.loading': 'Kufambisa...',
  },
  nd: {
    // Navigation (Ndebele)
    'nav.marketplace': 'Isitolo',
    'nav.orders': 'Ama-oda',
    'nav.messages': 'Imilayezo',
    'nav.wallet': 'Isikhwama',
    'nav.profile': 'Iphrofayela',
    'nav.logout': 'Phuma',
    
    // Marketplace
    'marketplace.title': 'Isitolo',
    'marketplace.subtitle': 'Thola imikhiqizo emitsha evela kubalimi abaqinisekisiweyo eZimbabwe',
    'marketplace.search': 'Funa izitshalo, izifuyo, imishini...',
    'marketplace.filters': 'Ihlunga',
    'marketplace.sort': 'Hlunga nge',
    'marketplace.noResults': 'Akukho mikhiqizo etholiwe',
    
    // Listing
    'listing.price': 'Intengo',
    'listing.quantity': 'Ubuningi',
    'listing.location': 'Indawo',
    'listing.seller': 'Umthengisi',
    'listing.verified': 'Kuqinisekisiwe',
    'listing.organic': 'Organic',
    'listing.addToCart': 'Faka Etulweni',
    'listing.buyNow': 'Thenga Manje',
    
    // Common
    'common.save': 'Gcina',
    'common.cancel': 'Khansela',
    'common.delete': 'Susa',
    'common.edit': 'Hlela',
    'common.close': 'Vala',
    'common.loading': 'Iyalayisha...',
  },
};

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
    return translations[language][key] || key;
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
