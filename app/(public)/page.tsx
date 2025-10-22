import type { Metadata } from 'next';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DevotionCard } from '@/components/cards/devotion-card';
import { PrayerCard } from '@/components/cards/prayer-card';
import { LANGUAGE_LABEL, type SupportedLanguage } from '@/lib/i18n/config';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import { getHomeData } from '@/lib/data/home';

const TITLE = '위루다 선교 기도 공동체';
const DESCRIPTION =
  '선교지 소식과 기도 제목을 나누고 함께 중보하는 온라인 공동체입니다. 오늘의 말씀과 기도 제목을 확인하세요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: TITLE,
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function HomePage() {
  const language = detectInitialLanguage();

  const { settings, devotions, prayers } = await getHomeData();

  const showTranslationNotice = language !== 'ko';

  return (
    <div className="space-y-12">
      {showTranslationNotice && <TranslationNotice language={language} />}

      <section className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-sm">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Badge variant="secondary">오늘의 말씀</Badge>
              {settings && <span className="text-primary">{settings.verseRef}</span>}
            </div>
            <h1 className="text-3xl font-semibold leading-snug text-slate-900 md:text-4xl">
              {settings?.verseText ?? '오늘의 말씀이 준비중입니다.'}
            </h1>
          </div>
          <div className="space-y-5 rounded-2xl border border-border bg-white/80 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">메인 기도 제목</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {settings?.mainPrayer ?? '주요 기도 제목이 곧 업데이트 됩니다.'}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-800">후원 계좌</p>
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
                <p className="font-semibold text-primary">{settings?.bankName ?? '-'}</p>
                <p className="mt-1 font-mono text-base text-slate-900">{settings?.bankAccount ?? '-'}</p>
                <p className="text-xs text-muted-foreground">예금주: {settings?.bankHolder ?? '-'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="default">
                <Link href="/prayer">기도 목록 보기</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/support">후원 안내</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">최근 묵상</h2>
            <p className="text-sm text-muted-foreground">선교지 소식을 담은 묵상을 나눕니다.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/devotion">더 많은 묵상 보기</Link>
          </Button>
        </div>
        {devotions.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {devotions.map((devotion) => (
              <DevotionCard key={devotion.id} devotion={devotion} language={language} />
            ))}
          </div>
        ) : (
          <EmptyState message="등록된 묵상이 아직 없습니다." />
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">기도로 함께해요</h2>
            <p className="text-sm text-muted-foreground">가장 최근에 올라온 기도 제목입니다.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/prayer">기도 전체 보기</Link>
          </Button>
        </div>
        {prayers.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {prayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} language={language} />
            ))}
          </div>
        ) : (
          <EmptyState message="기도 제목이 등록되면 이곳에서 확인할 수 있습니다." />
        )}
      </section>
    </div>
  );
}

type TranslationNoticeProps = {
  language: SupportedLanguage;
};

function TranslationNotice({ language }: TranslationNoticeProps) {
  return (
    <Alert className="border-sky-200 bg-sky-50">
      <AlertTitle>브라우저 자동 번역 안내</AlertTitle>
      <AlertDescription>
        현재 언어 ({LANGUAGE_LABEL[language] ?? language}) 사용자이시라면 브라우저의 자동 번역 기능을 사용하여
        콘텐츠를 번역해 주세요. 본 서비스는 한국어 원문을 기본으로 제공합니다.
      </AlertDescription>
    </Alert>
  );
}

type EmptyStateProps = {
  message: string;
};

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
