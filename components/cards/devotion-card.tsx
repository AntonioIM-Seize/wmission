import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, EyeIcon } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';

import type { SupportedLanguage } from '@/lib/i18n/config';

type DevotionCardProps = {
  devotion: {
    id: string;
    title: string;
    scriptureRef: string;
    excerpt: string;
    publishedAt?: string;
    views?: number;
    authorName?: string;
    imageUrl?: string | null;
  };
  language: SupportedLanguage;
};

export function DevotionCard({ devotion, language }: DevotionCardProps) {
  return (
    <Card className="h-full border border-border/60">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          {devotion.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {formatDate(devotion.publishedAt, language)}
            </span>
          )}
          {typeof devotion.views === 'number' && (
            <span className="inline-flex items-center gap-1">
              <EyeIcon className="h-3 w-3" />
              {devotion.views}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{devotion.scriptureRef}</p>
        <CardTitle className="text-lg">{devotion.title}</CardTitle>
      </CardHeader>
      {devotion.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image src={devotion.imageUrl} alt="묵상 대표 이미지" fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
        </div>
      )}
      <CardContent>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{devotion.excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>작성자: {devotion.authorName ?? '익명'}</span>
        </div>
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link href={`/devotion/${devotion.id}`}>자세히 보기</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
