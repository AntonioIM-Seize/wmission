'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createDevotionAction } from '@/app/(public)/devotion/write/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/uploads/image-uploader';
import { devotionCreateSchema, type DevotionCreateValues } from '@/lib/validators/devotion';

const defaultValues: DevotionCreateValues = {
  title: '',
  scriptureRef: '',
  scriptureText: '',
  body: '',
  imageUrl: '',
};

export function DevotionForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DevotionCreateValues>({
    resolver: zodResolver(devotionCreateSchema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createDevotionAction(values);

      if (result?.status === 'error') {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, errors]) => {
            if (errors?.length) {
              form.setError(key as keyof DevotionCreateValues, {
                type: 'server',
                message: errors[0],
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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>묵상 작성</CardTitle>
        <CardDescription>말씀을 묵상하며 받은 은혜를 나눠주세요. 등록 후 관리자가 내용을 검토합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="묵상 제목을 입력하세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="scriptureRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성경 구절</FormLabel>
                    <FormControl>
                      <Input placeholder="예) 요한복음 3:16" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scriptureText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>구절 내용</FormLabel>
                    <FormControl>
                      <Textarea placeholder="본문 내용을 입력해주세요." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>묵상 내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="받은 은혜와 기도 제목을 자유롭게 나눠주세요."
                      className="min-h-[220px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대표 이미지 (선택)</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value || null}
                      onChange={(url) => field.onChange(url ?? '')}
                      label="이미지는 5MB 이하의 파일만 업로드할 수 있습니다."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? '등록 중...' : '묵상 등록'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-end text-xs text-muted-foreground">
        다른 언어 사용자와 공유할 때에는 브라우저의 자동 번역 기능을 이용해주세요.
      </CardFooter>
    </Card>
  );
}
