import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { Database, ProfileStatus, UserRole } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export async function getCurrentSession() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('세션 조회 실패', error);
    return null;
  }
  return data.session;
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const session = await getCurrentSession();
  if (!session?.user) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('프로필 조회 실패', error);
    return null;
  }

  return data;
}

export async function requireAuthenticated(path: string = '/login') {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect(path);
  }
  return session.user;
}

export async function requireRole(role: UserRole, fallback: string = '/') {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) {
    redirect(fallback);
  }
  return profile;
}

export async function requireApprovedStatus(allowed: ProfileStatus[] = ['approved'], fallback: string = '/') {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.status)) {
    redirect(fallback);
  }
  return profile;
}
