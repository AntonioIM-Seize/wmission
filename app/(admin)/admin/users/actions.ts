'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database, ProfileStatus, UserRole } from '@/types/supabase';

const ALLOWED_STATUSES = new Set<ProfileStatus>(['pending', 'approved', 'rejected', 'blocked']);
const ALLOWED_ROLES = new Set<UserRole>(['member', 'admin']);

function isProfileStatus(value: unknown): value is ProfileStatus {
  return typeof value === 'string' && ALLOWED_STATUSES.has(value as ProfileStatus);
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && ALLOWED_ROLES.has(value as UserRole);
}

export async function updateUserStatusAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const userId = formData.get('userId');
  const status = formData.get('status');

  if (typeof userId !== 'string' || !isProfileStatus(status)) {
    console.error('회원 상태 변경 실패 - 잘못된 입력', { userId, status });
    return;
  }

  const supabase = await createSupabaseServerClient();
  const updatePayload = {
    status,
    approved_at: status === 'approved' ? new Date().toISOString() : null,
  } satisfies Database['public']['Tables']['profiles']['Update'];
  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId);

  if (error) {
    console.error('회원 상태 변경 실패', error);
    return;
  }

  revalidatePath('/admin/users');
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const userId = formData.get('userId');
  const role = formData.get('role');

  if (typeof userId !== 'string' || !isUserRole(role)) {
    console.error('회원 역할 변경 실패 - 잘못된 입력', { userId, role });
    return;
  }

  const supabase = await createSupabaseServerClient();
  const updatePayload = { role } satisfies Database['public']['Tables']['profiles']['Update'];
  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId);

  if (error) {
    console.error('회원 역할 변경 실패', error);
    return;
  }

  revalidatePath('/admin/users');
}
