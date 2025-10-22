'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PhotoIcon, TrashIcon, UploadCloudIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SUPABASE_IMAGE_BUCKET, removePublicStorageFile } from '@/lib/storage/utils';

const STORAGE_BUCKET = SUPABASE_IMAGE_BUCKET;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type ImageUploaderProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const previousUrl = value;

    setIsProcessing(true);
    try {
      const filename = `${crypto.randomUUID()}-${file.name}`;
      const filepath = `${new Date().getFullYear()}/${filename}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filepath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

      if (uploadError) {
        console.error('이미지 업로드 실패', uploadError);
        alert('이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filepath);

      if (previousUrl && previousUrl !== publicUrl) {
        await removePublicStorageFile(supabase, previousUrl, { expectedBucket: STORAGE_BUCKET });
      }

      onChange(publicUrl);
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  }

  async function handleRemove() {
    if (!value) {
      onChange(null);
      return;
    }

    setIsProcessing(true);
    try {
      await removePublicStorageFile(supabase, value, { expectedBucket: STORAGE_BUCKET });
    } finally {
      setIsProcessing(false);
      onChange(null);
    }
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary">
          <UploadCloudIcon className="h-4 w-4" />
          <span>{isProcessing ? '처리 중...' : '이미지 업로드'}</span>
          <Input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isProcessing} />
        </label>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="gap-1" disabled={isProcessing}>
            <TrashIcon className="h-4 w-4" /> 제거
          </Button>
        )}
      </div>
      {value ? (
        <div className="overflow-hidden rounded-lg border border-border/60">
          <Image src={value} alt="첨부 이미지 미리보기" width={600} height={360} className="h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <PhotoIcon className="h-6 w-6" />
            <span>이미지를 업로드하면 미리보기가 표시됩니다.</span>
          </div>
        </div>
      )}
    </div>
  );
}
