import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { deleteDevotionAction } from '@/app/(public)/devotion/[id]/actions';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { incrementDevotionViewCount, getDevotionById } from '@/lib/data/devotion';
import { getCurrentProfile } from '@/lib/auth/session';
import { getProfileStatusLabel, getUserRoleLabel, isAdmin } from '@/lib/auth/utils';
import { formatDate } from '@/lib/utils/date';
import { stripHtml, truncateText } from '@/lib/utils/text';

type DevotionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: DevotionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const devotion = await getDevotionById(id);

  if (!devotion) {
    return {
      title: '묵상 상세 | 위루다 선교 공동체',
      description: '선교지 묵상을 확인해보세요.',
    };
  }

  const descriptionSource =
    stripHtml(devotion.body) || devotion.scriptureText || `${devotion.scriptureRef} 묵상 나눔입니다.`;
  const description = truncateText(descriptionSource.replace(/\s+/g, ' ').trim(), 160);
  const title = `${devotion.title} | 묵상 나눔`;
  const ogImage = devotion.imageUrl
    ? [
        {
          url: devotion.imageUrl,
          width: 1200,
          height: 630,
          alt: devotion.title,
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
      url: `/devotion/${devotion.id}`,
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

export default async function DevotionDetailPage({ params }: DevotionDetailPageProps) {
  const language = await detectInitialLanguage();
  const profile = await getCurrentProfile();
  const { id } = await params;

  const devotion = await getDevotionById(id);

  if (!devotion) {
    notFound();
  }

  await incrementDevotionViewCount(devotion.id);

  const canManage = profile && (profile.id === devotion.authorId || isAdmin(profile.role));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>작성일 {formatDate(devotion.publishedAt, language)}</span>
            <span>조회수 {devotion.views}</span>
          </div>
          <h1 className="text-3xl font-semibold leading-snug text-slate-900">{devotion.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>작성자: {devotion.authorName}</span>
            <span>역할: {getUserRoleLabel(devotion.authorRole)}</span>
            {profile?.id === devotion.authorId && <span>내 글</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/devotion">목록으로</Link>
          </Button>
          {canManage && (
            <form action={deleteDevotionAction}>
              <input type="hidden" name="devotionId" value={devotion.id} />
              <Button type="submit" variant="destructive">
                삭제
              </Button>
            </form>
          )}
          {canManage && (
            <Button asChild variant="secondary">
              <Link href={`/devotion/${devotion.id}/edit`}>수정</Link>
            </Button>
          )}
        </div>
      </div>

      {devotion.imageUrl && (
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-border/60">
          <Image
            src={devotion.imageUrl}
            alt="묵상 대표 이미지"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </div>
      )}

      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-primary">{devotion.scriptureRef}</CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-slate-800">
            {devotion.scriptureText}
          </blockquote>
        </CardContent>
      </Card>

      <article className="prose prose-slate max-w-none rounded-3xl border border-border/60 bg-white p-8 text-slate-900">
        <div dangerouslySetInnerHTML={{ __html: devotion.body }} />
      </article>

      <Separator />

      <Card className="border border-border/50 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">작성자 정보</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-slate-800">{devotion.authorName}</p>
            <p>{getProfileStatusLabel(devotion.authorStatus)}</p>
          </div>
          <div>
            <p>역할: {getUserRoleLabel(devotion.authorRole)}</p>
            {!canManage && <p>함께 기도와 응원을 댓글로 남겨주세요.</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="secondary">
            <Link href="/prayer">기도 제목 살펴보기</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
