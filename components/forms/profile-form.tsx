'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { updateProfileAction } from '@/app/(public)/account/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { profileUpdateSchema, type ProfileUpdateValues } from '@/lib/validators/auth';

type ProfileFormProps = {
  initialValues: ProfileUpdateValues;
};

const emptyValues: ProfileUpdateValues = {
  fullName: '',
  phone: '',
  joinReason: '',
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      ...emptyValues,
      ...initialValues,
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);

      if (result && result.status === 'error') {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            if (errors?.length) {
              form.setError(field as keyof ProfileUpdateValues, {
                type: 'server',
                message: errors[0],
              });
            }
          });
        }
        setServerError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success('프로필이 저장되었습니다.');
      form.reset(values);
    });
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>연락처 & 가입 정보</CardTitle>
        <CardDescription>공동체 운영팀이 확인하는 기본 정보를 최신 상태로 유지해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                      placeholder="선교 공동체에 참여하고 싶은 이유를 구체적으로 작성해주세요."
                      className="min-h-[140px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '저장 중...' : '정보 저장'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        입력한 내용은 관리자만 열람하며, 기도 제목 및 묵상 작성 시 참고됩니다.
      </CardFooter>
    </Card>
  );
}
