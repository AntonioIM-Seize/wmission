'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type CopyButtonProps = {
  value: string;
  label?: string;
  size?: 'sm' | 'default';
};

export function CopyButton({ value, label = '복사', size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패', error);
    }
  }

  return (
    <Button type="button" variant="outline" size={size} onClick={handleClick}>
      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      {copied ? '복사됨' : label}
    </Button>
  );
}
