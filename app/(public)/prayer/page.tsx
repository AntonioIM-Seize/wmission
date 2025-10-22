import type { Metadata } from 'next';
import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PrayerForm } from '@/components/forms/prayer-form';
import { PrayerReactions } from '@/components/prayer/prayer-reactions';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { getPrayers } from '@/lib/data/prayer';
import { formatDate } from '@/lib/utils/date';
import { getCurrentProfile } from '@/lib/auth/session';
import { isApproved } from '@/lib/auth/utils';

const PAGE_SIZE = 10;
const TITLE = '함께 기도해요 | 위루다 선교 공동체';
const DESCRIPTION =
  '선교지의 기도 제목을 확인하고 아멘, 함께 기도합니다로 응답하세요. 승인된 회원은 직접 기도 제목을 등록할 수 있습니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/prayer',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

type PrayerPageProps = {
  searchParams: {
    page?: string;
  };
};

export default async function PrayerPage({ searchParams }: PrayerPageProps) {
  const language = detectInitialLanguage();
  const profile = await getCurrentProfile();

  const page = Math.max(Number(searchParams.page ?? '1') || 1, 1);

  const { items, total } = await getPrayers({
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">함께 기도해요</h1>
        <p className="text-sm text-muted-foreground">함께 울고 웃는 기도 공동체를 만들어가요.</p>
      </header>

      {profile && isApproved(profile.status) ? (
        <PrayerForm />
      ) : (
        <Alert>
          <AlertDescription>
            기도 제목을 등록하려면 먼저 로그인하고 승인 절차를 완료해주세요.{' '}
            <Link href="/login?redirectTo=/prayer" className="text-primary underline-offset-4 hover:underline">
              로그인하기
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            등록된 기도 제목이 아직 없습니다.
          </div>
        )}

        {items.map((item) => (
          <Card key={item.id} className="border border-border/60">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(item.createdAt, language)}</span>
                  {item.isAnswered && <Badge variant="secondary">응답됨</Badge>}
                </div>
                <CardTitle className="text-base leading-relaxed text-slate-900">{item.content}</CardTitle>
                <p className="text-sm text-muted-foreground">작성자: {item.authorName}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/prayer/${item.id}`}>자세히</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 border-t border-border/40 bg-muted/10 p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted-foreground">
                {item.isAnswered ? '응답 받은 기도입니다. 하나님께 감사드립니다.' : '함께 기도하며 응답을 기대해요.'}
              </p>
              <PrayerReactions
                prayerId={item.id}
                counts={item.reactions}
                revalidatePaths={[`/prayer/${item.id}`]}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <PrayerPagination page={page} totalPages={totalPages} />
    </div>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
};

function PrayerPagination({ page, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const makeHref = (target: number) => {
    const params = new URLSearchParams();
    if (target > 1) params.set('page', String(target));
    const suffix = params.toString();
    return suffix ? `/prayer?${suffix}` : '/prayer';
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-white p-4 text-sm">
      <Button asChild variant="ghost" disabled={page <= 1}>
        <Link href={makeHref(page - 1)}>이전</Link>
      </Button>
      <span className="text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Button asChild variant="ghost" disabled={page >= totalPages}>
        <Link href={makeHref(page + 1)}>다음</Link>
      </Button>
    </div>
  );
}
