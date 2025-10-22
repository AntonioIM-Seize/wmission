-- 확장 설치
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- 사용자 정의 타입
create type public.user_role as enum ('member', 'admin');
create type public.profile_status as enum ('pending', 'approved', 'rejected', 'blocked');
create type public.prayer_reaction as enum ('amen', 'together');
-- 타임스탬프 자동 갱신 트리거 함수
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- 프로필
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'member',
  status public.profile_status not null default 'pending',
  full_name text not null default '',
  phone text,
  join_reason text,
  approved_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_role_requires_status check (
    (role = 'admin' and status != 'blocked') or role = 'member'
  )
);
create index idx_profiles_status_role on public.profiles (status, role);
create index idx_profiles_last_login on public.profiles (last_login_at desc);
create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- auth.users 신규 이벤트 시 프로필 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 묵상
create table public.devotions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  scripture_ref text not null,
  scripture_text text,
  body text not null,
  views integer not null default 0,
  published_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index idx_devotions_published_at on public.devotions (published_at desc);
create index idx_devotions_author on public.devotions (author_id);
create index idx_devotions_trgm on public.devotions using gin ((title || ' ' || scripture_ref) gin_trgm_ops);
create trigger trg_devotions_set_updated_at
  before update on public.devotions
  for each row execute function public.touch_updated_at();

-- 기도
create table public.prayers (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete restrict,
  content text not null,
  is_answered boolean not null default false,
  answered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index idx_prayers_created_at on public.prayers (created_at desc);
create index idx_prayers_author on public.prayers (author_id);
create trigger trg_prayers_set_updated_at
  before update on public.prayers
  for each row execute function public.touch_updated_at();

-- 기도 반응
create table public.prayer_reactions (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid not null references public.prayers (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  reaction_type public.prayer_reaction not null,
  created_at timestamptz not null default timezone('utc', now())
);
alter table public.prayer_reactions
  add constraint prayer_reactions_unique_member unique (prayer_id, member_id, reaction_type);
create index idx_prayer_reactions_prayer on public.prayer_reactions (prayer_id);
create index idx_prayer_reactions_member on public.prayer_reactions (member_id);

-- 후원자
create table public.supporters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12, 2) not null,
  supported_on date not null,
  memo text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index idx_supporters_supported_on on public.supporters (supported_on desc);
create trigger trg_supporters_set_updated_at
  before update on public.supporters
  for each row execute function public.touch_updated_at();

-- 사이트 설정
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  verse_ref text not null,
  verse_text text not null,
  main_prayer text not null,
  bank_name text not null,
  bank_account text not null,
  bank_holder text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create trigger trg_site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- 조회수 추적 (옵션)
create table public.devotion_views (
  devotion_id uuid references public.devotions (id) on delete cascade,
  viewer_id uuid references public.profiles (id) on delete cascade,
  first_viewed_at timestamptz not null default timezone('utc', now()),
  last_viewed_at timestamptz not null default timezone('utc', now()),
  primary key (devotion_id, viewer_id)
);
create index idx_devotion_views_devotion on public.devotion_views (devotion_id);

create trigger trg_devotion_views_set_updated_at
  before update on public.devotion_views
  for each row execute function public.touch_updated_at();

-- 권한 확인 함수
create or replace function public.is_profile_approved(check_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = check_id
      and p.status = 'approved'
  );
$$;

create or replace function public.is_admin(check_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = check_id
      and p.role = 'admin'
      and p.status != 'blocked'
  );
$$;

create or replace function public.is_authenticated()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated';
$$;

-- 조회수 증가 함수
create or replace function public.increment_devotion_views(devotion_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.devotions
  set views = greatest(0, views) + 1,
      updated_at = timezone('utc', now())
  where id = increment_devotion_views.devotion_id;
end;
$$;

-- RLS 활성화
alter table public.profiles enable row level security;
alter table public.devotions enable row level security;
alter table public.prayers enable row level security;
alter table public.prayer_reactions enable row level security;
alter table public.supporters enable row level security;
alter table public.site_settings enable row level security;
alter table public.devotion_views enable row level security;

-- 프로필 정책
create policy "profiles_self_select"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_admin_select"
  on public.profiles
  for select
  using (public.is_admin());

create policy "profiles_self_update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_manage"
  on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 묵상 정책
create policy "devotions_public_select"
  on public.devotions
  for select
  using (true);

create policy "devotions_author_insert"
  on public.devotions
  for insert
  with check (
    auth.uid() = author_id
    and public.is_profile_approved(author_id)
  );

create policy "devotions_author_update"
  on public.devotions
  for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "devotions_author_delete"
  on public.devotions
  for delete
  using (auth.uid() = author_id);

create policy "devotions_admin_manage"
  on public.devotions
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 기도 정책
create policy "prayers_public_select"
  on public.prayers
  for select
  using (true);

create policy "prayers_author_insert"
  on public.prayers
  for insert
  with check (
    auth.uid() = author_id
    and public.is_profile_approved(author_id)
  );

create policy "prayers_author_update"
  on public.prayers
  for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "prayers_author_delete"
  on public.prayers
  for delete
  using (auth.uid() = author_id);

create policy "prayers_admin_manage"
  on public.prayers
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 기도 반응 정책
create policy "prayer_reactions_member_select"
  on public.prayer_reactions
  for select
  using (public.is_authenticated());

create policy "prayer_reactions_member_insert"
  on public.prayer_reactions
  for insert
  with check (
    auth.uid() = member_id
    and public.is_profile_approved(member_id)
  );

create policy "prayer_reactions_member_delete"
  on public.prayer_reactions
  for delete
  using (auth.uid() = member_id);

create policy "prayer_reactions_admin_manage"
  on public.prayer_reactions
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 후원자 정책
create policy "supporters_admin_only"
  on public.supporters
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 사이트 설정 정책
create policy "site_settings_public_select"
  on public.site_settings
  for select
  using (true);

create policy "site_settings_admin_write"
  on public.site_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 묵상 조회수 정책
create policy "devotion_views_self_select"
  on public.devotion_views
  for select
  using (auth.uid() = viewer_id or public.is_admin());

create policy "devotion_views_self_upsert"
  on public.devotion_views
  for all
  using (auth.uid() = viewer_id)
  with check (auth.uid() = viewer_id);

create policy "devotion_views_admin_manage"
  on public.devotion_views
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 기본 데이터
insert into public.site_settings (verse_ref, verse_text, main_prayer, bank_name, bank_account, bank_holder)
values (
  '요한복음 3:16',
  '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
  '선교지와 선교사님들을 위해 매일 기도합시다.',
  '국민은행',
  '123456-01-000000',
  '위루다선교회'
)
on conflict do nothing;
