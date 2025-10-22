'use client';

import { useTransition } from 'react';

import { useLanguage } from '@/context/language-context';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABEL, type SupportedLanguage } from '@/lib/i18n/config';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as SupportedLanguage;
    startTransition(() => setLanguage(next));
  };

  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <span>언어</span>
      <select
        className="rounded border border-neutral-300 bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        value={language}
        onChange={handleChange}
        disabled={isPending}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABEL[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}
