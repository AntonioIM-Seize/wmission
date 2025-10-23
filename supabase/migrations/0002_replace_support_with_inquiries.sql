-- 후원 관련 테이블 및 정책 제거
drop policy if exists "supporters_admin_only" on public.supporters;
drop table if exists public.supporters;

-- 사이트 설정 컬럼명을 문의 정보 중심으로 변경
alter table public.site_settings
  rename column bank_name to contact_email;
alter table public.site_settings
  rename column bank_account to contact_phone;
alter table public.site_settings
  rename column bank_holder to contact_note;

-- 기본 데이터가 존재하는 경우 의미에 맞게 업데이트
update public.site_settings
set contact_email = coalesce(nullif(contact_email, ''), 'mission@wiruda.com'),
    contact_phone = coalesce(nullif(contact_phone, ''), '010-0000-0000'),
    contact_note = coalesce(
      nullif(contact_note, ''),
      '문의하시면 48시간 이내에 연락드리겠습니다.'
    )
where contact_email is not null;

-- 문의 상태 타입 생성
create type public.inquiry_status as enum ('pending', 'resolved');

-- 문의 테이블 생성
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status public.inquiry_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_inquiries_status_created_at on public.inquiries (status, created_at desc);

create trigger trg_inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.touch_updated_at();

-- RLS 설정
alter table public.inquiries enable row level security;

create policy "inquiries_public_insert"
  on public.inquiries
  for insert
  with check (true);

create policy "inquiries_admin_manage"
  on public.inquiries
  for all
  using (public.is_admin())
  with check (public.is_admin());
