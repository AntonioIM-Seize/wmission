'use server';

import { redirect } from 'next/navigation';

import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

type RegisterActionError = {
  status: 'error';
  message: string;
  fieldErrors?: Partial<Record<keyof RegisterFormValues, string[]>>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function registerAction(values: RegisterFormValues): Promise<RegisterActionError | void> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('회원가입 실패', error);
    return {
      status: 'error',
      message: error.message || '회원가입 중 오류가 발생했습니다.',
    };
  }

  const userId = data.user?.id;

  if (userId) {
    const profileUpdatePayload = {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      join_reason: parsed.data.joinReason,
      status: 'pending',
    } satisfies Database['public']['Tables']['profiles']['Update'];

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdatePayload)
      .eq('id', userId);

    if (profileError) {
      console.error('프로필 업데이트 실패', profileError);
      return {
        status: 'error',
        message: '프로필 정보를 저장하지 못했습니다. 관리자에게 문의해주세요.',
      };
    }
  }

  redirect('/login?registered=1');
}
