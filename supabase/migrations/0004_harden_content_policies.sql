-- 묵상/기도 수정·삭제 시 차단 계정 방지
drop policy if exists "devotions_author_update" on public.devotions;
drop policy if exists "devotions_author_delete" on public.devotions;

create policy "devotions_author_update"
  on public.devotions
  for update
  using (
    auth.uid() = author_id
    and public.is_profile_approved(auth.uid())
  )
  with check (
    auth.uid() = author_id
    and public.is_profile_approved(auth.uid())
  );

create policy "devotions_author_delete"
  on public.devotions
  for delete
  using (
    auth.uid() = author_id
    and public.is_profile_approved(auth.uid())
  );

drop policy if exists "prayers_author_update" on public.prayers;
drop policy if exists "prayers_author_delete" on public.prayers;

create policy "prayers_author_update"
  on public.prayers
  for update
  using (
    auth.uid() = author_id
    and public.is_profile_approved(auth.uid())
  )
  with check (
    auth.uid() = author_id
    and public.is_profile_approved(auth.uid())
  );

create policy "prayers_author_delete"
  on public.prayers
  for delete
  using (
    auth.uid() = author_id
    and public.is_profile_approved(auth.uid())
  );
