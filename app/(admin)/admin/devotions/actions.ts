'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logError } from '@/lib/monitoring/logger';
import { removePublicStorageFile } from '@/lib/storage/utils';
import type { Database } from '@/types/supabase';

type DevotionId = Database['public']['Tables']['devotions']['Row']['id'];
type DevotionImageRow = Pick<Database['public']['Tables']['devotions']['Row'], 'id' | 'image_url'>;

export async function deleteDevotionAdminAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const devotionId = formData.get('devotionId');

  if (typeof devotionId !== 'string') {
    throw new Error('잘못된 요청입니다.');
  }
  const parsedDevotionId: DevotionId = devotionId;

  const supabase = await createSupabaseServerClient();
  const { data: devotion, error: fetchError } = await supabase
    .from('devotions')
    .select('id,image_url')
    .match({ id: parsedDevotionId })
    .maybeSingle<DevotionImageRow>();

  if (fetchError) {
    logError('관리자 묵상 삭제 전 조회 실패', { error: fetchError, devotionId });
  }

  const { error } = await supabase.from('devotions').delete().match({ id: parsedDevotionId });

  if (error) {
    logError('관리자 묵상 삭제 실패', { error, devotionId });
    throw new Error('묵상을 삭제하지 못했습니다.');
  }

  const imageUrl = devotion?.image_url ?? null;

  if (imageUrl) {
    await removePublicStorageFile(supabase, imageUrl);
  }

  revalidatePath('/admin/devotions');
  revalidatePath(`/admin/devotions/${parsedDevotionId}`);
}
