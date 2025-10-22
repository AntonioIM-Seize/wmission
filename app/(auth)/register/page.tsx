import type { Metadata } from 'next';
import Link from 'next/link';

import { Separator } from '@/components/ui/separator';
import { RegisterForm } from '@/components/forms/register-form';

export const metadata: Metadata = {
  title: '회원가입 | 위루다 선교 공동체',
  description: '선교 공동체에서 함께 소식을 나누기 위한 회원가입 페이지입니다.',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">선교 공동체 가입</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          가입 신청 후 관리자의 승인이 필요합니다. 승인이 완료되면 묵상과 기도 글을 작성하실 수 있습니다.
        </p>
      </div>
      <RegisterForm />
      <Separator />
      <p className="text-center text-sm text-muted-foreground">
        이미 가입하셨나요?{' '}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          로그인 하러가기
        </Link>
      </p>
    </div>
  );
}
