"use server";

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { inquirySubmitSchema } from '@/lib/validators/inquiry';
import { logError } from '@/lib/monitoring/logger';
import type { InquiryFormState } from '@/app/(public)/support/form-state';

export async function submitInquiryAction(
  _prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  
  const parsed = inquirySubmitSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from('inquiries').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message: parsed.data.message,
  });

  if (error) {
    logError('문의 저장 실패', { error });
    return {
      status: 'error',
      message: '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  revalidatePath('/support');

  return {
    status: 'success',
    message: '문의가 접수되었습니다. 최대 48시간 이내에 연락드리겠습니다.',
  };
}
