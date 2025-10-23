'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getCurrentProfile } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { profileUpdateSchema, type ProfileUpdateValues } from '@/lib/validators/auth';
import type { Database } from '@/types/supabase';

type ProfileUpdateActionResult =
  | {
      status: 'error';
      message: string;
      fieldErrors?: Partial<Record<keyof ProfileUpdateValues, string[]>>;
    }
  | void;

export async function updateProfileAction(values: ProfileUpdateValues): Promise<ProfileUpdateActionResult> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?redirectTo=/account');
  }

  const parsed = profileUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const payload = parsed.data;

  const updatePayload = {
    full_name: payload.fullName.trim(),
    phone: payload.phone ? payload.phone.trim() : null,
    join_reason: payload.joinReason.trim(),
  } satisfies Database['public']['Tables']['profiles']['Update'];

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', profile.id);

  if (error) {
    console.error('프로필 업데이트 실패', error);
    return {
      status: 'error',
      message: '프로필을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  revalidatePath('/account');
  revalidatePath('/', 'layout');
}
