alter table public.profiles
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_privacy_at timestamptz;

drop policy if exists "Business members can read business profiles" on public.business_profiles;
create policy "Business members can read business profiles"
  on public.business_profiles for select
  using (
    auth.uid() = owner_id
    or public.is_admin()
    or auth.role() = 'service_role'
    or exists (
      select 1
      from public.business_members bm
      where bm.business_profile_id = business_profiles.id
        and bm.user_id = auth.uid()
    )
  );

drop policy if exists "Business members can update business profiles" on public.business_profiles;
create policy "Business members can update business profiles"
  on public.business_profiles for update
  using (
    auth.uid() = owner_id
    or public.is_admin()
    or auth.role() = 'service_role'
    or exists (
      select 1
      from public.business_members bm
      join public.business_roles br on br.id = bm.role_id
      where bm.business_profile_id = business_profiles.id
        and bm.user_id = auth.uid()
        and br.name in ('owner', 'admin')
    )
  )
  with check (
    auth.uid() = owner_id
    or public.is_admin()
    or auth.role() = 'service_role'
    or exists (
      select 1
      from public.business_members bm
      join public.business_roles br on br.id = bm.role_id
      where bm.business_profile_id = business_profiles.id
        and bm.user_id = auth.uid()
        and br.name in ('owner', 'admin')
    )
  );

drop policy if exists "Business members can read customers" on public.customers;
create policy "Business members can read customers"
  on public.customers for select
  using (
    auth.uid() = owner_id
    or public.is_admin()
    or auth.role() = 'service_role'
  );

drop policy if exists "Service role can process backend tasks for applications" on public.kyb_applications;
create policy "Service role can process backend tasks for applications"
  on public.kyb_applications for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role can process backend tasks for documents" on public.business_documents;
create policy "Service role can process backend tasks for documents"
  on public.business_documents for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
