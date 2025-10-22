'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected', 'blocked']);
const ALLOWED_ROLES = new Set(['member', 'admin']);

export async function updateUserStatusAction(formData: FormData) {
  await requireRole('admin');

  const userId = formData.get('userId');
  const status = formData.get('status');

  if (typeof userId !== 'string' || typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
    return {
      status: 'error' as const,
      message: '잘못된 요청입니다.',
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', userId);

  if (error) {
    console.error('회원 상태 변경 실패', error);
    return {
      status: 'error' as const,
      message: '상태를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  revalidatePath('/admin/users');
}

export async function updateUserRoleAction(formData: FormData) {
  await requireRole('admin');

  const userId = formData.get('userId');
  const role = formData.get('role');

  if (typeof userId !== 'string' || typeof role !== 'string' || !ALLOWED_ROLES.has(role)) {
    return {
      status: 'error' as const,
      message: '잘못된 요청입니다.',
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);

  if (error) {
    console.error('회원 역할 변경 실패', error);
    return {
      status: 'error' as const,
      message: '역할을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  revalidatePath('/admin/users');
}
