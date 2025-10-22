import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PrayerReactions } from '@/components/prayer/prayer-reactions';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { getPrayerById } from '@/lib/data/prayer';
import { getCurrentProfile } from '@/lib/auth/session';
import { getProfileStatusLabel, getUserRoleLabel, isAdmin } from '@/lib/auth/utils';
import { formatDate } from '@/lib/utils/date';
import { stripHtml, truncateText } from '@/lib/utils/text';

type PrayerDetailPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: PrayerDetailPageProps): Promise<Metadata> {
  const prayer = await getPrayerById(params.id);

  if (!prayer) {
    return {
      title: '기도 상세 | 위루다 선교 공동체',
      description: '선교 공동체의 기도 제목을 살펴보세요.',
    };
  }

  const contentSource = stripHtml(prayer.content).replace(/\s+/g, ' ').trim();
  const titleBase = truncateText(contentSource || '기도 나눔', 50);
  const title = `${titleBase} | 기도 나눔`;
  const description = truncateText(
    contentSource || `${prayer.authorName}님의 기도 제목을 함께 나눕니다.`,
    160,
  );
  const ogImage = prayer.imageUrl
    ? [
        {
          url: prayer.imageUrl,
          width: 1200,
          height: 630,
          alt: '기도 대표 이미지',
        },
      ]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/prayer/${prayer.id}`,
      images: ogImage,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage?.map((image) => image.url),
    },
  };
}

export default async function PrayerDetailPage({ params }: PrayerDetailPageProps) {
  const language = detectInitialLanguage();
  const profile = await getCurrentProfile();

  const prayer = await getPrayerById(params.id);

  if (!prayer) {
    notFound();
  }

  const canManage = profile && (profile.id === prayer.authorId || isAdmin(profile.role));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(prayer.createdAt, language)}</span>
            {prayer.isAnswered && <Badge variant="secondary">응답됨</Badge>}
          </div>
          <h1 className="text-2xl font-semibold leading-snug text-slate-900">기도 제목</h1>
          <p className="text-sm text-muted-foreground">
            작성자: {prayer.authorName} · 역할: {getUserRoleLabel(prayer.authorRole)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/prayer">목록</Link>
          </Button>
          {canManage && (
            <Button asChild variant="secondary">
              <Link href={`/prayer/${prayer.id}/edit`}>수정</Link>
            </Button>
          )}
        </div>
      </div>

      {prayer.imageUrl && (
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-border/60">
          <Image
            src={prayer.imageUrl}
            alt="기도 대표 이미지"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </div>
      )}

      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">기도 내용</CardTitle>
        </CardHeader>
        <CardContent>
          <article className="prose prose-slate max-w-none text-slate-900">
            <div dangerouslySetInnerHTML={{ __html: prayer.content }} />
          </article>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 bg-muted/10 p-4 text-sm text-muted-foreground">
          <div>
            {prayer.isAnswered ? (
              <span>
                응답 받은 기도입니다. {prayer.answeredAt ? formatDate(prayer.answeredAt, language) : ''}
              </span>
            ) : (
              <span>함께 기도하며 응답을 기대합니다.</span>
            )}
          </div>
          <PrayerReactions prayerId={prayer.id} counts={prayer.reactions} revalidatePaths={[`/prayer/${prayer.id}`]} />
        </CardFooter>
      </Card>

      <Separator />

      <Card className="border border-border/50 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">작성자 정보</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="font-medium text-slate-800">{prayer.authorName}</p>
          <p>승인 상태: {getProfileStatusLabel(prayer.authorStatus)}</p>
          <p>역할: {getUserRoleLabel(prayer.authorRole)}</p>
        </CardContent>
        {canManage && (
          <CardFooter className="text-xs text-muted-foreground">
            관리자는 관리자 페이지에서 기도 제목을 편집하거나 응답 상태를 변경할 수 있습니다.
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
