'use server';

import { redirect } from 'next/navigation';

import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdmin, isApproved } from '@/lib/auth/utils';
import type { Database } from '@/types/supabase';

type LoginActionInput = LoginFormValues & {
  redirectTo?: string | null;
};

type LoginActionError = {
  status: 'error';
  message: string;
  fieldErrors?: Partial<Record<keyof LoginFormValues, string[]>>;
};

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function sanitizeRedirectPath(path?: string | null): string {
  if (!path) {
    return '/';
  }

  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/http')) {
    return '/';
  }

  const forbidden = ['/login', '/register'];
  if (forbidden.includes(path)) {
    return '/';
  }

  return path;
}

export async function loginAction(values: LoginActionInput): Promise<LoginActionError | void> {
  const parsed = loginSchema.safeParse({
    email: values.email,
    password: values.password,
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error('로그인 실패', error);
    return {
      status: 'error',
      message: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
    };
  }

  const user = data.user;

  if (!user) {
    return {
      status: 'error',
      message: '사용자 정보를 불러오지 못했습니다.',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (profileError || !profile) {
    console.error('프로필 조회 실패', profileError);
    return {
      status: 'error',
      message: '프로필 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  if (profile.status === 'blocked') {
    await supabase.auth.signOut();
    return {
      status: 'error',
      message: '이 계정은 차단되었습니다. 관리자에게 문의해주세요.',
    };
  }

  const updateResult = await supabase
    .from('profiles')
    .update({
      last_login_at: new Date().toISOString(),
    } satisfies Database['public']['Tables']['profiles']['Update'])
    .eq('id', profile.id);

  if (updateResult.error) {
    console.warn('마지막 로그인 시간 업데이트 실패', updateResult.error);
  }

  const redirectPath = sanitizeRedirectPath(values.redirectTo);

  if (!isApproved(profile.status) && !isAdmin(profile.role)) {
    redirect('/?notice=pending');
  }

  redirect(redirectPath);
}
