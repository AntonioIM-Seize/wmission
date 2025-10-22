'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { removePublicStorageFile } from '@/lib/storage/utils';
import { logError } from '@/lib/monitoring/logger';

type ActionResult = void | { status: 'error'; message: string };

export async function deletePrayerAdminAction(formData: FormData): Promise<ActionResult> {
  await requireRole('admin');

  const prayerId = formData.get('prayerId');

  if (typeof prayerId !== 'string') {
    return { status: 'error', message: '잘못된 요청입니다.' };
  }

  const supabase = createSupabaseServerClient();
  const { data: prayer, error: fetchError } = await supabase
    .from('prayers')
    .select('image_url')
    .eq('id', prayerId)
    .maybeSingle();

  if (fetchError) {
    logError('관리자 기도 삭제 전 조회 실패', { error: fetchError, prayerId });
  }

  const { error } = await supabase.from('prayers').delete().eq('id', prayerId);

  if (error) {
    logError('관리자 기도 삭제 실패', { error, prayerId });
    return { status: 'error', message: '기도 제목을 삭제하지 못했습니다.' };
  }

  if (prayer?.image_url) {
    await removePublicStorageFile(supabase, prayer.image_url);
  }

  revalidatePath('/admin/prayers');
  revalidatePath(`/admin/prayers/${prayerId}`);
}

export async function togglePrayerAnsweredAction(formData: FormData): Promise<ActionResult> {
  await requireRole('admin');

  const prayerId = formData.get('prayerId');
  const answered = formData.get('answered');

  if (typeof prayerId !== 'string' || typeof answered !== 'string') {
    return { status: 'error', message: '잘못된 요청입니다.' };
  }

  const isAnswered = answered === 'true';

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('prayers')
    .update({
      is_answered: isAnswered,
      answered_at: isAnswered ? new Date().toISOString() : null,
    })
    .eq('id', prayerId);

  if (error) {
    logError('기도 응답 상태 갱신 실패', { error, prayerId, nextState: isAnswered });
    return { status: 'error', message: '응답 상태를 변경하지 못했습니다.' };
  }

  revalidatePath('/admin/prayers');
  revalidatePath(`/admin/prayers/${prayerId}`);
}
