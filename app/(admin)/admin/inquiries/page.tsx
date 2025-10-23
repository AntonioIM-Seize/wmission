import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { updateInquiryStatusAction } from '@/app/(admin)/admin/inquiries/actions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/date';
import type { InquiryStatus } from '@/types/supabase';

const STATUS_OPTIONS = [
  { label: '전체', value: 'all' },
  { label: '대기', value: 'pending' },
  { label: '처리 완료', value: 'resolved' },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]['value'];

type AdminInquiriesPageProps = {
  searchParams: {
    status?: string;
  };
};

export default async function AdminInquiriesPage({ searchParams }: AdminInquiriesPageProps) {
  const statusParam = STATUS_OPTIONS.some((option) => option.value === searchParams.status)
    ? (searchParams.status as StatusFilter)
    : 'all';

  const supabase = await createSupabaseServerClient();

  const [listResult, pendingCountRes, totalCountRes] = await Promise.all([
    (statusParam === 'all'
      ? supabase.from('inquiries').select('*').order('created_at', { ascending: false })
      : supabase
          .from('inquiries')
          .select('*')
          .eq('status', statusParam === 'pending' ? 'pending' : 'resolved')
          .order('created_at', { ascending: false })) as unknown as Promise<{
      data: InquiryRow[] | null;
      error: Error | null;
    }>,
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending') as unknown as Promise<{ count: number | null; error: Error | null }>,
    supabase.from('inquiries').select('id', { count: 'exact', head: true }) as unknown as Promise<{
      count: number | null;
      error: Error | null;
    }>,
  ]);

  if (listResult.error) {
    console.error('문의 목록 조회 실패', listResult.error);
  }

  if (pendingCountRes.error) {
    console.error('문의 카운트 조회 실패', pendingCountRes.error);
  }

  const inquiries = listResult.data ?? [];
  const totalInquiries = totalCountRes.count ?? inquiries.length;
  const pendingInquiries = pendingCountRes.count ?? inquiries.filter((item) => item.status === 'pending').length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">문의 관리</h2>
        <p className="text-sm text-muted-foreground">방문자 문의를 확인하고 처리 상태를 업데이트합니다.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="총 문의" value={`${totalInquiries}건`} description="누적 접수된 문의" />
        <StatCard title="미해결" value={`${pendingInquiries}건`} description="처리가 필요한 문의" />
        <StatCard
          title="처리 완료"
          value={`${Math.max(totalInquiries - pendingInquiries, 0)}건`}
          description="답변이 완료된 문의"
        />
      </section>

      <Separator />

      <FilterBar activeStatus={statusParam} />

      {inquiries.length === 0 ? (
        <Alert>
          <AlertDescription>해당 조건에 맞는 문의가 없습니다.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </div>
  );
}

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
  responded_at: string | null;
};

type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card className="border border-border/60 bg-white p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}

function FilterBar({ activeStatus }: { activeStatus: StatusFilter }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_OPTIONS.map((option) => (
        <Button
          key={option.value}
          asChild
          variant={option.value === activeStatus ? 'default' : 'outline'}
          size="sm"
        >
          <Link href={`/admin/inquiries?status=${option.value}`}>{option.label}</Link>
        </Button>
      ))}
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: InquiryRow }) {
  const statusLabel = inquiry.status === 'pending' ? '대기' : '처리 완료';
  const statusVariant = inquiry.status === 'pending' ? 'outline' : 'secondary';

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base text-slate-900">{inquiry.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <a className="text-primary hover:underline" href={`mailto:${inquiry.email}`}>
              {inquiry.email}
            </a>
            {inquiry.phone && <span>· {inquiry.phone}</span>}
            <span>· 접수 {formatDate(inquiry.created_at)}</span>
            {inquiry.responded_at && <span>· 답변 {formatDate(inquiry.responded_at)}</span>}
          </div>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed text-slate-800">
        <p className="whitespace-pre-line">{inquiry.message}</p>
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`mailto:${inquiry.email}?subject=${encodeURIComponent('위루다 문의에 대한 답변')}`}>
              메일 답장하기
            </Link>
          </Button>
          <form action={updateInquiryStatusAction}>
            <input type="hidden" name="inquiryId" value={inquiry.id} />
            <input
              type="hidden"
              name="status"
              value={inquiry.status === 'pending' ? 'resolved' : 'pending'}
            />
            <Button type="submit" variant={inquiry.status === 'pending' ? 'default' : 'outline'} size="sm">
              {inquiry.status === 'pending' ? '처리 완료로 표시' : '대기 상태로 변경'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
