import Link from 'next/link';

import { signOutAction } from '@/app/(auth)/logout/actions';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentProfile } from '@/lib/auth/session';
import { getProfileStatusLabel, isAdmin } from '@/lib/auth/utils';

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '/', label: '홈' },
  { href: '/devotion', label: '묵상' },
  { href: '/prayer', label: '함께 기도해요' },
  { href: '/support', label: '후원 안내' },
];

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
            위루다 선교 공동체
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {profile ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold">{profile.full_name || '회원'}</span>
                <Badge variant={profile.status === 'approved' ? 'secondary' : 'outline'} className="justify-end">
                  {getProfileStatusLabel(profile.status)}
                </Badge>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/account">내 정보</Link>
              </Button>
              {isAdmin(profile.role) && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">관리자</Link>
                </Button>
              )}
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  로그아웃
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
