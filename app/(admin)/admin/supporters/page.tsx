import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getSupporters } from '@/lib/admin/supporters';
import { formatDate } from '@/lib/utils/date';
import { upsertSupporterAction, deleteSupporterAction } from '@/app/(admin)/admin/supporters/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AdminSupportersPageProps = {
  searchParams: {
    q?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
  };
};

export default async function AdminSupportersPage({ searchParams }: AdminSupportersPageProps) {
  const search = searchParams.q?.trim() ?? '';
  const startDate = isValidDate(searchParams.startDate) ? searchParams.startDate! : '';
  const endDate = isValidDate(searchParams.endDate) ? searchParams.endDate! : '';
  const minAmount = toNumber(searchParams.minAmount);
  const maxAmount = toNumber(searchParams.maxAmount);

  const hasDateRangeError = Boolean(startDate && endDate && startDate > endDate);

  const supporters = hasDateRangeError
    ? []
    : await getSupporters({
        search,
        startDate: startDate || null,
        endDate: endDate || null,
        minAmount,
        maxAmount,
      });

  const totalAmount = supporters.reduce((sum, supporter) => sum + supporter.amount, 0);
  const averageAmount = supporters.length ? totalAmount / supporters.length : 0;
  const latestSupportedOn = supporters[0]?.supportedOn ?? null;
  const recentSummary = summarizeRecentSupporters(supporters);
  const topSupporter = summarizeTopSupporter(supporters);
  const monthlyBreakdown = buildMonthlyBreakdown(supporters);

  const activeFilters = buildActiveFilters({
    search,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  });

  const exportHref = hasDateRangeError ? null : buildExportHref({ search, startDate, endDate, minAmount, maxAmount });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">후원자 관리</h2>
          <p className="text-sm text-muted-foreground">후원자 정보를 등록·수정하고 후원 금액을 집계합니다.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/support" target="_blank">공개 후원 안내 보기</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="총 후원자" value={`${supporters.length}명`} description="검색 조건에 해당" />
        <StatCard label="총 후원 금액" value={`${formatCurrency(totalAmount)}원`} description="검색된 데이터 기준" />
        <StatCard
          label="평균 후원 금액"
          value={supporters.length ? `${formatCurrency(averageAmount)}원` : '-'}
          description="필터된 데이터 기준"
        />
        <StatCard
          label="최근 30일 누적"
          value={recentSummary.count ? `${formatCurrency(recentSummary.amount)}원` : '-'}
          description={recentSummary.count ? `${recentSummary.count}건 등록` : '최근 30일 데이터 없음'}
        />
      </section>

      <Separator />

      <FilterBar
        defaults={{
          search,
          startDate,
          endDate,
          minAmount: searchParams.minAmount ?? '',
          maxAmount: searchParams.maxAmount ?? '',
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

      {activeFilters.length > 0 && (
        <ActiveFilters filters={activeFilters} latestSupportedOn={latestSupportedOn} />
      )}

      <Separator />

      {topSupporter && (
        <TopSupporterHighlight supporter={topSupporter} />
      )}

      {monthlyBreakdown.length > 0 && (
        <MonthlyBreakdown summary={monthlyBreakdown} />
      )}

      {monthlyBreakdown.length > 0 && <Separator />}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SupporterForm />
        <SupporterTable supporters={supporters} />
      </section>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(amount);
}

type StatCardProps = {
  label: string;
  value: string;
  description: string;
};

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

type FilterBarProps = {
  defaults: {
    search: string;
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
  };
  exportHref: string | null;
  disableExport: boolean;
};

function FilterBar({ defaults, exportHref, disableExport }: FilterBarProps) {
  return (
    <form
      className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"
      action="/admin/supporters"
    >
      <div className="grid gap-3 md:grid-cols-5">
        <Input
          name="q"
          placeholder="이름 또는 메모 검색"
          defaultValue={defaults.search}
          className="md:col-span-2"
        />
        <Input name="startDate" type="date" defaultValue={defaults.startDate} />
        <Input name="endDate" type="date" defaultValue={defaults.endDate} />
        <Input
          name="minAmount"
          type="number"
          min="0"
          step="1000"
          placeholder="최소 금액"
          defaultValue={defaults.minAmount}
        />
        <Input
          name="maxAmount"
          type="number"
          min="0"
          step="1000"
          placeholder="최대 금액"
          defaultValue={defaults.maxAmount}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="submit">필터 적용</Button>
        <Button asChild variant="outline">
          <Link href="/admin/supporters">초기화</Link>
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

function SupporterForm() {
  return (
    <div className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">후원자 추가</h3>
      <p className="mt-1 text-xs text-muted-foreground">후원자 정보를 입력하면 자동으로 목록에 반영됩니다.</p>
      <form action={upsertSupporterAction} className="mt-4 space-y-3 text-sm">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="supporter-name">
            이름
          </label>
          <Input id="supporter-name" name="name" placeholder="홍길동" required className="mt-1" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="supporter-amount">
              금액 (원)
            </label>
            <Input id="supporter-amount" name="amount" type="number" min="0" step="1000" required className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="supporter-date">
              후원 날짜
            </label>
            <Input id="supporter-date" name="supportedOn" type="date" required className="mt-1" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="supporter-memo">
            메모 (선택)
          </label>
          <Textarea id="supporter-memo" name="memo" rows={3} className="mt-1" placeholder="후원 관련 메모를 남겨주세요." />
        </div>
        <Button type="submit" className="w-full">
          후원자 등록
        </Button>
      </form>
    </div>
  );
}

type Supporter = Awaited<ReturnType<typeof getSupporters>>[number];

type SupporterTableProps = {
  supporters: Supporter[];
};

function SupporterTable({ supporters }: SupporterTableProps) {
  if (!supporters.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
        검색 조건에 맞는 후원자가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">금액 (원)</th>
              <th className="px-4 py-3">후원 날짜</th>
              <th className="px-4 py-3">메모</th>
              <th className="px-4 py-3">등록일</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {supporters.map((supporter) => (
              <SupporterTableRow key={supporter.id} supporter={supporter} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type SupporterTableRowProps = {
  supporter: Supporter;
};

function SupporterTableRow({ supporter }: SupporterTableRowProps) {
  const formId = `supporter-${supporter.id}`;

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <Input
          form={formId}
          name="name"
          defaultValue={supporter.name}
          required
        />
      </td>
      <td className="px-4 py-3">
        <Input
          form={formId}
          name="amount"
          type="number"
          min="0"
          step="1000"
          defaultValue={supporter.amount}
          required
        />
      </td>
      <td className="px-4 py-3">
        <Input
          form={formId}
          name="supportedOn"
          type="date"
          defaultValue={supporter.supportedOn}
          required
        />
      </td>
      <td className="px-4 py-3">
        <Textarea
          form={formId}
          name="memo"
          defaultValue={supporter.memo ?? ''}
          rows={2}
          className="min-h-[80px]"
        />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        <div>후원일 {formatDate(supporter.supportedOn)}</div>
        <div>등록 {formatDate(supporter.createdAt)}</div>
      </td>
      <td className="px-4 py-3">
        <form id={formId} action={upsertSupporterAction} className="flex flex-wrap items-center justify-end gap-2">
          <input type="hidden" name="id" value={supporter.id} />
          <input type="hidden" name="supporterId" value={supporter.id} />
          <Button type="submit" size="sm">
            저장
          </Button>
          <Button type="submit" size="sm" variant="destructive" formAction={deleteSupporterAction}>
            삭제
          </Button>
        </form>
      </td>
    </tr>
  );
}

type ActiveFiltersProps = {
  filters: string[];
  latestSupportedOn: string | null;
};

function ActiveFilters({ filters, latestSupportedOn }: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/10 p-4 text-xs text-muted-foreground">
      <span className="font-medium text-slate-900">적용된 필터</span>
      {filters.map((filter) => (
        <Badge key={filter} variant="secondary">
          {filter}
        </Badge>
      ))}
      {latestSupportedOn && (
        <span className="ml-auto text-xs">
          최신 후원일: <strong>{formatDate(latestSupportedOn)}</strong>
        </span>
      )}
    </div>
  );
}

function buildActiveFilters(filters: {
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number | null;
  maxAmount?: number | null;
}) {
  const items: string[] = [];

  if (filters.search) {
    items.push(`검색: ${filters.search}`);
  }

  if (filters.startDate) {
    items.push(`시작일: ${filters.startDate}`);
  }

  if (filters.endDate) {
    items.push(`종료일: ${filters.endDate}`);
  }

  if (typeof filters.minAmount === 'number') {
    items.push(`최소 금액: ${formatCurrency(filters.minAmount)}`);
  }

  if (typeof filters.maxAmount === 'number') {
    items.push(`최대 금액: ${formatCurrency(filters.maxAmount)}`);
  }

  return items;
}

type RecentSummary = {
  count: number;
  amount: number;
};

function summarizeRecentSupporters(supporters: Supporter[]): RecentSummary {
  if (!supporters.length) {
    return { count: 0, amount: 0 };
  }

  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() - 30);

  return supporters.reduce(
    (acc, supporter) => {
      const supportedDate = new Date(supporter.supportedOn);
      if (!Number.isNaN(supportedDate.getTime()) && supportedDate >= threshold) {
        acc.count += 1;
        acc.amount += supporter.amount;
      }
      return acc;
    },
    { count: 0, amount: 0 },
  );
}

type TopSupporter = {
  name: string;
  amount: number;
  supportedOn: string;
  memo: string | null;
};

function summarizeTopSupporter(supporters: Supporter[]): TopSupporter | null {
  if (!supporters.length) {
    return null;
  }

  return supporters.reduce<TopSupporter | null>((acc, supporter) => {
    if (!acc || supporter.amount > acc.amount) {
      return {
        name: supporter.name,
        amount: supporter.amount,
        supportedOn: supporter.supportedOn,
        memo: supporter.memo ?? null,
      };
    }
    return acc;
  }, null);
}

type MonthlySummaryRow = {
  monthKey: string;
  label: string;
  count: number;
  amount: number;
};

function buildMonthlyBreakdown(supporters: Supporter[]): MonthlySummaryRow[] {
  const buckets = new Map<string, { count: number; amount: number }>();

  supporters.forEach((supporter) => {
    const date = new Date(supporter.supportedOn);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = buckets.get(monthKey) ?? { count: 0, amount: 0 };
    current.count += 1;
    current.amount += supporter.amount;
    buckets.set(monthKey, current);
  });

  const rows = Array.from(buckets.entries())
    .map(([monthKey, value]) => {
      const [year, month] = monthKey.split('-');
      return {
        monthKey,
        label: `${year}년 ${month}월`,
        count: value.count,
        amount: value.amount,
      };
    })
    .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1))
    .slice(0, 6);

  return rows;
}

type TopSupporterHighlightProps = {
  supporter: TopSupporter;
};

function TopSupporterHighlight({ supporter }: TopSupporterHighlightProps) {
  return (
    <section className="rounded-xl border border-amber-300/60 bg-amber-50/80 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-amber-800">최고 후원자 스냅샷</h3>
      <p className="mt-2 text-base font-semibold text-slate-900">
        {supporter.name} 님 · {formatCurrency(supporter.amount)}원
      </p>
      <p className="text-xs text-muted-foreground">후원일 {formatDate(supporter.supportedOn)}</p>
      {supporter.memo && <p className="mt-2 text-sm text-slate-700">메모: {supporter.memo}</p>}
    </section>
  );
}

type MonthlyBreakdownProps = {
  summary: MonthlySummaryRow[];
};

function MonthlyBreakdown({ summary }: MonthlyBreakdownProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">최근 6개월 월간 요약</h3>
      <p className="mt-1 text-xs text-muted-foreground">월별 후원 건수와 금액을 빠르게 확인하세요.</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-border/40">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="text-left">
              <th className="px-4 py-3">월</th>
              <th className="px-4 py-3 text-right">건수</th>
              <th className="px-4 py-3 text-right">누적 금액</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.monthKey} className="border-t border-border/40">
                <td className="px-4 py-3 font-medium text-slate-900">{row.label}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.count.toLocaleString('ko-KR')}건</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(row.amount)}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type ExportFilterParams = {
  search: string;
  startDate: string;
  endDate: string;
  minAmount: number | null;
  maxAmount: number | null;
};

function buildExportHref(params: ExportFilterParams): string | null {
  const query = new URLSearchParams();

  if (params.search) {
    query.set('q', params.search);
  }

  if (params.startDate) {
    query.set('startDate', params.startDate);
  }

  if (params.endDate) {
    query.set('endDate', params.endDate);
  }

  if (typeof params.minAmount === 'number') {
    query.set('minAmount', String(params.minAmount));
  }

  if (typeof params.maxAmount === 'number') {
    query.set('maxAmount', String(params.maxAmount));
  }

  const suffix = query.toString();
  return suffix ? `/admin/supporters/export?${suffix}` : '/admin/supporters/export';
}

function isValidDate(value?: string) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
