import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProfileForm } from '@/components/forms/profile-form';
import { getCurrentProfile, getCurrentSession } from '@/lib/auth/session';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { getProfileStatusLabel, getUserRoleLabel, isApproved, isPending } from '@/lib/auth/utils';
import { formatDate } from '@/lib/utils/date';
import type { ProfileUpdateValues } from '@/lib/validators/auth';

export const metadata: Metadata = {
  title: '내 정보 | 위루다 선교 공동체',
  description: '회원 정보와 승인 상태를 확인하고 연락처를 수정할 수 있습니다.',
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?redirectTo=/account');
  }

  const session = await getCurrentSession();
  const language = detectInitialLanguage();

  const membershipNotice: {
    title: string;
    description: string;
    variant: 'default' | 'destructive';
  } | null = isPending(profile.status)
    ? {
        title: '승인 대기 중입니다',
        description: '관리자가 정보를 검토 중입니다. 승인 완료 후 묵상과 기도 글을 작성하실 수 있습니다.',
        variant: 'default',
      }
    : !isApproved(profile.status)
      ? {
          title: '계정 상태를 확인해주세요',
          description: '승인이 거절되었거나 제한된 상태입니다. 관리자에게 문의해주세요.',
          variant: 'destructive',
        }
      : null;

  const initialValues: ProfileUpdateValues = {
    fullName: profile.full_name,
    phone: profile.phone ?? '',
    joinReason: profile.join_reason ?? '',
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">내 정보</h1>
        <p className="text-sm text-muted-foreground">
          승인 상태와 역할을 확인하고, 공동체 운영팀에 공유되는 연락처 정보를 수정할 수 있습니다.
        </p>
      </div>

      {membershipNotice && (
        <Alert variant={membershipNotice.variant}>
          <AlertTitle>{membershipNotice.title}</AlertTitle>
          <AlertDescription>{membershipNotice.description}</AlertDescription>
        </Alert>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">회원 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide">이름</p>
              <p className="text-base font-semibold text-slate-900">{profile.full_name || '이름 미입력'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide">상태</p>
              <Badge variant="secondary">{getProfileStatusLabel(profile.status)}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide">역할</p>
              <p className="font-medium text-slate-900">{getUserRoleLabel(profile.role)}</p>
            </div>
            <div className="grid gap-1 text-xs">
              <p>가입일: {formatDate(profile.created_at, language)}</p>
              {profile.approved_at && <p>승인일: {formatDate(profile.approved_at, language)}</p>}
              {profile.last_login_at && <p>마지막 로그인: {formatDate(profile.last_login_at, language)}</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">계정 & 보안</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide">이메일</p>
              <p className="font-medium text-slate-900">{session?.user?.email ?? '확인되지 않은 계정'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide">Supabase ID</p>
              <p className="font-mono text-xs text-muted-foreground">{profile.id}</p>
            </div>
            <p className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-3 text-xs leading-relaxed">
              로그인 정보는 Supabase Auth에서 안전하게 관리되며, 비밀번호 재설정은 로그인 화면에서 이메일 인증을 통해
              진행됩니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <ProfileForm initialValues={initialValues} />
    </div>
  );
}
