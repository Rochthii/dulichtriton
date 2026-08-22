'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { vi, Dictionary } from './dictionaries/vi';
import { en } from './dictionaries/en';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: Dictionary;
  t: (key: string) => string;
}

const dictionaries: Record<Language, Dictionary> = { vi, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    // Read from localStorage or navigator if available
    try {
      const saved = localStorage.getItem('triton_language') as Language;
      if (saved === 'vi' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('triton_language', lang);
      document.cookie = `triton_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
  };

  const dict = dictionaries[language] || vi;

  // Helper helper to access nested keys e.g. t('nav.places')
  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = dict;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path; // Fallback to key
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return fallback context if used outside provider (SSR resilience)
    return {
      language: 'vi' as Language,
      setLanguage: () => {},
      dict: vi,
      t: (path: string) => {
        const keys = path.split('.');
        let current: any = vi;
        for (const key of keys) {
          if (current && typeof current === 'object' && key in current) {
            current = current[key];
          } else {
            return path;
          }
        }
        return typeof current === 'string' ? current : path;
      },
    };
  }
  return context;
}
