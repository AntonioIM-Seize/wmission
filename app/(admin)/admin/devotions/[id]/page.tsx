import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getDevotionById } from '@/lib/data/devotion';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { formatDate } from '@/lib/utils/date';
import { deleteDevotionAdminAction } from '@/app/(admin)/admin/devotions/actions';

type AdminDevotionDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function AdminDevotionDetailPage({ params }: AdminDevotionDetailPageProps) {
  const language = await detectInitialLanguage();

  const devotion = await getDevotionById(params.id);

  if (!devotion) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">묵상 상세 관리</h2>
          <p className="text-sm text-muted-foreground">작성자 정보를 확인하고 필요 시 묵상을 삭제할 수 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={`/devotion/${devotion.id}`} target="_blank" rel="noreferrer">
              공개본 보기
            </a>
          </Button>
          <form action={deleteDevotionAdminAction}>
            <input type="hidden" name="devotionId" value={devotion.id} />
            <Button type="submit" variant="destructive">
              삭제
            </Button>
          </form>
        </div>
      </div>

      <Separator />

      {devotion.imageUrl && (
        <div className="relative h-64 overflow-hidden rounded-2xl border border-border/60">
          <Image
            src={devotion.imageUrl}
            alt="묵상 대표 이미지"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">작성일</p>
          <p className="text-sm text-slate-900">{formatDate(devotion.publishedAt, language)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">제목</p>
          <p className="text-lg font-semibold text-slate-900">{devotion.title}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">성경 구절</p>
          <p className="font-medium text-slate-900">{devotion.scriptureRef}</p>
          <p className="mt-2 rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">{devotion.scriptureText}</p>
        </div>
        <article className="prose prose-slate max-w-none rounded-xl border border-border/60 bg-white p-6">
          <div dangerouslySetInnerHTML={{ __html: devotion.body }} />
        </article>
      </section>

      <Separator />

      <section className="space-y-2 text-sm text-muted-foreground">
        <p className="font-semibold text-slate-900">작성자 정보</p>
        <p>이름: {devotion.authorName}</p>
        <p>역할: {devotion.authorRole}</p>
        <p>상태: {devotion.authorStatus}</p>
        <p>조회수: {devotion.views}</p>
      </section>
    </div>
  );
}
