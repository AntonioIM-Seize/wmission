import { z } from 'zod';

export const siteSettingsSchema = z.object({
  id: z.string().uuid(),
  verseRef: z
    .string()
    .trim()
    .min(3, '성경 구절을 입력해주세요.')
    .max(120, '성경 구절은 120자 이내로 입력해주세요.'),
  verseText: z
    .string()
    .trim()
    .min(5, '말씀 내용을 입력해주세요.')
    .max(1500, '말씀 내용은 1500자 이내로 입력해주세요.'),
  mainPrayer: z
    .string()
    .trim()
    .min(5, '메인 기도 제목을 입력해주세요.')
    .max(200, '메인 기도 제목은 200자 이내로 입력해주세요.'),
  bankName: z
    .string()
    .trim()
    .min(2, '은행명을 입력해주세요.')
    .max(60, '은행명은 60자 이내로 입력해주세요.'),
  bankAccount: z
    .string()
    .trim()
    .min(3, '계좌번호를 입력해주세요.')
    .max(40, '계좌번호는 40자 이내로 입력해주세요.')
    .regex(/^[0-9\s-]+$/, '계좌번호는 숫자와 공백, 하이픈만 사용할 수 있습니다.'),
  bankHolder: z
    .string()
    .trim()
    .min(2, '예금주를 입력해주세요.')
    .max(60, '예금주는 60자 이내로 입력해주세요.'),
});

export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
