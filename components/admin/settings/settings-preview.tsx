import { SparklesIcon } from 'lucide-react';

import type { SiteSettings } from '@/lib/data/settings';
import type { SupportedLanguage } from '@/lib/i18n/config';
import { formatDate } from '@/lib/utils/date';
import { CopyButton } from '@/components/admin/settings/copy-button';

type SettingsPreviewProps = {
  settings: SiteSettings;
  language: SupportedLanguage;
};

export function SettingsPreview({ settings, language }: SettingsPreviewProps) {
  const updatedLabel = settings.updatedAt ? formatDate(settings.updatedAt, language) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <SparklesIcon className="h-4 w-4 text-amber-500" />
          홈 화면 프리뷰
        </div>
        <p className="mt-4 text-sm font-semibold text-amber-700">{settings.verseRef}</p>
        <blockquote className="mt-2 whitespace-pre-line rounded-md border border-dashed border-amber-200 bg-amber-50/80 p-4 text-sm leading-relaxed text-slate-800">
          {settings.verseText}
        </blockquote>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p>메인 기도 제목</p>
          <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-slate-900">{settings.mainPrayer}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-slate-900">후원 계좌</p>
            <p>{settings.bankName}</p>
          </div>
          <CopyButton value={`${settings.bankName} ${settings.bankAccount} ${settings.bankHolder}`} label="계좌 복사" />
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
            <dt className="text-muted-foreground">계좌번호</dt>
            <dd className="font-medium text-slate-900">{settings.bankAccount}</dd>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
            <dt className="text-muted-foreground">예금주</dt>
            <dd className="font-medium text-slate-900">{settings.bankHolder}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-slate-900">관리 가이드</p>
        <ul className="mt-2 space-y-1">
          <li>- Verse/기도 문구는 HTML 없이 순수 텍스트로 입력해주세요.</li>
          <li>- 계좌번호 변경 시 Vercel 환경 변수 업데이트 여부를 다시 확인하세요.</li>
          <li>- 값 저장 후 1분 이내에 홈·후원 페이지에 자동 반영됩니다.</li>
        </ul>
        {updatedLabel && <p className="mt-3 text-xs">마지막 수정일: {updatedLabel}</p>}
      </div>
    </div>
  );
}
