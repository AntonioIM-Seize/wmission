import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function DevotionNotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-semibold">묵상을 찾을 수 없습니다.</h2>
      <p className="text-sm text-muted-foreground">삭제되었거나 접근 권한이 없는 글일 수 있습니다.</p>
      <Button asChild>
        <Link href="/devotion">묵상 목록으로 돌아가기</Link>
      </Button>
    </div>
  );
}
