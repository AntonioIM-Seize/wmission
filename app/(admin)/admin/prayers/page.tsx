import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { getPrayers, getPrayerAdminMetrics } from '@/lib/data/prayer';
import { formatDate } from '@/lib/utils/date';
import { deletePrayerAdminAction, togglePrayerAnsweredAction } from '@/app/(admin)/admin/prayers/actions';

const PAGE_SIZE = 15;

type AdminPrayersPageProps = {
  searchParams: {
    page?: string;
    q?: string;
    status?: 'all' | 'answered' | 'pending';
  };
};

export default async function AdminPrayersPage({ searchParams }: AdminPrayersPageProps) {
  const language = await detectInitialLanguage();

  const page = Math.max(Number(searchParams.page ?? '1') || 1, 1);
  const searchKeyword = searchParams.q?.trim() ?? '';
  const statusFilter = (searchParams.status ?? 'all') as 'all' | 'answered' | 'pending';

  const [metrics, { items, total }] = await Promise.all([
    getPrayerAdminMetrics(),
    getPrayers({
      page,
      pageSize: PAGE_SIZE,
      filters: {
        search: searchKeyword,
        status: statusFilter,
      },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">기도 관리</h2>
          <p className="text-sm text-muted-foreground">기도 제목을 모니터링하고 필요 시 삭제하거나 응답 상태를 변경합니다.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/prayer">공개 페이지 보기</Link>
        </Button>
      </div>

      <Separator />

      <section>
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard title="전체 기도" value={metrics.total.toLocaleString(language)} description="등록된 전체 기도 수" />
          <MetricCard title="응답 완료" value={metrics.answered.toLocaleString(language)} description="응답 처리된 기도 수" />
          <MetricCard title="응답 대기" value={metrics.pending.toLocaleString(language)} description="응답 미처리 기도 수" />
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4" action="/admin/prayers">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="q">
              검색어
            </label>
            <Input
              id="q"
              name="q"
              placeholder="기도 내용 또는 작성자 이름을 입력하세요."
              defaultValue={searchKeyword}
            />
          </div>
          <div className="flex w-full flex-col gap-1 md:w-48">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="status">
              상태
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusFilter}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="all">전체</option>
              <option value="pending">응답 대기</option>
              <option value="answered">응답 완료</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit">필터 적용</Button>
            <Button variant="ghost" asChild>
              <Link href="/admin/prayers">초기화</Link>
            </Button>
          </div>
        </form>
      </section>

      <div className="space-y-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground">등록된 기도 제목이 없습니다.</p>}
        {items.map((prayer) => (
          <div key={prayer.id} className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(prayer.createdAt, language)}</span>
                  {prayer.isAnswered && <span className="rounded-full border border-emerald-400 px-2 py-0.5 text-emerald-600">응답됨</span>}
                  {!prayer.isAnswered && (
                    <span className="rounded-full border border-amber-400 px-2 py-0.5 text-amber-600">진행 중</span>
                  )}
                  {prayer.imageUrl && <span className="rounded-full border border-sky-300 px-2 py-0.5 text-sky-600">이미지 포함</span>}
                </div>
                <p className="text-base text-slate-900">{prayer.content}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>작성자: {prayer.authorName}</span>
                  <span>아멘: {prayer.reactions.amen.toLocaleString(language)}</span>
                  <span>함께 기도합니다: {prayer.reactions.together.toLocaleString(language)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 self-stretch md:w-56">
                <div className="flex gap-2 self-end">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/prayer/${prayer.id}`} target="_blank" rel="noreferrer">
                      공개 보기
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/prayers/${prayer.id}`}>상세 관리</Link>
                  </Button>
                </div>
                <div className="flex gap-2 self-end">
                  <form action={togglePrayerAnsweredAction} className="inline-flex">
                    <input type="hidden" name="prayerId" value={prayer.id} />
                    <input type="hidden" name="answered" value={prayer.isAnswered ? 'false' : 'true'} />
                    <Button type="submit" size="sm" variant={prayer.isAnswered ? 'outline' : 'default'}>
                      {prayer.isAnswered ? '응답 해제' : '응답 처리'}
                    </Button>
                  </form>
                  <form action={deletePrayerAdminAction} className="inline-flex">
                    <input type="hidden" name="prayerId" value={prayer.id} />
                    <Button type="submit" size="sm" variant="destructive">
                      삭제
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} searchKeyword={searchKeyword} statusFilter={statusFilter} />
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
};

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  searchKeyword: string;
  statusFilter: 'all' | 'answered' | 'pending';
};

function Pagination({ page, totalPages, searchKeyword, statusFilter }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const baseParams = new URLSearchParams();
  if (searchKeyword) baseParams.set('q', searchKeyword);
  if (statusFilter && statusFilter !== 'all') baseParams.set('status', statusFilter);

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams(baseParams);
    if (targetPage > 1) params.set('page', String(targetPage));
    const suffix = params.toString();
    return suffix ? `/admin/prayers?${suffix}` : '/admin/prayers';
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
