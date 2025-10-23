'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireApprovedStatus, getCurrentProfile } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeHTML } from '@/lib/sanitize';
import { prayerCreateSchema, prayerUpdateSchema, type PrayerCreateValues, type PrayerUpdateValues } from '@/lib/validators/prayer';
import { logError } from '@/lib/monitoring/logger';
import { removePublicStorageFile } from '@/lib/storage/utils';

type PrayerActionError = {
  status: 'error';
  message: string;
  fieldErrors?: Partial<Record<keyof PrayerCreateValues, string[]>>;
};

export async function createPrayerAction(values: PrayerCreateValues): Promise<PrayerActionError | void> {
  const profile = await requireApprovedStatus(['approved']);

  const parsed = prayerCreateSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const sanitizedContent = sanitizeHTML(parsed.data.content);

  const { data, error } = await supabase
    .from('prayers')
    .insert({
      author_id: profile.id,
      content: sanitizedContent,
      image_url: parsed.data.imageUrl ? parsed.data.imageUrl.trim() : null,
    })
    .select('id')
    .single();

  if (error || !data) {
    logError('기도 작성 실패', { error, profileId: profile.id });
    return {
      status: 'error',
      message: '기도 제목을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  revalidatePath('/prayer');
}

type ReactionPayload = {
  prayerId: string;
  reaction: 'amen' | 'together';
  revalidate?: string[];
};

type ReactionResult = { status: 'error'; message: string } | { status: 'success' };

export async function reactPrayerAction(payload: ReactionPayload): Promise<ReactionResult> {
  const profile = await getCurrentProfile();

  if (!profile) {
    return {
      status: 'error',
      message: '로그인 후 참여할 수 있습니다.',
    };
  }

  if (profile.status === 'blocked') {
    return {
      status: 'error',
      message: '차단된 계정은 반응을 남길 수 없습니다.',
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from('prayer_reactions').insert({
    prayer_id: payload.prayerId,
    member_id: profile.id,
    reaction_type: payload.reaction,
  });

  if (error) {
    // 고유 제약 조건 위반(중복 반응)은 무시
    if ('code' in error && error.code === '23505') {
      return { status: 'success' };
    }

    logError('기도 반응 등록 실패', { error, profileId: profile.id, payload });
    return {
      status: 'error',
      message: '반응을 남기지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  const paths = new Set(['/prayer']);
  payload.revalidate?.forEach((path) => paths.add(path));
  paths.forEach((path) => revalidatePath(path));

  return { status: 'success' };
}

type UpdatePrayerResult =
  | {
      status: 'error';
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | void;

export async function updatePrayerAction(values: PrayerUpdateValues): Promise<UpdatePrayerResult> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?redirectTo=/prayer');
  }

  const parsed = prayerUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: prayer, error } = await supabase
    .from('prayers')
    .select('author_id, image_url')
    .eq('id', parsed.data.id)
    .maybeSingle();

  if (error || !prayer) {
    logError('기도 조회 실패', { error, prayerId: parsed.data.id });
    return {
      status: 'error',
      message: '기도 제목을 찾지 못했습니다.',
    };
  }

  if (prayer.author_id !== profile.id && !isAdmin(profile.role)) {
    return {
      status: 'error',
      message: '수정 권한이 없습니다.',
    };
  }

  const nextImageUrl = parsed.data.imageUrl ? parsed.data.imageUrl.trim() : null;
  const sanitizedContent = sanitizeHTML(parsed.data.content);

  const { error: updateError } = await supabase
    .from('prayers')
    .update({
      content: sanitizedContent,
      image_url: nextImageUrl,
    })
    .eq('id', parsed.data.id);

  if (updateError) {
    logError('기도 수정 실패', { error: updateError, prayerId: parsed.data.id });
    return {
      status: 'error',
      message: '기도 제목을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  if (prayer.image_url && prayer.image_url !== nextImageUrl) {
    await removePublicStorageFile(supabase, prayer.image_url);
  }

  revalidatePath('/prayer');
  revalidatePath(`/prayer/${parsed.data.id}`);
  redirect(`/prayer/${parsed.data.id}`);
}
