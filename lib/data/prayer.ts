import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeHTML } from '@/lib/sanitize';
import { escapeIlikePattern } from '@/lib/utils/supabase';
import { stripMarkdown, truncateText } from '@/lib/utils/text';
import { logError } from '@/lib/monitoring/logger';

import type { Database, PrayerReactionType, ProfileStatus, UserRole } from '@/types/supabase';

type PrayerRow = Database['public']['Tables']['prayers']['Row'] & {
  author?: {
    id: string;
    full_name: string | null;
    status: ProfileStatus;
    role: UserRole;
  };
  prayer_reactions?: Array<{
    reaction_type: PrayerReactionType | null;
  }>;
};

export type PrayerListItem = {
  id: string;
  content: string;
  createdAt: string;
  isAnswered: boolean;
  answeredAt: string | null;
  authorName: string;
  reactions: {
    amen: number;
    together: number;
  };
  imageUrl: string | null;
};

export type PrayerListResult = {
  items: PrayerListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type PrayerDetail = {
  id: string;
  content: string;
  createdAt: string;
  isAnswered: boolean;
  answeredAt: string | null;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorStatus: ProfileStatus;
  reactions: {
    amen: number;
    together: number;
  };
  imageUrl: string | null;
};

export type PrayerListFilters = {
  search?: string | null;
  status?: 'all' | 'answered' | 'pending';
};

export async function getPrayers(params: {
  page: number;
  pageSize: number;
  filters?: PrayerListFilters;
}): Promise<PrayerListResult> {
  const { page, pageSize, filters } = params;
  const supabase = createSupabaseServerClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const searchQuery = filters?.search?.trim();
  const statusFilter = filters?.status ?? 'all';

  let query = supabase
    .from('prayers')
    .select(
      `
        id,
        content,
        created_at,
        is_answered,
        answered_at,
        author:profiles!prayers_author_id_fkey (
          id,
          full_name,
          status,
          role
        ),
        prayer_reactions (
          reaction_type
        ),
        image_url
      `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (statusFilter === 'answered') {
    query = query.eq('is_answered', true);
  } else if (statusFilter === 'pending') {
    query = query.eq('is_answered', false);
  }

  if (searchQuery) {
    const pattern = `%${escapeIlikePattern(searchQuery)}%`;
    query = query.or(
      `content.ilike.${pattern},profiles!prayers_author_id_fkey.full_name.ilike.${pattern}`,
    );
  }

  const { data, count, error } = (await query.range(from, to)) as {
    data: PrayerRow[] | null;
    count: number | null;
    error: Error | null;
  };

  if (error) {
    logError('기도 목록 조회 실패', { error, pagination: { page, pageSize }, filters });
    return { items: [], total: 0, page, pageSize };
  }

  const items =
    data?.map((row) => {
      const sourceContent = row.content ?? '';
      const reactions = row.prayer_reactions ?? [];
      const counts = reactions.reduce(
        (acc, current) => {
          if (current?.reaction_type === 'amen') acc.amen += 1;
          if (current?.reaction_type === 'together') acc.together += 1;
          return acc;
        },
        { amen: 0, together: 0 },
      );

      return {
        id: row.id,
        content: truncateText(stripMarkdown(sourceContent), 180),
        createdAt: row.created_at,
        isAnswered: row.is_answered,
        answeredAt: row.answered_at,
        authorName: row.author?.full_name ?? '익명',
        reactions: counts,
        imageUrl: row.image_url ?? null,
      } satisfies PrayerListItem;
    }) ?? [];

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
  };
}

export async function getPrayerById(id: string): Promise<PrayerDetail | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = (await supabase
    .from('prayers')
    .select(
      `
        id,
        content,
        created_at,
        is_answered,
        answered_at,
        author:profiles!prayers_author_id_fkey (
          id,
          full_name,
          status,
          role
        ),
        prayer_reactions (
          reaction_type
        ),
        image_url
      `,
    )
    .eq('id', id)
    .maybeSingle()) as { data: PrayerRow | null; error: Error | null };

  if (error) {
    logError('기도 상세 조회 실패', { error, prayerId: id });
    return null;
  }

  if (!data) {
    return null;
  }

  const reactions = data.prayer_reactions ?? [];
  const counts = reactions.reduce(
    (acc, current) => {
      if (current?.reaction_type === 'amen') acc.amen += 1;
      if (current?.reaction_type === 'together') acc.together += 1;
      return acc;
    },
    { amen: 0, together: 0 },
  );

  return {
    id: data.id,
    content: sanitizeHTML(data.content ?? ''),
    createdAt: data.created_at,
    isAnswered: data.is_answered,
    answeredAt: data.answered_at,
    authorId: data.author?.id ?? '',
    authorName: data.author?.full_name ?? '익명',
    authorRole: data.author?.role ?? 'member',
    authorStatus: data.author?.status ?? 'approved',
    reactions: counts,
    imageUrl: data.image_url ?? null,
  } satisfies PrayerDetail;
}

export type PrayerAdminMetrics = {
  total: number;
  answered: number;
  pending: number;
};

export async function getPrayerAdminMetrics(): Promise<PrayerAdminMetrics> {
  const supabase = createSupabaseServerClient();

  const [totalResult, answeredResult] = await Promise.all([
    supabase.from('prayers').select('id', { count: 'exact', head: true }),
    supabase.from('prayers').select('id', { count: 'exact', head: true }).eq('is_answered', true),
  ]);

  if (totalResult.error) {
    logError('전체 기도 수 조회 실패', { error: totalResult.error });
  }

  if (answeredResult.error) {
    logError('응답 기도 수 조회 실패', { error: answeredResult.error });
  }

  const total = totalResult.count ?? 0;
  const answered = answeredResult.count ?? 0;
  const pending = Math.max(total - answered, 0);

  return {
    total,
    answered,
    pending,
  };
}
