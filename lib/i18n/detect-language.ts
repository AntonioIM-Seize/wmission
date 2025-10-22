import { headers } from 'next/headers';
import { cookies } from 'next/headers';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from './config';

const LANGUAGE_COOKIE_KEY = 'mission.lang';

export function getSupportedLanguage(locale?: string | null): SupportedLanguage {
  if (!locale) {
    return DEFAULT_LANGUAGE;
  }

  const normalized = locale.toLowerCase().split('-')[0];
  return (SUPPORTED_LANGUAGES.find((lang) => lang === normalized) ?? DEFAULT_LANGUAGE) as SupportedLanguage;
}

export function detectInitialLanguage(): SupportedLanguage {
  const cookieStore = cookies();
  const cookieLang = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  if (cookieLang) {
    return getSupportedLanguage(cookieLang);
  }

  const headerStore = headers();
  const acceptLanguage = headerStore.get('accept-language');

  if (acceptLanguage) {
    const [first] = acceptLanguage.split(',');
    if (first) {
      return getSupportedLanguage(first);
    }
  }

  return DEFAULT_LANGUAGE;
}

export function setLanguageCookie(language: SupportedLanguage) {
  const cookieStore = cookies();
  cookieStore.set({
    name: LANGUAGE_COOKIE_KEY,
    value: language,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

export const LANGUAGE_COOKIE = LANGUAGE_COOKIE_KEY;
