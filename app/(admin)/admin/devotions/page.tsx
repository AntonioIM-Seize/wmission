import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DevotionCard } from '@/components/cards/devotion-card';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import type { SupportedLanguage } from '@/lib/i18n/config';
import {
  getDevotionAdminMetrics,
  getDevotionMonthlySummary,
  getDevotionsList,
  type DevotionListFilters,
} from '@/lib/data/devotion';

const PAGE_SIZE = 12;

type AdminDevotionsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    hasImage?: 'all' | 'with' | 'without';
  }>;
};

export default async function AdminDevotionsPage({ searchParams }: AdminDevotionsPageProps) {
  const language = await detectInitialLanguage();
  const params = await searchParams;

  const query = params.q?.trim() ?? '';
  const page = Math.max(Number(params.page ?? '1') || 1, 1);
  const startDate = isValidDate(params.startDate) ? params.startDate! : '';
  const endDate = isValidDate(params.endDate) ? params.endDate! : '';
  const hasImage = parseHasImageFilter(params.hasImage);

  const hasDateRangeError = Boolean(startDate && endDate && startDate > endDate);

  const filters: DevotionListFilters = {
    search: query || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    hasImage,
  };

  const listPromise = hasDateRangeError
    ? Promise.resolve({ items: [], total: 0, page, pageSize: PAGE_SIZE })
    : getDevotionsList({
        page,
        pageSize: PAGE_SIZE,
        filters,
      });

  const [metrics, monthlySummary, { items, total }] = await Promise.all([
    getDevotionAdminMetrics(),
    getDevotionMonthlySummary(),
    listPromise,
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const activeFilters = buildActiveFilters({ query, startDate, endDate, hasImage });
  const exportHref = hasDateRangeError
    ? null
    : buildExportHref({
        query,
        startDate,
        endDate,
        hasImage,
      });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">묵상 관리</h2>
          <p className="text-sm text-muted-foreground">작성된 묵상을 검토하고 필요 시 삭제하세요.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/devotion">공개 페이지 보기</Link>
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-5">
        <MetricCard title="전체 묵상" value={metrics.total.toLocaleString(language)} description="등록된 전체 묵상 수" />
        <MetricCard
          title="최근 30일 등록"
          value={metrics.last30Days.toLocaleString(language)}
          description="최근 한 달간 신규 묵상"
        />
        <MetricCard
          title="이미지 포함"
          value={metrics.withImage.toLocaleString(language)}
          description="대표 이미지가 있는 묵상"
        />
        <MetricCard title="누적 조회수" value={metrics.totalViews.toLocaleString(language)} description="전체 조회 합계" />
        <MetricCard
          title="참여 작성자"
          value={metrics.uniqueAuthors.toLocaleString(language)}
          description="묵상을 등록한 고유 작성자 수"
        />
      </section>

      <FilterBar
        defaults={{
          query,
          startDate,
          endDate,
          hasImage,
        }}
        exportHref={exportHref}
        disableExport={hasDateRangeError}
      />

      {hasDateRangeError && (
        <Alert variant="destructive">
          <AlertTitle>날짜 범위 오류</AlertTitle>
          <AlertDescription>시작일이 종료일보다 늦습니다. 날짜 범위를 다시 선택해주세요.</AlertDescription>
        </Alert>
      )}

      {activeFilters.length > 0 && <ActiveFilters filters={activeFilters} />}

      <Separator />

      {metrics.topDevotion && <TopDevotionHighlight summary={metrics.topDevotion} language={language} />}

      {monthlySummary.length > 0 && <MonthlyBreakdown rows={monthlySummary} language={language} />}

      <Separator />

      {items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((devotion) => (
            <div key={devotion.id} className="space-y-3 rounded-xl border border-border/60 bg-white p-4 shadow-sm">
              <DevotionCard devotion={devotion} language={language} />
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/devotion/${devotion.id}`}>상세 보기</Link>
                </Button>
                <Button asChild variant="destructive" size="sm" className="w-full">
                  <Link href={`/admin/devotions/${devotion.id}`}>관리</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          검색 조건에 해당하는 묵상이 없습니다.
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        query={query}
        startDate={startDate}
        endDate={endDate}
        hasImage={hasImage}
      />
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

type FilterBarProps = {
  defaults: {
    query: string;
    startDate: string;
    endDate: string;
    hasImage: 'all' | 'with' | 'without';
  };
  exportHref: string | null;
  disableExport: boolean;
};

function FilterBar({ defaults, exportHref, disableExport }: FilterBarProps) {
  return (
    <form className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4" action="/admin/devotions">
      <div className="grid gap-3 md:grid-cols-5">
        <Input name="q" placeholder="제목 또는 구절 검색" defaultValue={defaults.query} className="md:col-span-2" />
        <Input name="startDate" type="date" defaultValue={defaults.startDate} />
        <Input name="endDate" type="date" defaultValue={defaults.endDate} />
        <select
          name="hasImage"
          defaultValue={defaults.hasImage}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="all">이미지 여부 전체</option>
          <option value="with">이미지 있음</option>
          <option value="without">이미지 없음</option>
        </select>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="submit">필터 적용</Button>
        <Button asChild variant="outline">
          <Link href="/admin/devotions">초기화</Link>
        </Button>
        {exportHref && !disableExport ? (
          <Button asChild variant="secondary">
            <a href={exportHref}>CSV 내보내기</a>
          </Button>
        ) : (
          <Button variant="secondary" disabled>
            CSV 내보내기
          </Button>
        )}
      </div>
    </form>
  );
}

type ActiveFiltersProps = {
  filters: string[];
};

function ActiveFilters({ filters }: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/10 p-4 text-xs text-muted-foreground">
      <span className="font-medium text-slate-900">적용된 필터</span>
      {filters.map((filter) => (
        <span key={filter} className="rounded-full border border-border/60 bg-white px-3 py-1 text-xs font-medium text-slate-700">
          {filter}
        </span>
      ))}
    </div>
  );
}

type TopDevotionHighlightProps = {
  summary: {
    id: string;
    title: string;
    views: number;
    publishedAt: string;
  };
  language: SupportedLanguage;
};

function TopDevotionHighlight({ summary, language }: TopDevotionHighlightProps) {
  return (
    <Card className="border border-emerald-200 bg-emerald-50/80">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="text-sm font-semibold text-emerald-700">가장 많이 읽힌 묵상</CardTitle>
        <CardDescription>조회수가 가장 높은 최신 묵상을 빠르게 확인하세요.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900">{summary.title}</p>
          <p className="text-xs text-muted-foreground">
            조회수 {summary.views.toLocaleString(language)} · 게시일 {formatKoreanDate(summary.publishedAt, language)}
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/admin/devotions/${summary.id}`}>관리 페이지로 이동</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

type MonthlyBreakdownProps = {
  rows: Awaited<ReturnType<typeof getDevotionMonthlySummary>>;
  language: SupportedLanguage;
};

function MonthlyBreakdown({ rows, language }: MonthlyBreakdownProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">최근 6개월 월간 요약</h3>
      <p className="mt-1 text-xs text-muted-foreground">월별 등록 건수와 조회수를 확인하세요.</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-border/40">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">월</th>
              <th className="px-4 py-3 text-right">등록 건수</th>
              <th className="px-4 py-3 text-right">누적 조회수</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.monthKey} className="border-t border-border/40">
                <td className="px-4 py-3 font-medium text-slate-900">{row.label}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.count.toLocaleString(language)}건</td>
                <td className="px-4 py-3 text-right text-slate-900">{row.views.toLocaleString(language)}회</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  query: string;
  startDate: string;
  endDate: string;
  hasImage: 'all' | 'with' | 'without';
};

function Pagination({ page, totalPages, query, startDate, endDate, hasImage }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const baseParams = new URLSearchParams();
  if (query) baseParams.set('q', query);
  if (startDate) baseParams.set('startDate', startDate);
  if (endDate) baseParams.set('endDate', endDate);
  if (hasImage && hasImage !== 'all') baseParams.set('hasImage', hasImage);

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams(baseParams);
    if (targetPage > 1) params.set('page', String(targetPage));
    const suffix = params.toString();
    return suffix ? `/admin/devotions?${suffix}` : '/admin/devotions';
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

function buildActiveFilters(params: {
  query: string;
  startDate: string;
  endDate: string;
  hasImage: 'all' | 'with' | 'without';
}) {
  const items: string[] = [];

  if (params.query) {
    items.push(`검색: ${params.query}`);
  }

  if (params.startDate) {
    items.push(`시작일: ${params.startDate}`);
  }

  if (params.endDate) {
    items.push(`종료일: ${params.endDate}`);
  }

  if (params.hasImage === 'with') {
    items.push('이미지 포함');
  } else if (params.hasImage === 'without') {
    items.push('이미지 없음');
  }

  return items;
}

function isValidDate(value?: string) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseHasImageFilter(value?: string) {
  if (value === 'with' || value === 'without') {
    return value;
  }
  return 'all';
}

function formatKoreanDate(value: string, language: SupportedLanguage) {
  try {
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

type ExportFilterParams = {
  query: string;
  startDate: string;
  endDate: string;
  hasImage: 'all' | 'with' | 'without';
};

function buildExportHref(params: ExportFilterParams): string | null {
  const search = new URLSearchParams();

  if (params.query) {
    search.set('q', params.query);
  }

  if (params.startDate) {
    search.set('startDate', params.startDate);
  }

  if (params.endDate) {
    search.set('endDate', params.endDate);
  }

  if (params.hasImage && params.hasImage !== 'all') {
    search.set('hasImage', params.hasImage);
  }

  const suffix = search.toString();
  return suffix ? `/admin/devotions/export?${suffix}` : '/admin/devotions/export';
}
