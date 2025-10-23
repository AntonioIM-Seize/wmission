import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeHTML } from '@/lib/sanitize';
import { escapeIlikePattern } from '@/lib/utils/supabase';
import { stripMarkdown, truncateText } from '@/lib/utils/text';
import { logError } from '@/lib/monitoring/logger';

import type { Database, ProfileStatus, UserRole } from '@/types/supabase';

type DevotionRow = Database['public']['Tables']['devotions']['Row'] & {
  author?: {
    id: string;
    full_name: string | null;
    status: ProfileStatus;
    role: UserRole;
  };
};

type DevotionListItem = {
  id: string;
  title: string;
  scriptureRef: string;
  excerpt: string;
  publishedAt: string;
  authorName: string;
  imageUrl: string | null;
  views: number;
};

type DevotionListResult = {
  items: DevotionListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type DevotionDetail = {
  id: string;
  title: string;
  scriptureRef: string;
  scriptureText: string;
  body: string;
  publishedAt: string;
  views: number;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorStatus: ProfileStatus;
  imageUrl: string | null;
};

export type DevotionListFilters = {
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  hasImage?: 'all' | 'with' | 'without';
};

export async function getDevotionsList(params: {
  page: number;
  pageSize: number;
  search?: string | null;
  filters?: DevotionListFilters;
}): Promise<DevotionListResult> {
  const { page, pageSize } = params;
  const supabase = await createSupabaseServerClient();

  const filters = params.filters ?? {};
  if (params.search && !filters.search) {
    filters.search = params.search;
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('devotions')
    .select(
      `
        id,
        title,
        scripture_ref,
        body,
        image_url,
        published_at,
        views,
        author:profiles!devotions_author_id_fkey (
          id,
          full_name,
          status,
          role
        )
      `,
      { count: 'exact' },
    )
    .order('published_at', { ascending: false })
    .range(from, to);

  if (filters.startDate) {
    query = query.gte('published_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('published_at', filters.endDate);
  }

  if (filters.hasImage === 'with') {
    query = query.not('image_url', 'is', null);
  } else if (filters.hasImage === 'without') {
    query = query.is('image_url', null);
  }

  if (filters.search) {
    const pattern = `%${escapeIlikePattern(filters.search)}%`;
    query = query.or(`title.ilike.${pattern},scripture_ref.ilike.${pattern}`);
  }

  const { data, error, count } = (await query) as {
    data: DevotionRow[] | null;
    error: Error | null;
    count: number | null;
  };

  if (error) {
    logError('묵상 목록 조회 실패', { error });
    return { items: [], total: 0, page, pageSize };
  }

  const items =
    data?.map((row) => {
      const bodySource = row.body ?? '';

      return {
        id: row.id,
        title: row.title,
        scriptureRef: row.scripture_ref,
        imageUrl: row.image_url ?? null,
        excerpt: truncateText(stripMarkdown(bodySource), 180),
        publishedAt: row.published_at,
        authorName: row.author?.full_name ?? '익명',
        views: row.views ?? 0,
      } satisfies DevotionListItem;
    }) ?? [];

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
  };
}

export type DevotionExportRow = {
  id: string;
  title: string;
  scriptureRef: string;
  publishedAt: string;
  authorName: string;
  views: number;
  hasImage: boolean;
};

export async function getDevotionsForExport(filters: DevotionListFilters = {}): Promise<DevotionExportRow[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('devotions')
    .select(
      `
        id,
        title,
        scripture_ref,
        published_at,
        views,
        image_url,
        author:profiles!devotions_author_id_fkey (
          full_name
        )
      `,
    )
    .order('published_at', { ascending: false });

  if (filters.startDate) {
    query = query.gte('published_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('published_at', filters.endDate);
  }

  if (filters.hasImage === 'with') {
    query = query.not('image_url', 'is', null);
  } else if (filters.hasImage === 'without') {
    query = query.is('image_url', null);
  }

  if (filters.search) {
    const pattern = `%${escapeIlikePattern(filters.search)}%`;
    query = query.or(`title.ilike.${pattern},scripture_ref.ilike.${pattern}`);
  }

  const { data, error } = await query;

  if (error) {
    logError('묵상 CSV 데이터 조회 실패', { error });
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      title: row.title,
      scriptureRef: row.scripture_ref,
      publishedAt: row.published_at,
      authorName: row.author?.full_name ?? '익명',
      views: row.views ?? 0,
      hasImage: Boolean(row.image_url),
    })) ?? []
  );
}

export async function getDevotionById(id: string): Promise<DevotionDetail | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = (await supabase
    .from('devotions')
    .select(
      `
        id,
        title,
        scripture_ref,
        scripture_text,
        body,
        image_url,
        published_at,
        views,
        author:profiles!devotions_author_id_fkey (
          id,
          full_name,
          role,
          status
        )
      `,
    )
    .eq('id', id)
    .maybeSingle()) as { data: DevotionRow | null; error: Error | null };

  if (error) {
    logError('묵상 상세 조회 실패', { error, devotionId: id });
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    scriptureRef: data.scripture_ref,
    scriptureText: data.scripture_text ?? '',
    body: sanitizeHTML(data.body ?? ''),
    publishedAt: data.published_at,
    views: data.views,
    authorId: data.author?.id ?? '',
    authorName: data.author?.full_name ?? '익명',
    authorRole: data.author?.role ?? 'member',
    authorStatus: data.author?.status ?? 'approved',
    imageUrl: data.image_url ?? null,
  } satisfies DevotionDetail;
}

export async function incrementDevotionViewCount(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('increment_devotion_views', { devotion_id: id });

  if (error) {
    logError('묵상 조회수 증가 실패', { error, devotionId: id });
  }
}

export type DevotionAdminMetrics = {
  total: number;
  last30Days: number;
  withImage: number;
  totalViews: number;
  uniqueAuthors: number;
  topDevotion: {
    id: string;
    title: string;
    views: number;
    publishedAt: string;
  } | null;
};

export async function getDevotionAdminMetrics(): Promise<DevotionAdminMetrics> {
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const last30 = new Date(now);
  last30.setDate(last30.getDate() - 30);

  const [totalResult, recentResult, withImageResult, detailResult] = await Promise.all([
    supabase.from('devotions').select('id', { count: 'exact', head: true }),
    supabase.from('devotions').select('id', { count: 'exact', head: true }).gte('published_at', last30.toISOString()),
    supabase
      .from('devotions')
      .select('id', { count: 'exact', head: true })
      .not('image_url', 'is', null),
    supabase
      .from('devotions')
      .select('id, title, views, published_at, author_id'),
  ]);

  if (totalResult.error) {
    logError('묵상 총합 조회 실패', { error: totalResult.error });
  }
  if (recentResult.error) {
    logError('묵상 최근 30일 조회 실패', { error: recentResult.error });
  }
  if (withImageResult.error) {
    logError('이미지 포함 묵상 수 조회 실패', { error: withImageResult.error });
  }
  if (detailResult.error) {
    logError('묵상 메트릭 세부 조회 실패', { error: detailResult.error });
  }

  const detailRows = detailResult.data ?? [];
  const totalViews = detailRows.reduce((sum, row) => sum + (row.views ?? 0), 0);
  const uniqueAuthors = new Set(detailRows.map((row) => row.author_id).filter(Boolean)).size;

  const topDevotion =
    detailRows
      .filter((row) => typeof row.views === 'number')
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0] ?? null;

  return {
    total: totalResult.count ?? detailRows.length,
    last30Days: recentResult.count ?? 0,
    withImage: withImageResult.count ?? 0,
    totalViews,
    uniqueAuthors,
    topDevotion: topDevotion
      ? {
          id: topDevotion.id,
          title: topDevotion.title,
          views: topDevotion.views ?? 0,
          publishedAt: topDevotion.published_at,
        }
      : null,
  };
}

export type DevotionMonthlySummaryRow = {
  monthKey: string;
  label: string;
  count: number;
  views: number;
};

export async function getDevotionMonthlySummary(months = 6): Promise<DevotionMonthlySummaryRow[]> {
  const supabase = await createSupabaseServerClient();

  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const { data, error } = await supabase
    .from('devotions')
    .select('published_at, views')
    .gte('published_at', since.toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    logError('묵상 월간 요약 조회 실패', { error });
    return [];
  }

  const buckets = new Map<string, { label: string; count: number; views: number }>();

  data?.forEach((row) => {
    if (!row.published_at) {
      return;
    }
    const date = new Date(row.published_at);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    const label = `${year}년 ${month}월`;
    const current = buckets.get(monthKey) ?? { label, count: 0, views: 0 };
    current.count += 1;
    current.views += row.views ?? 0;
    buckets.set(monthKey, current);
  });

  return Array.from(buckets.entries())
    .map(([monthKey, value]) => ({
      monthKey,
      label: value.label,
      count: value.count,
      views: value.views,
    }))
    .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1))
    .slice(0, months);
}
