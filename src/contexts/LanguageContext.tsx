
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations, Locale, TranslationKey } from '@/locales/translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en'); // Default to English

  useEffect(() => {
    const savedLocale = localStorage.getItem('app-locale') as Locale | null;
    if (savedLocale && translations[savedLocale]) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem('app-locale', newLocale);
    } else {
      console.warn(`Locale "${newLocale}" not found in translations. Defaulting to 'en'.`);
      setLocaleState('en');
      localStorage.setItem('app-locale', 'en');
    }
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    return translations[locale]?.[key] || translations['en']?.[key] || fallback || String(key);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
