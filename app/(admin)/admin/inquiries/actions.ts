'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logError } from '@/lib/monitoring/logger';
import type { InquiryStatus } from '@/types/supabase';

const ALLOWED_STATUS: InquiryStatus[] = ['pending', 'resolved'];

export async function updateInquiryStatusAction(formData: FormData): Promise<void> {
  await requireRole('admin');

  const inquiryId = formData.get('inquiryId');
  const nextStatus = formData.get('status');

  if (typeof inquiryId !== 'string' || typeof nextStatus !== 'string' || !ALLOWED_STATUS.includes(nextStatus as InquiryStatus)) {
    logError('문의 상태 변경 실패 - 잘못된 입력값', { inquiryId, nextStatus });
    return;
  }

  const supabase = await createSupabaseServerClient();
  const status = nextStatus as InquiryStatus;

  const { error } = await supabase
    .from('inquiries')
    .update({
      status,
      responded_at: status === 'resolved' ? new Date().toISOString() : null,
    })
    .eq('id', inquiryId);

  if (error) {
    logError('문의 상태 업데이트 실패', { error, inquiryId, status });
    return;
  }

  revalidatePath('/admin/inquiries');
}
