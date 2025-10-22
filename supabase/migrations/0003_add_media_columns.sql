alter table if exists public.devotions
  add column if not exists image_url text;

alter table if exists public.prayers
  add column if not exists image_url text;
