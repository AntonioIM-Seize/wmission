import type { ProfileStatus, UserRole } from '@/types/supabase';

const PROFILE_STATUS_LABEL: Record<ProfileStatus, string> = {
  approved: '승인됨',
  pending: '승인 대기',
  rejected: '거절됨',
  blocked: '차단됨',
};

const USER_ROLE_LABEL: Record<UserRole, string> = {
  member: '회원',
  admin: '관리자',
};

export function isApproved(status: ProfileStatus) {
  return status === 'approved';
}

export function isPending(status: ProfileStatus) {
  return status === 'pending';
}

export function isBlocked(status: ProfileStatus) {
  return status === 'blocked';
}

export function isAdmin(role: UserRole) {
  return role === 'admin';
}

export function getProfileStatusLabel(status: ProfileStatus) {
  return PROFILE_STATUS_LABEL[status] ?? '미정';
}

export function getUserRoleLabel(role: UserRole) {
  return USER_ROLE_LABEL[role] ?? '회원';
}
