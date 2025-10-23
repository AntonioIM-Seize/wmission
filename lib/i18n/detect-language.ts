import { cookies, headers } from 'next/headers';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from './config';
import { LANGUAGE_COOKIE } from './constants';

export function getSupportedLanguage(locale?: string | null): SupportedLanguage {
  if (!locale) {
    return DEFAULT_LANGUAGE;
  }

  const normalized = locale.toLowerCase().split('-')[0];
  return (SUPPORTED_LANGUAGES.find((lang) => lang === normalized) ?? DEFAULT_LANGUAGE) as SupportedLanguage;
}

function detectFromClientContext(): SupportedLanguage | null {
  if (typeof document !== 'undefined') {
    const cookiesString = document.cookie;
    if (cookiesString) {
      const cookiePrefix = `${LANGUAGE_COOKIE}=`;
      const match = cookiesString.split('; ').find((entry) => entry.startsWith(cookiePrefix));
      if (match) {
        const [, value] = match.split('=');
        if (value) {
          return getSupportedLanguage(decodeURIComponent(value));
        }
      }
    }
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return getSupportedLanguage(navigator.language);
  }

  return null;
}

export async function detectInitialLanguage(): Promise<SupportedLanguage> {
  try {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get(LANGUAGE_COOKIE)?.value;
    if (cookieLang) {
      return getSupportedLanguage(cookieLang);
    }

    const requestHeaders = await headers();
    const acceptLanguage = requestHeaders.get('accept-language');
    if (acceptLanguage) {
      const [first] = acceptLanguage.split(',');
      if (first) {
        return getSupportedLanguage(first);
      }
    }
  } catch {
    // Ignored when there is no request context available (e.g. during build).
  }

  const clientDetected = detectFromClientContext();
  if (clientDetected) {
    return clientDetected;
  }

  return DEFAULT_LANGUAGE;
}
