'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';

import { submitInquiryAction } from '@/app/(public)/support/actions';
import { initialInquiryFormState, type InquiryFormState } from '@/app/(public)/support/form-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(submitInquiryAction, initialInquiryFormState);

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message);
      formRef.current?.reset();
    }
    if (state.status === 'error') {
      toast.error(state.message);
    }
  }, [state]);

  const fieldErrors = state.status === 'error' ? state.fieldErrors ?? {} : {};

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <label className="text-xs text-muted-foreground" htmlFor="name">
            이름
          </label>
          <Input id="name" name="name" placeholder="홍길동" required className="mt-1" />
          {fieldErrors.name && <FieldHint message={fieldErrors.name[0]} />}
        </Field>
        <Field>
          <label className="text-xs text-muted-foreground" htmlFor="email">
            이메일
          </label>
          <Input id="email" name="email" type="email" placeholder="mission@example.com" required className="mt-1" />
          {fieldErrors.email && <FieldHint message={fieldErrors.email[0]} />}
        </Field>
      </div>
      <Field>
        <label className="text-xs text-muted-foreground" htmlFor="phone">
          연락처 (선택)
        </label>
        <Input id="phone" name="phone" placeholder="010-0000-0000 / Kakao ID" className="mt-1" />
        {fieldErrors.phone && <FieldHint message={fieldErrors.phone[0]} />}
      </Field>
      <Field>
        <label className="text-xs text-muted-foreground" htmlFor="message">
          문의 내용
        </label>
        <Textarea id="message" name="message" rows={5} placeholder="문의 내용을 작성해주세요." required className="mt-1" />
        {fieldErrors.message && <FieldHint message={fieldErrors.message[0]} />}
      </Field>

      {state.status === 'error' && !state.fieldErrors && (
        <Alert variant="destructive">
          <AlertTitle>문의 접수 실패</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === 'success' && (
        <Alert>
          <AlertTitle>문의가 접수되었습니다</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end">
        <SubmitButton status={state.status} />
      </div>
    </form>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

function FieldHint({ message }: { message: string }) {
  return <p className="text-xs text-rose-500">{message}</p>;
}

function SubmitButton({ status }: { status: InquiryFormState['status'] }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? '전송 중...' : status === 'success' ? '다시 보내기' : '문의 보내기'}
    </Button>
  );
}
