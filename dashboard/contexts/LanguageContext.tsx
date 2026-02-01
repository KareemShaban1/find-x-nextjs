'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const STORAGE_KEY = 'findx_dashboard_lang';
const RTL_LOCALES = ['ar'];

export type Locale = 'en' | 'ar';

const messages: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  ar: ar as Record<string, unknown>,
};

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

type LanguageContextType = {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLang(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ar') return stored;
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLanguageState(getInitialLang());
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Locale) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LOCALES.includes(language) ? 'rtl' : 'ltr';
  }, [language, mounted]);

  const t = useCallback(
    (key: string): string => {
      const dict = messages[language];
      const value = getNested(dict as Record<string, unknown>, key);
      if (value !== undefined) return value;
      const fallback = getNested(messages.en as Record<string, unknown>, key);
      return (fallback as string) ?? key;
    },
    [language]
  );

  const isRtl = useMemo(() => RTL_LOCALES.includes(language), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, isRtl }),
    [language, setLanguage, t, isRtl]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
