import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAdminOverview } from '@/lib/admin/overview';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { formatDate } from '@/lib/utils/date';

export default async function AdminOverviewPage() {
  const metrics = await getAdminOverview();
  const language = await detectInitialLanguage();

  const totalUsers = metrics.totalUsers || 1;
  const statusBreakdown = [
    { label: '승인', value: metrics.approvedUsers, color: 'bg-emerald-500' },
    { label: '대기', value: metrics.pendingUsers, color: 'bg-amber-500' },
    { label: '거절', value: metrics.rejectedUsers, color: 'bg-rose-500' },
    { label: '차단', value: metrics.blockedUsers, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">운영 현황 요약</h1>
        <p className="text-sm text-muted-foreground">
          회원 승인 상태, 최근 콘텐츠 흐름, 후원 내역을 한눈에 확인하세요.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard title="전체 회원" value={`${metrics.totalUsers}명`} description="가입 완료 기준" />
        <StatCard
          title="승인 회원"
          value={`${metrics.approvedUsers}명`}
          description="기도·묵상 작성 가능"
          accent="bg-emerald-100/60"
        />
        <StatCard
          title="승인 대기"
          value={`${metrics.pendingUsers}명`}
          description="승인 검토 필요"
          accent="bg-amber-100/60"
        />
        <StatCard title="관리자" value={`${metrics.adminUsers}명`} description="운영 권한 보유" accent="bg-sky-100/60" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <StatCard title="묵상 게시글" value={`${metrics.totalDevotions}건`} description="등록된 묵상 총합" />
        <StatCard
          title="기도 제목"
          value={`${metrics.totalPrayers}건`}
          description={`응답 완료 ${metrics.answeredPrayers}건`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base text-muted-foreground">회원 상태 분포</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">회원 상세 보기</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm text-muted-foreground">
              총 회원 대비 상태 비율입니다. 승인 대기 인원이 많으면 빠르게 검토해주세요.
            </div>
            <div className="space-y-3">
              {statusBreakdown.map((status) => (
                <StatusBar
                  key={status.label}
                  label={status.label}
                  value={status.value}
                  total={totalUsers}
                  colorClass={status.color}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-muted-foreground">후원 현황</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/supporters">후원 관리</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide">총 후원 금액</p>
              <p className="text-xl font-semibold text-slate-900">{formatCurrency(metrics.supporterAmount)}원</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide">참여 후원자</p>
              <p className="text-base text-slate-900">{metrics.totalSupporters}명</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-800">최근 후원</p>
              <ul className="space-y-2">
                {metrics.recentSupporters.length === 0 && (
                  <li className="text-xs text-muted-foreground">최근 후원 내역이 없습니다.</li>
                )}
                {metrics.recentSupporters.map((supporter) => (
                  <li key={supporter.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-900">{supporter.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(supporter.amount)}원 · {formatDate(supporter.supportedOn, language)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RecentList
          title="최신 묵상"
          description="공개된 최근 묵상 5건"
          emptyMessage="등록된 묵상이 없습니다."
          items={metrics.recentDevotions.map((devotion) => ({
            id: devotion.id,
            primary: devotion.title,
            secondary: formatDate(devotion.publishedAt, language),
            href: `/devotion/${devotion.id}`,
          }))}
          actionHref="/admin/devotions"
          actionLabel="묵상 관리"
        />
        <RecentList
          title="최신 기도"
          description="등록된 최근 기도 5건"
          emptyMessage="등록된 기도 제목이 없습니다."
          items={metrics.recentPrayers.map((prayer) => ({
            id: prayer.id,
            primary: prayer.isAnswered ? '응답 완료' : '기도 진행 중',
            secondary: formatDate(prayer.createdAt, language),
            href: `/prayer/${prayer.id}`,
            badge: prayer.isAnswered ? '응답됨' : undefined,
          }))}
          actionHref="/admin/prayers"
          actionLabel="기도 관리"
        />
      </section>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  accent?: string;
};

function StatCard({ title, value, description, accent }: StatCardProps) {
  return (
    <Card className={`border border-border/60 shadow-sm ${accent ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

type StatusBarProps = {
  label: string;
  value: number;
  total: number;
  colorClass: string;
};

function StatusBar({ label, value, total, colorClass }: StatusBarProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>
          {value}명 ({percentage}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}

type RecentListProps = {
  title: string;
  description: string;
  emptyMessage: string;
  items: Array<{
    id: string;
    primary: string;
    secondary: string;
    href: string;
    badge?: string;
  }>;
  actionHref: string;
  actionLabel: string;
};

function RecentList({ title, description, emptyMessage, items, actionHref, actionLabel }: RecentListProps) {
  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-white p-3">
                <div className="space-y-1">
                  <Link href={item.href} className="font-medium text-slate-900 hover:underline">
                    {item.primary}
                  </Link>
                  <p className="text-xs text-muted-foreground">{item.secondary}</p>
                </div>
                {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(value);
}
