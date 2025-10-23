import { cookies } from 'next/headers';

import { detectInitialLanguage as detectInitialLanguageInternal } from './detect-language';
import { LANGUAGE_COOKIE } from './constants';
import type { SupportedLanguage } from './config';

export async function detectInitialLanguage(): Promise<SupportedLanguage> {
  return detectInitialLanguageInternal();
}

export async function setLanguageCookie(language: SupportedLanguage) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: LANGUAGE_COOKIE,
    value: language,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
