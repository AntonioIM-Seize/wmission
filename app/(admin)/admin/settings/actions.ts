 'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { siteSettingsSchema } from '@/lib/validators/settings';
import { logError } from '@/lib/monitoring/logger';
import type { Database } from '@/types/supabase';
import type { SiteSettingsActionState } from './action-state';

export async function updateSiteSettingsAction(
  _prevState: SiteSettingsActionState | undefined,
  formData: FormData,
): Promise<SiteSettingsActionState> {
  'use server';

  await requireRole('admin');

  const parsed = siteSettingsSchema.safeParse({
    id: formData.get('id')?.toString(),
    verseRef: formData.get('verseRef'),
    verseText: formData.get('verseText'),
    mainPrayer: formData.get('mainPrayer'),
    contactEmail: formData.get('contactEmail'),
    contactPhone: formData.get('contactPhone'),
    contactNote: formData.get('contactNote'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const values = parsed.data;

  const updatePayload = {
    verse_ref: values.verseRef,
    verse_text: values.verseText,
    main_prayer: values.mainPrayer,
    contact_email: values.contactEmail,
    contact_phone: values.contactPhone,
    contact_note: values.contactNote,
  } satisfies Database['public']['Tables']['site_settings']['Update'];

  const { error } = await supabase
    .from('site_settings')
    .update(updatePayload)
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
