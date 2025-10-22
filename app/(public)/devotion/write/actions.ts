'use server';

import { redirect } from 'next/navigation';

import { requireApprovedStatus } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeHTML } from '@/lib/sanitize';
import { devotionCreateSchema, type DevotionCreateValues } from '@/lib/validators/devotion';
import { logError } from '@/lib/monitoring/logger';

type DevotionActionError = {
  status: 'error';
  message: string;
  fieldErrors?: Partial<Record<keyof DevotionCreateValues, string[]>>;
};

export async function createDevotionAction(values: DevotionCreateValues): Promise<DevotionActionError | void> {
  const profile = await requireApprovedStatus(['approved']);

  const parsed = devotionCreateSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createSupabaseServerClient();

  const sanitizedBody = sanitizeHTML(parsed.data.body);
  const sanitizedScriptureText = sanitizeHTML(parsed.data.scriptureText);

  const { data, error } = await supabase
    .from('devotions')
    .insert({
      author_id: profile.id,
      title: parsed.data.title.trim(),
      scripture_ref: parsed.data.scriptureRef.trim(),
      scripture_text: sanitizedScriptureText,
      body: sanitizedBody,
      image_url: parsed.data.imageUrl ? parsed.data.imageUrl.trim() : null,
    })
    .select('id')
    .single();

  if (error || !data) {
    logError('묵상 작성 실패', { error, profileId: profile.id });
    return {
      status: 'error',
      message: '묵상 작성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  redirect(`/devotion/${data.id}`);
}
