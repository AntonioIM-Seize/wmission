import { z } from 'zod';

export const prayerCreateSchema = z.object({
  content: z.string().min(10, '기도 제목은 최소 10자 이상 작성해주세요.'),
  imageUrl: z.string().url('올바른 이미지 주소가 아닙니다.').optional().or(z.literal('').transform(() => undefined)),
});

export type PrayerCreateValues = z.infer<typeof prayerCreateSchema>;

export const prayerUpdateSchema = prayerCreateSchema.extend({
  id: z.string().uuid(),
});

export type PrayerUpdateValues = z.infer<typeof prayerUpdateSchema>;
