import type { Metadata } from 'next';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from '@/components/forms/login-form';

type LoginPageProps = {
  searchParams: {
    redirectTo?: string;
    registered?: string;
    notice?: string;
  };
};

export const metadata: Metadata = {
  title: '로그인 | 위루다 선교 공동체',
  description: '선교 공동체 로그인 페이지입니다.',
};

function sanitizeRedirectPath(path?: string) {
  if (!path) return undefined;
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/http')) return undefined;
  if (['/login', '/register'].includes(path)) return undefined;
  return path;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = sanitizeRedirectPath(searchParams.redirectTo);
  const registered = searchParams.registered === '1';
  const pendingNotice = searchParams.notice === 'pending';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">등록된 이메일과 비밀번호로 로그인해주세요.</p>
      </div>
      {registered && (
        <Alert>
          <AlertTitle>가입 신청이 접수되었습니다</AlertTitle>
          <AlertDescription>
            관리자가 정보를 검토한 후 승인해 드립니다. 승인 완료 시 이메일로 알려드릴게요.
          </AlertDescription>
        </Alert>
      )}
      {pendingNotice && (
        <Alert>
          <AlertTitle>승인 대기 중</AlertTitle>
          <AlertDescription>아직 관리자의 승인이 완료되지 않았습니다. 승인이 완료되면 알림을 드릴게요.</AlertDescription>
        </Alert>
      )}
      <LoginForm redirectTo={redirectTo} />
      <Separator />
      <p className="text-center text-sm text-muted-foreground">
        아직 계정이 없으신가요?{' '}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          회원가입 하러가기
        </Link>
      </p>
    </div>
  );
}
