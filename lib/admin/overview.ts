import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { InquiryStatus } from '@/types/supabase';

type CountResponse = {
  count: number | null;
  error: Error | null;
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
  totalInquiries: number;
  pendingInquiries: number;
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
  recentInquiries: Array<{
    id: string;
    name: string;
    email: string;
    status: InquiryStatus;
    createdAt: string;
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
  const supabase = await createSupabaseServerClient();

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
    totalInquiriesRes,
    pendingInquiriesRes,
    recentDevotionsRes,
    recentPrayersRes,
    recentInquiriesRes,
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
    supabase.from('inquiries').select('id', { count: 'exact', head: true }) as unknown as Promise<CountResponse>,
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending') as unknown as Promise<CountResponse>,
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
      .from('inquiries')
      .select('id, name, email, status, created_at')
      .order('created_at', { ascending: false })
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
  const totalInquiries = countOrZero(totalInquiriesRes);
  const pendingInquiries = countOrZero(pendingInquiriesRes);

  if (recentDevotionsRes.error) {
    console.error('최신 묵상 조회 실패', recentDevotionsRes.error);
  }
  if (recentPrayersRes.error) {
    console.error('최신 기도 조회 실패', recentPrayersRes.error);
  }
  if (recentInquiriesRes.error) {
    console.error('최신 문의 조회 실패', recentInquiriesRes.error);
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
    totalInquiries,
    pendingInquiries,
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
    recentInquiries:
      recentInquiriesRes.data?.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        status: row.status,
        createdAt: row.created_at,
      })) ?? [],
  };
}
