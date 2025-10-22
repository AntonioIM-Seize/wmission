'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeHTML } from '@/lib/sanitize';
import { getCurrentProfile } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/utils';
import { devotionUpdateSchema, type DevotionUpdateValues } from '@/lib/validators/devotion';
import { removePublicStorageFile } from '@/lib/storage/utils';
import { logError } from '@/lib/monitoring/logger';

type DeleteActionResult =
  | {
      status: 'error';
      message: string;
    }
  | void;

export async function deleteDevotionAction(formData: FormData): Promise<DeleteActionResult> {
  const id = formData.get('devotionId');
  if (!id || typeof id !== 'string') {
    return {
      status: 'error',
      message: '잘못된 요청입니다.',
    };
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?redirectTo=/devotion');
  }

  const supabase = createSupabaseServerClient();

  const { data: devotion, error } = await supabase
    .from('devotions')
    .select('id, author_id, image_url')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logError('묵상 조회 실패', { error, devotionId: id });
    return {
      status: 'error',
      message: '삭제할 묵상을 찾지 못했습니다.',
    };
  }

  if (!devotion) {
    return {
      status: 'error',
      message: '이미 삭제되었거나 존재하지 않는 묵상입니다.',
    };
  }

  if (devotion.author_id !== profile.id && !isAdmin(profile.role)) {
    return {
      status: 'error',
      message: '삭제 권한이 없습니다.',
    };
  }

  const { error: deleteError } = await supabase.from('devotions').delete().eq('id', id);

  if (deleteError) {
    logError('묵상 삭제 실패', { error: deleteError, devotionId: id });
    return {
      status: 'error',
      message: '묵상을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  if (devotion.image_url) {
    await removePublicStorageFile(supabase, devotion.image_url);
  }

  redirect('/devotion');
}

type UpdateActionResult =
  | {
      status: 'error';
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | void;

export async function updateDevotionAction(values: DevotionUpdateValues): Promise<UpdateActionResult> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  const parsed = devotionUpdateSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors,
    };
  }

  const supabase = createSupabaseServerClient();

  const { data: devotion, error } = await supabase
    .from('devotions')
    .select('author_id, image_url')
    .eq('id', parsed.data.id)
    .maybeSingle();

  if (error || !devotion) {
    logError('묵상 조회 실패', { error, devotionId: parsed.data.id });
    return {
      status: 'error',
      message: '묵상을 찾지 못했습니다.',
    };
  }

  if (devotion.author_id !== profile.id && !isAdmin(profile.role)) {
    return {
      status: 'error',
      message: '수정 권한이 없습니다.',
    };
  }

  const nextImageUrl = parsed.data.imageUrl ? parsed.data.imageUrl.trim() : null;

  const { error: updateError } = await supabase
    .from('devotions')
    .update({
      title: parsed.data.title.trim(),
      scripture_ref: parsed.data.scriptureRef.trim(),
      scripture_text: sanitizeHTML(parsed.data.scriptureText),
      body: sanitizeHTML(parsed.data.body),
      image_url: nextImageUrl,
    })
    .eq('id', parsed.data.id);

  if (updateError) {
    logError('묵상 업데이트 실패', { error: updateError, devotionId: parsed.data.id });
    return {
      status: 'error',
      message: '묵상을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  if (devotion.image_url && devotion.image_url !== nextImageUrl) {
    await removePublicStorageFile(supabase, devotion.image_url);
  }

  revalidatePath('/devotion');
  revalidatePath(`/devotion/${parsed.data.id}`);
  redirect(`/devotion/${parsed.data.id}`);
}
