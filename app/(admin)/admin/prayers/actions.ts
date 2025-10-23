'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logError } from '@/lib/monitoring/logger';
import { removePublicStorageFile } from '@/lib/storage/utils';
import type { Database } from '@/types/supabase';

type PrayerId = Database['public']['Tables']['prayers']['Row']['id'];
type PrayerImageRow = Pick<Database['public']['Tables']['prayers']['Row'], 'id' | 'image_url'>;

export async function deletePrayerAdminAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const prayerId = formData.get('prayerId');

  if (typeof prayerId !== 'string') {
    throw new Error('잘못된 요청입니다.');
  }
  const parsedPrayerId: PrayerId = prayerId;

  const supabase = await createSupabaseServerClient();
  const { data: prayer, error: fetchError } = await supabase
    .from('prayers')
    .select('id,image_url')
    .match({ id: parsedPrayerId })
    .maybeSingle<PrayerImageRow>();

  if (fetchError) {
    logError('관리자 기도 삭제 전 조회 실패', { error: fetchError, prayerId });
  }

  const { error } = await supabase.from('prayers').delete().match({ id: parsedPrayerId });

  if (error) {
    logError('관리자 기도 삭제 실패', { error, prayerId });
    throw new Error('기도 제목을 삭제하지 못했습니다.');
  }

  const imageUrl = prayer?.image_url ?? null;

  if (imageUrl) {
    await removePublicStorageFile(supabase, imageUrl);
  }

  revalidatePath('/admin/prayers');
  revalidatePath(`/admin/prayers/${parsedPrayerId}`);
}

export async function togglePrayerAnsweredAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const prayerId = formData.get('prayerId');
  const answered = formData.get('answered');

  if (typeof prayerId !== 'string' || typeof answered !== 'string') {
    throw new Error('잘못된 요청입니다.');
  }

  const isAnswered = answered === 'true';
  const parsedPrayerId: PrayerId = prayerId;

  const supabase = await createSupabaseServerClient();
  const payload: Database['public']['Tables']['prayers']['Update'] = {
    is_answered: isAnswered,
    answered_at: isAnswered ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from('prayers')
    .update(payload)
    .match({ id: parsedPrayerId });

  if (error) {
    logError('기도 응답 상태 갱신 실패', { error, prayerId, nextState: isAnswered });
    throw new Error('응답 상태를 변경하지 못했습니다.');
  }

  revalidatePath('/admin/prayers');
  revalidatePath(`/admin/prayers/${parsedPrayerId}`);
}
