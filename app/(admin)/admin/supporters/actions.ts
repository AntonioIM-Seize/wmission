'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supporterUpsertSchema } from '@/lib/validators/supporter';
import { logError } from '@/lib/monitoring/logger';
import type { Database } from '@/types/supabase';

export async function upsertSupporterAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const payload = supporterUpsertSchema.safeParse({
    id: formData.get('id')?.toString() || undefined,
    name: formData.get('name'),
    amount: formData.get('amount'),
    supportedOn: formData.get('supportedOn'),
    memo: formData.get('memo')?.toString() ?? undefined,
  });

  if (!payload.success) {
    logError('후원자 저장 검증 실패', { issues: payload.error.issues });
    return;
  }

  const supabase = await createSupabaseServerClient();
  const values = payload.data;

  const upsertPayload = {
    id: values.id,
    name: values.name.trim(),
    amount: Number(values.amount),
    supported_on: values.supportedOn,
    memo: values.memo ? values.memo.trim() : null,
  } satisfies Database['public']['Tables']['supporters']['Insert'];

  const { error } = await supabase
    .from('supporters')
    .upsert(upsertPayload, { onConflict: 'id' });

  if (error) {
    logError('후원자 저장 실패', { error, supporterId: values.id });
    return;
  }

  revalidatePath('/admin/supporters');
}

export async function deleteSupporterAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const supporterId = formData.get('supporterId');

  if (typeof supporterId !== 'string') {
    logError('후원자 삭제 실패 - 잘못된 supporterId', { supporterId });
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('supporters').delete().eq('id', supporterId);

  if (error) {
    logError('후원자 삭제 실패', { error, supporterId });
    return;
  }

  revalidatePath('/admin/supporters');
}
