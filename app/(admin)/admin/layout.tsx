import type { ReactNode } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/admin/users', label: '회원 관리' },
  { href: '/admin/devotions', label: '묵상 관리' },
  { href: '/admin/prayers', label: '기도 관리' },
  { href: '/admin/inquiries', label: '문의 관리' },
  { href: '/admin/settings', label: '사이트 설정' },
];

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-muted/30 md:grid-cols-[240px_1fr]">
      <aside className="border-r border-border/60 bg-white/90 shadow-sm">
        <div className="flex h-16 items-center border-b border-border/60 px-4 text-sm font-semibold text-primary">
          관리자 콘솔
        </div>
        <nav className="flex flex-col gap-1 p-4 text-sm text-muted-foreground">
          {NAV_ITEMS.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="justify-start" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </aside>
      <main className="flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-white px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">관리자 페이지</h1>
            <p className="text-xs text-muted-foreground">선교 공동체 운영 데이터를 관리합니다.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">사이트 보기</Link>
          </Button>
        </header>
        <section className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              {children}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
