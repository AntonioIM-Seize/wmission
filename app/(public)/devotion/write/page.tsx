import type { Metadata } from 'next';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DevotionForm } from '@/components/forms/devotion-form';
import { requireApprovedStatus } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: '묵상 작성 | 위루다 선교 공동체',
  description: '승인된 회원만 묵상을 작성할 수 있습니다.',
};

export default async function DevotionWritePage() {
  await requireApprovedStatus(['approved']);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">묵상 작성</h1>
        <p className="text-sm text-muted-foreground">오늘 나눈 말씀과 기도 제목을 함께 공유해주세요.</p>
      </div>
      <Alert>
        <AlertTitle>안내</AlertTitle>
        <AlertDescription>
          본 서비스는 한국어 원문을 기준으로 제공됩니다. 다른 언어 사용자는 브라우저 자동 번역 기능을 이용해 묵상을
          확인하게 되니, 예의와 배려를 담아 정직하게 작성해주세요.
        </AlertDescription>
      </Alert>
      <DevotionForm />
      <Separator />
      <p className="text-center text-sm text-muted-foreground">
        목록으로 돌아가기:{' '}
        <Link href="/devotion" className="text-primary underline-offset-4 hover:underline">
          묵상 목록
        </Link>
      </p>
    </div>
  );
}
