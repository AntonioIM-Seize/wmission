'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createPrayerAction } from '@/app/(public)/prayer/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/uploads/image-uploader';
import { prayerCreateSchema, type PrayerCreateValues } from '@/lib/validators/prayer';

const defaultValues: PrayerCreateValues = {
  content: '',
  imageUrl: '',
};

export function PrayerForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PrayerCreateValues>({
    resolver: zodResolver(prayerCreateSchema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createPrayerAction(values);

      if (result && result.status === 'error') {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, errors]) => {
            if (errors?.length) {
              form.setError(key as keyof PrayerCreateValues, {
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

      form.reset();
      toast.success('기도 제목이 등록되었습니다. 감사합니다!');
    });
  });

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-lg">기도 제목 나누기</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>기도 내용</FormLabel>
                  <FormControl>
                    <Textarea placeholder="함께 기도하고 싶은 내용을 작성해주세요." className="min-h-[140px]" {...field} />
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
              {isPending ? '등록 중...' : '기도 제목 등록'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        브라우저 자동 번역 기능을 활용해 다른 언어 사용자와 기도를 나눌 수 있습니다. 부적절한 내용은 관리자에 의해 삭제될 수 있습니다.
      </CardFooter>
    </Card>
  );
}
