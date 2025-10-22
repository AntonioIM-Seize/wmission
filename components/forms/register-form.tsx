'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { registerAction } from '@/app/(auth)/register/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth';

const defaultValues: RegisterFormValues = {
  email: '',
  password: '',
  passwordConfirm: '',
  fullName: '',
  phone: '',
  joinReason: '',
};

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await registerAction(values);

      if (result?.status === 'error') {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, value]) => {
            if (value?.length) {
              form.setError(key as keyof RegisterFormValues, {
                type: 'server',
                message: value[0],
              });
            }
          });
        }
        setServerError(result.message);
        toast.error(result.message);
      }
    });
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>선교 공동체에 참여하시려면 아래 정보를 정확히 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input placeholder="영문, 숫자, 특수문자 조합 8자 이상" type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연락처</FormLabel>
                  <FormControl>
                    <Input placeholder="010-1234-5678" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joinReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>가입 이유</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="커뮤니티에 참여하고 싶은 이유를 구체적으로 작성해주세요."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '등록 중...' : '회원가입'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        이미 계정이 있으신가요? <a href="/login" className="ml-2 text-primary underline-offset-4 hover:underline">로그인하기</a>
      </CardFooter>
    </Card>
  );
}
