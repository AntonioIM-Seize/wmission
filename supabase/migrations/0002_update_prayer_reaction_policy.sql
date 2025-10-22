drop policy if exists "prayer_reactions_member_insert" on public.prayer_reactions;

create policy "prayer_reactions_member_insert"
  on public.prayer_reactions
  for insert
  with check (
    auth.uid() = member_id
    and exists (
      select 1
      from public.profiles p
      where p.id = member_id
        and p.status != 'blocked'
    )
  );
