'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supporterUpsertSchema } from '@/lib/validators/supporter';
import { logError } from '@/lib/monitoring/logger';

type ActionResult = { status: 'error'; message: string } | void;

export async function upsertSupporterAction(formData: FormData): Promise<ActionResult> {
  await requireRole('admin');

  const payload = supporterUpsertSchema.safeParse({
    id: formData.get('id')?.toString() || undefined,
    name: formData.get('name'),
    amount: formData.get('amount'),
    supportedOn: formData.get('supportedOn'),
    memo: formData.get('memo')?.toString() ?? undefined,
  });

  if (!payload.success) {
    return {
      status: 'error',
      message: payload.error.issues[0]?.message ?? '입력값을 확인해주세요.',
    };
  }

  const supabase = createSupabaseServerClient();
  const values = payload.data;

  const { error } = await supabase.from('supporters').upsert(
    {
      id: values.id,
      name: values.name.trim(),
      amount: Number(values.amount),
      supported_on: values.supportedOn,
      memo: values.memo ? values.memo.trim() : null,
    },
    { onConflict: 'id' },
  );

  if (error) {
    logError('후원자 저장 실패', { error, supporterId: values.id });
    return { status: 'error', message: '후원 정보를 저장하지 못했습니다.' };
  }

  revalidatePath('/admin/supporters');
}

export async function deleteSupporterAction(formData: FormData): Promise<ActionResult> {
  await requireRole('admin');

  const supporterId = formData.get('supporterId');

  if (typeof supporterId !== 'string') {
    return { status: 'error', message: '잘못된 요청입니다.' };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('supporters').delete().eq('id', supporterId);

  if (error) {
    logError('후원자 삭제 실패', { error, supporterId });
    return { status: 'error', message: '후원 정보를 삭제하지 못했습니다.' };
  }

  revalidatePath('/admin/supporters');
}
