import { createSupabaseServerClient } from '@/lib/supabase/server';
import { escapeIlikePattern } from '@/lib/utils/supabase';

import type { Database } from '@/types/supabase';

type SupporterRow = Database['public']['Tables']['supporters']['Row'];

export type AdminSupporter = {
  id: string;
  name: string;
  amount: number;
  supportedOn: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupporterFilter = {
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
};

export async function getSupporters(filter?: SupporterFilter) {
  const supabase = createSupabaseServerClient();

  let builder = supabase
    .from('supporters')
    .select('*')
    .order('supported_on', { ascending: false })
    .order('created_at', { ascending: false });

  const search = filter?.search?.trim();

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`;
    builder = builder.or(`name.ilike.${pattern},memo.ilike.${pattern}`);
  }

  if (filter?.startDate) {
    builder = builder.gte('supported_on', filter.startDate);
  }

  if (filter?.endDate) {
    builder = builder.lte('supported_on', filter.endDate);
  }

  if (typeof filter?.minAmount === 'number' && !Number.isNaN(filter.minAmount)) {
    builder = builder.gte('amount', filter.minAmount);
  }

  if (typeof filter?.maxAmount === 'number' && !Number.isNaN(filter.maxAmount)) {
    builder = builder.lte('amount', filter.maxAmount);
  }

  const { data, error } = (await builder) as { data: SupporterRow[] | null; error: Error | null };

  if (error) {
    console.error('후원자 목록 조회 실패', error);
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      supportedOn: row.supported_on,
      memo: row.memo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) ?? []
  );
}
