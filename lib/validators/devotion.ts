import { z } from 'zod';

export const devotionCreateSchema = z.object({
  title: z.string().min(3, '제목은 최소 3자 이상 입력해주세요.'),
  scriptureRef: z.string().min(2, '성경 구절을 입력해주세요.'),
  scriptureText: z.string().min(5, '구절 내용을 입력해주세요.'),
  body: z.string().min(50, '묵상 내용은 최소 50자 이상 작성해주세요.'),
  imageUrl: z.string().url('올바른 이미지 주소가 아닙니다.').optional().or(z.literal('').transform(() => undefined)),
});

export type DevotionCreateValues = z.infer<typeof devotionCreateSchema>;

export const devotionUpdateSchema = devotionCreateSchema.extend({
  id: z.string().uuid(),
});

export type DevotionUpdateValues = z.infer<typeof devotionUpdateSchema>;
