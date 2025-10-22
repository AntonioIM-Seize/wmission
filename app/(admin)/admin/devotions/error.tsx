'use client';

import { useEffect } from 'react';
import { AlertTriangleIcon, RotateCcwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { logError } from '@/lib/monitoring/logger';

type AdminDevotionErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminDevotionError({ error, reset }: AdminDevotionErrorProps) {
  useEffect(() => {
    logError('Admin devotion page error', { error });
  }, [error]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-8">
      <div className="flex items-center gap-3">
        <AlertTriangleIcon className="h-6 w-6 text-destructive" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">묵상 관리자 페이지를 불러오는 데 실패했습니다.</h2>
          <p className="text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요. 오류가 계속되면 로그를 확인하고 Supabase 상태를 점검해주세요. 코드: {error.digest ?? 'N/A'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => reset()} size="sm" className="gap-2">
          <RotateCcwIcon className="h-4 w-4" />
          다시 시도
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="/admin">관리자 홈으로 이동</a>
        </Button>
      </div>
    </div>
  );
}
