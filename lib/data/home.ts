import { createSupabaseServerClient } from '@/lib/supabase/server';
import { stripMarkdown, truncateText } from '@/lib/utils/text';

import type { Database, PrayerReactionType, ProfileStatus } from '@/types/supabase';

type DevotionQueryRow = Database['public']['Tables']['devotions']['Row'] & {
  author?: {
    id: string;
    full_name: string | null;
    status: ProfileStatus;
  };
};

type PrayerQueryRow = Database['public']['Tables']['prayers']['Row'] & {
  author?: {
    id: string;
    full_name: string | null;
    status: ProfileStatus;
  };
  prayer_reactions?: Array<{
    reaction_type: PrayerReactionType | null;
  }>;
};

type SiteSettingRow = Database['public']['Tables']['site_settings']['Row'];

export type HomeSettings = {
  id?: string;
  verseRef: string;
  verseText: string;
  mainPrayer: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
};

export type HomeDevotion = {
  id: string;
  title: string;
  scriptureRef: string;
  excerpt: string;
  publishedAt: string;
  views: number;
  authorName: string;
  imageUrl: string | null;
};

export type HomePrayer = {
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

export type HomeData = {
  settings: HomeSettings | null;
  devotions: HomeDevotion[];
  prayers: HomePrayer[];
};

function mapDevotions(rows: DevotionQueryRow[] | null): HomeDevotion[] {
  if (!rows?.length) {
    return [];
  }

  return rows.map((row) => {
    const bodySource = row.body ?? '';

    return {
      id: row.id,
      title: row.title,
      scriptureRef: row.scripture_ref,
      excerpt: truncateText(stripMarkdown(bodySource), 140),
      publishedAt: row.published_at,
      views: row.views,
      authorName: row.author?.full_name ?? '익명',
      imageUrl: row.image_url ?? null,
    } satisfies HomeDevotion;
  });
}

function mapPrayers(rows: PrayerQueryRow[] | null): HomePrayer[] {
  if (!rows?.length) {
    return [];
  }

  return rows.map((row) => {
    const contentSource = row.content ?? '';

    const reactions = row.prayer_reactions ?? [];
    const reactionCount = reactions.reduce(
      (acc, current) => {
        if (!current?.reaction_type) {
          return acc;
        }

        if (current.reaction_type === 'amen') {
          acc.amen += 1;
        }
        if (current.reaction_type === 'together') {
          acc.together += 1;
        }
        return acc;
      },
      { amen: 0, together: 0 },
    );

    return {
      id: row.id,
      content: truncateText(stripMarkdown(contentSource), 160),
      createdAt: row.created_at,
      isAnswered: row.is_answered,
      answeredAt: row.answered_at,
      authorName: row.author?.full_name ?? '익명',
      reactions: reactionCount,
      imageUrl: row.image_url ?? null,
    } satisfies HomePrayer;
  });
}

function mapSettings(row: SiteSettingRow | null): HomeSettings | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    verseRef: row.verse_ref,
    verseText: row.verse_text,
    mainPrayer: row.main_prayer,
    bankName: row.bank_name,
    bankAccount: row.bank_account,
    bankHolder: row.bank_holder,
  } satisfies HomeSettings;
}

export async function getHomeData(): Promise<HomeData> {
  const supabase = createSupabaseServerClient();

  const [{ data: settingsRow, error: settingsError }, { data: devotionRows, error: devotionsError }, { data: prayerRows, error: prayersError }] =
    await Promise.all([
      supabase.from('site_settings').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle<SiteSettingRow>(),
      supabase
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
            status
          )
        `,
        )
        .order('published_at', { ascending: false })
        .limit(3) as unknown as { data: DevotionQueryRow[] | null; error: Error | null },
      supabase
        .from('prayers')
        .select(
          `
          id,
          content,
          created_at,
          is_answered,
          answered_at,
          image_url,
          author:profiles!prayers_author_id_fkey (
            id,
            full_name,
            status
          ),
          prayer_reactions (
            reaction_type
          )
        `,
        )
        .order('created_at', { ascending: false })
        .limit(3) as unknown as { data: PrayerQueryRow[] | null; error: Error | null },
    ]);

  if (settingsError) {
    console.error('사이트 설정 조회 실패', settingsError);
  }

  if (devotionsError) {
    console.error('최근 묵상 조회 실패', devotionsError);
  }

  if (prayersError) {
    console.error('최근 기도 조회 실패', prayersError);
  }

  const settings = mapSettings(settingsRow ?? null);
  const devotions = mapDevotions(devotionRows ?? []);
  const prayers = mapPrayers(prayerRows ?? []);

  return {
    settings,
    devotions,
    prayers,
  } satisfies HomeData;
}
