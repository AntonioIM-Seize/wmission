import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { Database, ProfileStatus, UserRole } from '@/types/supabase';

export type AdminUser = {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  joinReason: string | null;
  status: ProfileStatus;
  role: UserRole;
  createdAt: string;
  approvedAt: string | null;
};

type ProfilesRow = Database['public']['Tables']['profiles']['Row'] & {
  auth_user?: {
    email: string | null;
  };
};

export async function getAdminUsers(params: { search?: string | null; status?: ProfileStatus | null }) {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from('profiles')
    .select(
      `
        id,
        full_name,
        phone,
        join_reason,
        status,
        role,
        created_at,
        approved_at,
        auth_user:auth.users (
          email
        )
      `,
    )
    .order('created_at', { ascending: false });

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.search) {
    const searchTerm = `%${params.search}%`;
    query = query.or(`full_name.ilike.${searchTerm},join_reason.ilike.${searchTerm}`);
  }

  const { data, error } = (await query) as { data: ProfilesRow[] | null; error: Error | null };

  if (error) {
    console.error('관리자 사용자 목록 조회 실패', error);
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      email: row.auth_user?.email ?? null,
      fullName: row.full_name,
      phone: row.phone,
      joinReason: row.join_reason,
      status: row.status,
      role: row.role,
      createdAt: row.created_at,
      approvedAt: row.approved_at,
    })) ?? []
  );
}
