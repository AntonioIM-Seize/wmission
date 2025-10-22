import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 브라우저 클라이언트 초기화 실패: 환경 변수를 확인하세요.');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
