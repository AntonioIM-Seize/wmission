import type { InquirySubmitValues } from '@/lib/validators/inquiry';

export type InquiryFormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | {
      status: 'error';
      message: string;
      fieldErrors?: Partial<Record<keyof InquirySubmitValues, string[]>>;
    };

export const initialInquiryFormState: InquiryFormState = { status: 'idle' };
