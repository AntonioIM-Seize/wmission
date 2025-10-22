'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { removePublicStorageFile } from '@/lib/storage/utils';
import { logError } from '@/lib/monitoring/logger';

type ActionResponse = void | { status: 'error'; message: string };

export async function deleteDevotionAdminAction(formData: FormData): Promise<ActionResponse> {
  await requireRole('admin');

  const devotionId = formData.get('devotionId');

  if (typeof devotionId !== 'string') {
    return { status: 'error', message: '잘못된 요청입니다.' };
  }

  const supabase = createSupabaseServerClient();
  const { data: devotion, error: fetchError } = await supabase
    .from('devotions')
    .select('image_url')
    .eq('id', devotionId)
    .maybeSingle();

  if (fetchError) {
    logError('관리자 묵상 삭제 전 조회 실패', { error: fetchError, devotionId });
  }

  const { error } = await supabase.from('devotions').delete().eq('id', devotionId);

  if (error) {
    logError('관리자 묵상 삭제 실패', { error, devotionId });
    return { status: 'error', message: '묵상을 삭제하지 못했습니다.' };
  }

  if (devotion?.image_url) {
    await removePublicStorageFile(supabase, devotion.image_url);
  }

  revalidatePath('/admin/devotions');
  revalidatePath(`/admin/devotions/${devotionId}`);
}
