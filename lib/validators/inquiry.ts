import { z } from 'zod';

export const inquirySubmitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, '이름을 입력해주세요.')
    .max(60, '이름은 60자 이내로 입력해주세요.'),
  email: z
    .string()
    .trim()
    .email('연락 가능한 이메일을 입력해주세요.')
    .max(120, '이메일은 120자 이내로 입력해주세요.'),
  phone: z
    .string()
    .trim()
    .max(60, '연락처는 60자 이내로 입력해주세요.')
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  message: z
    .string()
    .trim()
    .min(10, '문의 내용을 10자 이상 입력해주세요.')
    .max(1500, '문의 내용은 1500자 이내로 입력해주세요.'),
});

export type InquirySubmitValues = z.infer<typeof inquirySubmitSchema>;
