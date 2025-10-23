import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { getPrayerById } from '@/lib/data/prayer';
import { formatDate } from '@/lib/utils/date';
import { deletePrayerAdminAction, togglePrayerAnsweredAction } from '@/app/(admin)/admin/prayers/actions';

type AdminPrayerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminPrayerDetailPage({ params }: AdminPrayerDetailPageProps) {
  const language = await detectInitialLanguage();
  const { id } = await params;

  const prayer = await getPrayerById(id);

  if (!prayer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">기도 상세 관리</h2>
          <p className="text-sm text-muted-foreground">응답 상태를 변경하거나 기도 제목을 삭제할 수 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={`/prayer/${prayer.id}`} target="_blank" rel="noreferrer">
              공개본 보기
            </a>
          </Button>
          <form action={deletePrayerAdminAction}>
            <input type="hidden" name="prayerId" value={prayer.id} />
            <Button type="submit" variant="destructive">
              삭제
            </Button>
          </form>
        </div>
      </div>

      <Separator />

      {prayer.imageUrl && (
        <div className="relative h-64 overflow-hidden rounded-2xl border border-border/60">
          <Image
            src={prayer.imageUrl}
            alt="기도 대표 이미지"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>작성일 {formatDate(prayer.createdAt, language)}</span>
          <span>작성자 {prayer.authorName}</span>
          <span>역할 {prayer.authorRole}</span>
        </div>
        <div className="rounded-xl border border-border/60 bg-white p-6">
          <article className="prose prose-slate max-w-none text-slate-900">
            <div dangerouslySetInnerHTML={{ __html: prayer.content }} />
          </article>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">응답 상태</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{prayer.isAnswered ? '응답된 기도입니다.' : '응답 대기 중입니다.'}</span>
          {prayer.answeredAt && <span>응답일 {formatDate(prayer.answeredAt, language)}</span>}
        </div>
        <div className="flex gap-2">
          <form action={togglePrayerAnsweredAction}>
            <input type="hidden" name="prayerId" value={prayer.id} />
            <input type="hidden" name="answered" value={prayer.isAnswered ? 'false' : 'true'} />
            <Button type="submit" variant={prayer.isAnswered ? 'outline' : 'default'}>
              {prayer.isAnswered ? '응답 해제' : '응답 처리'}
            </Button>
          </form>
        </div>
      </section>

      <Separator />

      <section className="space-y-2 text-sm text-muted-foreground">
        <h3 className="font-semibold text-slate-900">반응 요약</h3>
        <p>아멘: {prayer.reactions.amen} / 함께 기도합니다: {prayer.reactions.together}</p>
      </section>
    </div>
  );
}
