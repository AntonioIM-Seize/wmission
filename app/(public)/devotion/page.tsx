import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DevotionCard } from '@/components/cards/devotion-card';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { getDevotionsList } from '@/lib/data/devotion';
import { getCurrentProfile } from '@/lib/auth/session';
import { isApproved } from '@/lib/auth/utils';

const PAGE_SIZE = 9;
const TITLE = '묵상 나눔 | 위루다 선교 공동체';
const DESCRIPTION =
  '선교 현장의 묵상과 은혜를 함께 나누세요. 성경 구절과 기도 제목을 검색하고 최신 묵상을 확인할 수 있습니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/devotion',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

type DevotionListPageProps = {
  searchParams: {
    page?: string;
    q?: string;
  };
};

export default async function DevotionListPage({ searchParams }: DevotionListPageProps) {
  const language = detectInitialLanguage();
  const profile = await getCurrentProfile();

  const page = Math.max(Number(searchParams.page ?? '1') || 1, 1);
  const query = searchParams.q?.trim() || null;

  const { items, total } = await getDevotionsList({
    page,
    pageSize: PAGE_SIZE,
    search: query,
  });

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">묵상 나눔</h1>
          <p className="text-sm text-muted-foreground">
            선교 현장의 소식과 묵상을 함께 나눕니다. 다른 언어 사용자는 브라우저의 자동 번역 기능을 활용해 주세요.
          </p>
          {query && (
            <Badge variant="secondary" className="w-fit">
              검색어: {query}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchForm defaultValue={query ?? ''} />
          {profile && isApproved(profile.status) ? (
            <Button asChild>
              <Link href="/devotion/write">묵상 작성</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login?redirectTo=/devotion/write">로그인 후 작성</Link>
            </Button>
          )}
        </div>
      </header>

      <Separator />

      {items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <DevotionCard key={item.id} devotion={item} language={language} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
          검색 조건에 해당하는 묵상이 없습니다.
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} query={query} />
    </div>
  );
}

type SearchFormProps = {
  defaultValue: string;
};

function SearchForm({ defaultValue }: SearchFormProps) {
  return (
    <form className="flex w-full items-center gap-2 md:w-auto" action="/devotion">
      <Input name="q" placeholder="제목이나 구절 검색" defaultValue={defaultValue} />
      <Button type="submit" variant="outline">
        검색
      </Button>
    </form>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  query: string | null;
};

function Pagination({ page, totalPages, query }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (targetPage > 1) params.set('page', String(targetPage));
    if (query) params.set('q', query);
    const suffix = params.toString();
    return suffix ? `/devotion?${suffix}` : '/devotion';
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-white p-4 text-sm">
      <Button asChild variant="ghost" disabled={page <= 1}>
        <Link href={makeHref(page - 1)}>이전</Link>
      </Button>
      <div className="text-muted-foreground">
        {page} / {totalPages}
      </div>
      <Button asChild variant="ghost" disabled={page >= totalPages}>
        <Link href={makeHref(page + 1)}>다음</Link>
      </Button>
    </div>
  );
}
