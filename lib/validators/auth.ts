import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .regex(/[A-Z]/, '대문자를 최소 한 글자 포함해야 합니다.')
  .regex(/[a-z]/, '소문자를 최소 한 글자 포함해야 합니다.')
  .regex(/\d/, '숫자를 최소 한 글자 포함해야 합니다.')
  .regex(/[^A-Za-z0-9]/, '특수문자를 최소 한 글자 포함해야 합니다.');

export const registerSchema = z
  .object({
    email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
    password: passwordSchema,
    passwordConfirm: z.string(),
    fullName: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
    phone: z
      .string()
      .regex(/^[0-9+\-() ]+$/, '전화번호 형식이 올바르지 않습니다.')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    joinReason: z.string().min(10, '가입 이유는 10자 이상 작성해주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호 확인이 일치하지 않습니다.',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z
    .string()
    .regex(/^[0-9+\-() ]+$/, '전화번호 형식이 올바르지 않습니다.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  joinReason: z.string().min(10, '가입 이유는 10자 이상 작성해주세요.'),
});

export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
