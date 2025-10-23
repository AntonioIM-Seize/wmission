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
  contactEmail: z
    .string()
    .trim()
    .email('연락받을 이메일을 입력해주세요.')
    .max(120, '이메일은 120자 이내로 입력해주세요.'),
  contactPhone: z
    .string()
    .trim()
    .min(5, '연락 가능한 전화번호나 채널을 입력해주세요.')
    .max(60, '연락처는 60자 이내로 입력해주세요.'),
  contactNote: z
    .string()
    .trim()
    .min(5, '연락 안내 문구를 입력해주세요.')
    .max(200, '연락 안내 문구는 200자 이내로 입력해주세요.'),
});

export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
