'use client';

import { useEffect } from 'react';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { logError } from '@/lib/monitoring/logger';

type DevotionErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DevotionError({ error, reset }: DevotionErrorProps) {
  useEffect(() => {
    logError('Devotion page error', { error });
  }, [error]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
      <AlertTriangleIcon className="h-10 w-10 text-destructive" aria-hidden />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">묵상 목록을 불러오는 중 문제가 발생했습니다.</h2>
        <p className="text-sm text-muted-foreground">
          잠시 후 다시 시도하거나, 상황이 지속되면 관리자에게 문의해주세요. 오류 코드: {error.digest ?? '알 수 없음'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="default" size="sm" className="gap-2">
          <RotateCcwIcon className="h-4 w-4" />
          다시 시도
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="/support">문의 페이지로 이동</a>
        </Button>
      </div>
    </div>
  );
}
