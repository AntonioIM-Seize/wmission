import { createSupabaseServerClient } from '@/lib/supabase/server';

type CountResponse = {
  count: number | null;
  error: Error | null;
};

type AmountRow = {
  amount: number | null;
};

export type OverviewMetrics = {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
  blockedUsers: number;
  adminUsers: number;
  totalDevotions: number;
  totalPrayers: number;
  answeredPrayers: number;
  totalSupporters: number;
  supporterAmount: number;
  recentDevotions: Array<{
    id: string;
    title: string;
    publishedAt: string;
  }>;
  recentPrayers: Array<{
    id: string;
    createdAt: string;
    isAnswered: boolean;
  }>;
  recentSupporters: Array<{
    id: string;
    name: string;
    amount: number;
    supportedOn: string;
  }>;
};

function countOrZero(response: CountResponse) {
  if (response.error) {
    console.error('개수 조회 실패', response.error);
    return 0;
  }
  return response.count ?? 0;
}

export async function getAdminOverview(): Promise<OverviewMetrics> {
  const supabase = createSupabaseServerClient();

  const [
    totalUsersRes,
    pendingUsersRes,
    approvedUsersRes,
    rejectedUsersRes,
    blockedUsersRes,
    adminUsersRes,
    totalDevotionsRes,
    totalPrayersRes,
    answeredPrayersRes,
    supportersAmountRes,
    recentDevotionsRes,
    recentPrayersRes,
    recentSupportersRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }) as unknown as Promise<CountResponse>,
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending') as unknown as Promise<CountResponse>,
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved') as unknown as Promise<CountResponse>,
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'rejected') as unknown as Promise<CountResponse>,
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'blocked') as unknown as Promise<CountResponse>,
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin') as unknown as Promise<CountResponse>,
    supabase.from('devotions').select('id', { count: 'exact', head: true }) as unknown as Promise<CountResponse>,
    supabase.from('prayers').select('id', { count: 'exact', head: true }) as unknown as Promise<CountResponse>,
    supabase
      .from('prayers')
      .select('id', { count: 'exact', head: true })
      .eq('is_answered', true) as unknown as Promise<CountResponse>,
    supabase.from('supporters').select('amount', { count: 'exact' }) as Promise<{
      data: AmountRow[] | null;
      error: Error | null;
      count: number | null;
    }>,
    supabase
      .from('devotions')
      .select('id, title, published_at')
      .order('published_at', { ascending: false })
      .limit(5),
    supabase
      .from('prayers')
      .select('id, created_at, is_answered')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('supporters')
      .select('id, name, amount, supported_on')
      .order('supported_on', { ascending: false })
      .limit(5),
  ]);

  const totalUsers = countOrZero(totalUsersRes);
  const pendingUsers = countOrZero(pendingUsersRes);
  const approvedUsers = countOrZero(approvedUsersRes);
  const rejectedUsers = countOrZero(rejectedUsersRes);
  const blockedUsers = countOrZero(blockedUsersRes);
  const adminUsers = countOrZero(adminUsersRes);
  const totalDevotions = countOrZero(totalDevotionsRes);
  const totalPrayers = countOrZero(totalPrayersRes);
  const answeredPrayers = countOrZero(answeredPrayersRes);

  let totalSupporters = 0;
  let supporterAmount = 0;
  if (supportersAmountRes.error) {
    console.error('후원자 통계 조회 실패', supportersAmountRes.error);
  } else {
    totalSupporters = supportersAmountRes.count ?? supportersAmountRes.data?.length ?? 0;
    supporterAmount =
      supportersAmountRes.data?.reduce((sum, row) => {
        const value = Number(row.amount ?? 0);
        return Number.isNaN(value) ? sum : sum + value;
      }, 0) ?? 0;
  }

  if (recentDevotionsRes.error) {
    console.error('최신 묵상 조회 실패', recentDevotionsRes.error);
  }
  if (recentPrayersRes.error) {
    console.error('최신 기도 조회 실패', recentPrayersRes.error);
  }
  if (recentSupportersRes.error) {
    console.error('최신 후원자 조회 실패', recentSupportersRes.error);
  }

  return {
    totalUsers,
    pendingUsers,
    approvedUsers,
    rejectedUsers,
    blockedUsers,
    adminUsers,
    totalDevotions,
    totalPrayers,
    answeredPrayers,
    totalSupporters,
    supporterAmount,
    recentDevotions:
      recentDevotionsRes.data?.map((row) => ({
        id: row.id,
        title: row.title,
        publishedAt: row.published_at,
      })) ?? [],
    recentPrayers:
      recentPrayersRes.data?.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        isAnswered: row.is_answered,
      })) ?? [],
    recentSupporters:
      recentSupportersRes.data?.map((row) => ({
        id: row.id,
        name: row.name,
        amount: Number(row.amount ?? 0),
        supportedOn: row.supported_on,
      })) ?? [],
  };
}
