import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/lib/i18n/config';

export function formatDate(value: string | number | Date, language: SupportedLanguage = DEFAULT_LANGUAGE) {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
