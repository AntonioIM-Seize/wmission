import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserTable } from '@/components/admin/user-table';
import { getAdminUsers } from '@/lib/admin/users';
import type { ProfileStatus } from '@/types/supabase';

const STATUS_OPTIONS = [
  { label: '전체', value: 'all' },
  { label: '대기', value: 'pending' },
  { label: '승인', value: 'approved' },
  { label: '거절', value: 'rejected' },
  { label: '차단', value: 'blocked' },
];

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? '';
  const statusParam = STATUS_OPTIONS.some((option) => option.value === params.status)
    ? (params.status as typeof STATUS_OPTIONS[number]['value'])
    : 'all';

  const statusFilter: ProfileStatus | null =
    statusParam === 'all' ? null : (statusParam as ProfileStatus);

  const users = await getAdminUsers({ search, status: statusFilter });

  const pendingCount = users.filter((user) => user.status === 'pending').length;
  const adminCount = users.filter((user) => user.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">회원 관리</h2>
        <p className="text-sm text-muted-foreground">가입 승인, 역할 변경, 차단 처리를 할 수 있습니다.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="총 조회" value={`${users.length}명`} description="검색 조건에 해당하는 회원" />
        <StatCard title="승인 대기" value={`${pendingCount}명`} description="빠른 승인 처리가 필요합니다." />
        <StatCard title="관리자" value={`${adminCount}명`} description="현재 관리자 수" />
      </div>

      <Separator />

      <FilterBar search={search} status={statusParam} />

      <UserTable users={users} />
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

type FilterBarProps = {
  search: string;
  status: string;
};

function FilterBar({ search, status }: FilterBarProps) {
  return (
    <form className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between" action="/admin/users">
      <div className="flex flex-1 items-center gap-2">
        <Input name="q" placeholder="이름 또는 가입 이유 검색" defaultValue={search} className="md:max-w-sm" />
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" variant="default">
          필터 적용
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/users">초기화</Link>
        </Button>
      </div>
    </form>
  );
}
