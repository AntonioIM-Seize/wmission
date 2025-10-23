import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';
import type { SupportedLanguage } from '@/lib/i18n/config';
import { getSiteSettings } from '@/lib/data/settings';
import { SettingsForm } from '@/components/admin/settings/settings-form';
import { SettingsPreview } from '@/components/admin/settings/settings-preview';
import { formatDate } from '@/lib/utils/date';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  if (!settings?.id) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
        사이트 설정 정보가 없습니다. Supabase에서 기본 데이터를 확인해주세요.
      </div>
    );
  }

  const language = await detectInitialLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">사이트 설정</h2>
          <p className="text-sm text-muted-foreground">홈/문의 페이지에 노출되는 주요 정보를 수정합니다.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/" target="_blank">
            사이트 미리보기
          </Link>
        </Button>
      </div>

      <Alert>
        <AlertTitle>브라우저 번역 안내</AlertTitle>
        <AlertDescription>
          사이트는 한국어 원문을 기준으로 제공됩니다. 다른 언어 사용자에게 공유할 때에는 브라우저의 자동 번역 기능을 활용해주세요.
        </AlertDescription>
      </Alert>

      <SettingsAuditSummary updatedAt={settings.updatedAt} language={language} />

      <Separator />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SettingsForm settings={settings} />
        <SettingsPreview settings={settings} language={language} />
      </section>
    </div>
  );
}

type SettingsAuditSummaryProps = {
  updatedAt?: string;
  language: SupportedLanguage;
};

function SettingsAuditSummary({ updatedAt, language }: SettingsAuditSummaryProps) {
  if (!updatedAt) {
    return (
      <Alert variant="destructive">
        <AlertTitle>최초 설정이 필요합니다</AlertTitle>
        <AlertDescription>Supabase 콘솔에서 기본 데이터를 입력한 뒤 저장해주세요.</AlertDescription>
      </Alert>
    );
  }

  const updatedDate = new Date(updatedAt);
  const diffDays = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = diffDays > 60;
  const isWarning = !isStale && diffDays > 30;

  const statusVariant = isStale ? 'destructive' : 'default';

  return (
    <Alert variant={statusVariant}>
      <AlertTitle>최근 저장 정보</AlertTitle>
      <AlertDescription>
        마지막 수정일은 {formatDate(updatedAt, language)} ({diffDays}일 경과)입니다. 정기적으로 내용을 검토해주세요.
        {isWarning && ' 최근 30일 내 변경 이력이 없습니다.'}
        {isStale && ' 60일 이상 경과했습니다. 최신 정보를 유지해주세요.'}
      </AlertDescription>
    </Alert>
  );
}
