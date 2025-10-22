import type { ReactNode } from 'react';

import { LanguageSwitcher } from '@/components/language-switcher';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <footer className="pb-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 위루다 선교 공동체
      </footer>
    </div>
  );
}
