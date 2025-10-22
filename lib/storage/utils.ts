const FALLBACK_IMAGE_BUCKET = 'content-images';

export const SUPABASE_IMAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET ?? FALLBACK_IMAGE_BUCKET;

type StorageLocation = {
  bucket: string;
  path: string;
};

/**
 * Extracts storage bucket and object path from a public Supabase Storage URL.
 * Returns null when the URL targets a different project/bucket or is malformed.
 */
export function parsePublicStorageUrl(publicUrl: string): StorageLocation | null {
  if (!publicUrl) {
    return null;
  }

  try {
    const url = new URL(publicUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const publicIndex = segments.findIndex((segment) => segment === 'public');

    if (publicIndex === -1) {
      return null;
    }

    const bucket = decodeURIComponent(segments[publicIndex + 1] ?? '');
    const pathSegments = segments.slice(publicIndex + 2).map((segment) => decodeURIComponent(segment));
    const path = pathSegments.join('/');

    if (!bucket || !path) {
      return null;
    }

    return {
      bucket,
      path,
    };
  } catch (error) {
    console.error('공개 스토리지 URL 파싱 실패', error);
    return null;
  }
}

type StorageCapableClient = {
  storage: {
    from(bucket: string): {
      remove(paths: string[]): Promise<{ data: unknown; error: unknown }>;
    };
  };
};

export async function removePublicStorageFile(
  supabase: StorageCapableClient,
  publicUrl: string,
  options: { expectedBucket?: string } = {},
) {
  const location = parsePublicStorageUrl(publicUrl);
  if (!location) {
    return;
  }

  const expectedBucket = options.expectedBucket ?? SUPABASE_IMAGE_BUCKET;
  if (expectedBucket && location.bucket !== expectedBucket) {
    return;
  }

  const { error } = await supabase.storage.from(location.bucket).remove([location.path]);

  if (error) {
    console.error('스토리지 객체 삭제 실패', error);
  }
}
