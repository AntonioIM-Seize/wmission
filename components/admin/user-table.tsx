import { formatDate } from '@/lib/utils/date';
import { getProfileStatusLabel, getUserRoleLabel } from '@/lib/auth/utils';

import { updateUserRoleAction, updateUserStatusAction } from '@/app/(admin)/admin/users/actions';
import type { AdminUser } from '@/lib/admin/users';

const STATUS_ACTIONS: Array<{ label: string; value: string; variant: 'default' | 'outline' | 'destructive' }> = [
  { label: '승인', value: 'approved', variant: 'default' },
  { label: '대기', value: 'pending', variant: 'outline' },
  { label: '거절', value: 'rejected', variant: 'outline' },
  { label: '차단', value: 'blocked', variant: 'destructive' },
];

const ROLE_ACTIONS: Array<{ label: string; value: string }> = [
  { label: '회원으로 전환', value: 'member' },
  { label: '관리자로 지정', value: 'admin' },
];

type UserTableProps = {
  users: AdminUser[];
};

export function UserTable({ users }: UserTableProps) {
  if (!users.length) {
    return <p className="text-sm text-muted-foreground">조건에 맞는 사용자가 없습니다.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <table className="min-w-full divide-y divide-border/60 text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">이름</th>
            <th className="px-4 py-3">연락처</th>
            <th className="px-4 py-3">상태</th>
            <th className="px-4 py-3">역할</th>
            <th className="px-4 py-3">가입 사유</th>
            <th className="px-4 py-3">가입일</th>
            <th className="px-4 py-3">액션</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {users.map((user) => (
            <tr key={user.id} className={user.status === 'pending' ? 'bg-amber-50/60' : undefined}>
              <td className="px-4 py-3 align-top">
                <div className="font-medium text-slate-900">{user.fullName || '이름 없음'}</div>
                <div className="text-xs text-muted-foreground">{user.email ?? '이메일 미확인'}</div>
              </td>
              <td className="px-4 py-3 align-top text-xs text-muted-foreground">{user.phone ?? '-'}</td>
              <td className="px-4 py-3 align-top text-xs">
                <span className="rounded-full border border-border/60 px-2 py-1 text-xs font-medium">
                  {getProfileStatusLabel(user.status)}
                </span>
              </td>
              <td className="px-4 py-3 align-top text-xs">
                <span className="rounded-full border border-border/60 px-2 py-1 text-xs font-medium">
                  {getUserRoleLabel(user.role)}
                </span>
              </td>
              <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                <p className="line-clamp-3 whitespace-pre-wrap">{user.joinReason ?? '-'}</p>
              </td>
              <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                <div>가입: {formatDate(user.createdAt)}</div>
                {user.approvedAt && <div>승인: {formatDate(user.approvedAt)}</div>}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex flex-wrap gap-2">
                  {STATUS_ACTIONS.map((action) => (
                    <form key={action.value} action={updateUserStatusAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value={action.value} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-colors ${getStatusButtonClass(action.variant)}`}
                      >
                        {action.label}
                      </button>
                    </form>
                  ))}
                  <div className="h-px w-full bg-border/60" />
                  {ROLE_ACTIONS.map((action) => (
                    <form key={action.value} action={updateUserRoleAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="role" value={action.value} />
                      <button
                        type="submit"
                        className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {action.label}
                      </button>
                    </form>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStatusButtonClass(variant: 'default' | 'outline' | 'destructive') {
  switch (variant) {
    case 'default':
      return 'bg-primary text-primary-foreground hover:bg-primary/90';
    case 'outline':
      return 'border border-border/60 bg-white text-muted-foreground hover:border-primary hover:text-primary';
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
    default:
      return '';
  }
}
