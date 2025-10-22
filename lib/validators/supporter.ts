import { z } from 'zod';

export const supporterUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, '후원자 이름을 입력해주세요.'),
  amount: z
    .string()
    .min(1, '후원 금액을 입력해주세요.')
    .refine((value) => !Number.isNaN(Number(value)), '유효한 금액을 입력해주세요.'),
  supportedOn: z.string().min(1, '후원 날짜를 입력해주세요.'),
  memo: z.string().optional(),
});

export type SupporterUpsertValues = z.infer<typeof supporterUpsertSchema>;
