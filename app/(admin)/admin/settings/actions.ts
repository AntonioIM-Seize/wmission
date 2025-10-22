'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { siteSettingsSchema } from '@/lib/validators/settings';
import { logError } from '@/lib/monitoring/logger';

export type SiteSettingsActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export const initialSiteSettingsActionState: SiteSettingsActionState = {
  status: 'idle',
};

export async function updateSiteSettingsAction(
  _prevState: SiteSettingsActionState | undefined,
  formData: FormData,
): Promise<SiteSettingsActionState> {
  await requireRole('admin');

  const parsed = siteSettingsSchema.safeParse({
    id: formData.get('id')?.toString(),
    verseRef: formData.get('verseRef'),
    verseText: formData.get('verseText'),
    mainPrayer: formData.get('mainPrayer'),
    bankName: formData.get('bankName'),
    bankAccount: formData.get('bankAccount'),
    bankHolder: formData.get('bankHolder'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.',
    };
  }

  const supabase = createSupabaseServerClient();
  const values = parsed.data;

  const { error } = await supabase
    .from('site_settings')
    .update({
      verse_ref: values.verseRef,
      verse_text: values.verseText,
      main_prayer: values.mainPrayer,
      bank_name: values.bankName,
      bank_account: values.bankAccount,
      bank_holder: values.bankHolder,
    })
    .eq('id', values.id);

  if (error) {
    logError('사이트 설정 업데이트 실패', { error, settingsId: values.id });
    return { status: 'error', message: '설정을 저장하지 못했습니다.' };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/');
  revalidatePath('/support');

  return { status: 'success', message: '설정을 저장했습니다.' };
}
