'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { loginAction } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';

type LoginFormProps = {
  redirectTo?: string;
};

const defaultValues: LoginFormValues = {
  email: '',
  password: '',
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction({ ...values, redirectTo });

      if (result?.status === 'error') {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, value]) => {
            if (value?.length) {
              form.setError(key as keyof LoginFormValues, {
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
        <CardTitle>로그인</CardTitle>
        <CardDescription>등록된 이메일과 비밀번호로 로그인해주세요.</CardDescription>
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
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        아직 계정이 없으신가요? <a href="/register" className="ml-2 text-primary underline-offset-4 hover:underline">회원가입</a>
      </CardFooter>
    </Card>
  );
}
