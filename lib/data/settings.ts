import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logError } from '@/lib/monitoring/logger';

import type { Database } from '@/types/supabase';

type SiteSettingsRow = Database['public']['Tables']['site_settings']['Row'];

export type SiteSettings = {
  id?: string;
  verseRef: string;
  verseText: string;
  mainPrayer: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<SiteSettingsRow>();

  if (error) {
    logError('사이트 설정 조회 실패', { error });
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    verseRef: data.verse_ref,
    verseText: data.verse_text,
    mainPrayer: data.main_prayer,
    bankName: data.bank_name,
    bankAccount: data.bank_account,
    bankHolder: data.bank_holder,
    createdAt: data.created_at ?? undefined,
    updatedAt: data.updated_at ?? undefined,
  } satisfies SiteSettings;
}

export async function getSiteSettingsRaw(): Promise<SiteSettingsRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<SiteSettingsRow>();

  if (error) {
    logError('사이트 설정 원본 조회 실패', { error });
    return null;
  }

  return data ?? null;
}
