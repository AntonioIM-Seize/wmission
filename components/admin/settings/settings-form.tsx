'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateSiteSettingsAction } from '@/app/(admin)/admin/settings/actions';
import { initialSiteSettingsActionState } from '@/app/(admin)/admin/settings/action-state';
import type { SiteSettings } from '@/lib/data/settings';

type SettingsFormProps = {
  settings: SiteSettings;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction] = useFormState(updateSiteSettingsAction, initialSiteSettingsActionState);

  useEffect(() => {
    if (state.status === 'success' && state.message) {
      toast.success(state.message);
    }
    if (state.status === 'error' && state.message) {
      toast.error(state.message);
    }
  }, [state.status, state.message]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border/60 bg-white p-6 shadow-sm text-sm">
      <input type="hidden" name="id" value={settings.id ?? ''} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="verseRef">
            오늘의 말씀 (구절)
          </label>
          <Input id="verseRef" name="verseRef" defaultValue={settings.verseRef} required className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="mainPrayer">
            메인 기도 제목
          </label>
          <Input id="mainPrayer" name="mainPrayer" defaultValue={settings.mainPrayer} required className="mt-1" />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground" htmlFor="verseText">
          말씀 내용
        </label>
        <Textarea id="verseText" name="verseText" defaultValue={settings.verseText} rows={4} required className="mt-1" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="contactEmail">
            문의 이메일
          </label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="contactPhone">
            연락처(전화/채널)
          </label>
          <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} required className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="contactNote">
            안내 문구
          </label>
          <Input id="contactNote" name="contactNote" defaultValue={settings.contactNote} required className="mt-1" />
        </div>
      </div>

      {state.status === 'error' && state.message && (
        <Alert variant="destructive">
          <AlertTitle>저장 실패</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === 'success' && state.message && (
        <Alert>
          <AlertTitle>저장 완료</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '저장 중...' : '설정 저장'}
    </Button>
  );
}
