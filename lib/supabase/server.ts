import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database, 'public'>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 서버 클라이언트 초기화 실패: 환경 변수를 확인하세요.');
  }

  const cookieStore = await cookies();

  return (createServerClient<Database, 'public'>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set({
            name,
            value,
            ...(options ?? {}),
          });
        });
      },
    },
  }) as unknown) as SupabaseClient<Database, 'public'>;
}
