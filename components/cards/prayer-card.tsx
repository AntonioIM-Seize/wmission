import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2Icon, HandHeartIcon, HandshakeIcon } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';

import type { HomePrayer } from '@/lib/data/home';
import type { SupportedLanguage } from '@/lib/i18n/config';

type PrayerCardProps = {
  prayer: HomePrayer;
  language: SupportedLanguage;
};

export function PrayerCard({ prayer, language }: PrayerCardProps) {
  const answeredLabel = prayer.isAnswered
    ? `응답 완료 (${prayer.answeredAt ? formatDate(prayer.answeredAt, language) : ''})`
    : '응답 대기';

  return (
    <Card className="h-full border border-border/60">
      <CardHeader className="space-y-2">
        <span className="text-xs text-muted-foreground">{formatDate(prayer.createdAt, language)}</span>
        <CardTitle className="text-base">{prayer.content}</CardTitle>
      </CardHeader>
      {prayer.imageUrl && (
        <div className="relative h-36 w-full overflow-hidden">
          <Image src={prayer.imageUrl} alt="기도 대표 이미지" fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
        </div>
      )}
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2Icon className={`h-4 w-4 ${prayer.isAnswered ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          {answeredLabel}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>작성자: {prayer.authorName}</span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <HandHeartIcon className="h-4 w-4 text-rose-500" /> {prayer.reactions.amen}
            </span>
            <span className="inline-flex items-center gap-1">
              <HandshakeIcon className="h-4 w-4 text-sky-500" /> {prayer.reactions.together}
            </span>
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link href={`/prayer/${prayer.id}`}>기도 내용 보기</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
