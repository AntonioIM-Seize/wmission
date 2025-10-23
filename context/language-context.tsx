'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { DEFAULT_LANGUAGE, LANGUAGE_LABEL, type SupportedLanguage } from '@/lib/i18n/config';
import { LANGUAGE_COOKIE } from '@/lib/i18n/constants';

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  labels: Record<SupportedLanguage, string>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

type LanguageProviderProps = {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
};

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);

  const setLanguage = useCallback((next: SupportedLanguage) => {
    setLanguageState(next);
    if (typeof document !== 'undefined') {
      document.cookie = `${LANGUAGE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      labels: LANGUAGE_LABEL,
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage 훅은 LanguageProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}
