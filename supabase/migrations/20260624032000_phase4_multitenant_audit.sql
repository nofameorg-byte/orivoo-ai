create table if not exists public.business_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('owner', 'admin', 'viewer')),
  description text,
  created_at timestamptz not null default now()
);

insert into public.business_roles (name, description)
values
  ('owner', 'Full access to business profile, applications, users, documents, and settings.'),
  ('admin', 'Can manage operational records and review business workflows.'),
  ('viewer', 'Can view business records without administrative changes.')
on conflict (name) do update
set description = excluded.description;

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid not null references public.business_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.business_roles(id) on delete restrict,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_profile_id, user_id)
);

create table if not exists public.business_invitations (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid not null references public.business_profiles(id) on delete cascade,
  email text not null,
  role_id uuid not null references public.business_roles(id) on delete restrict,
  invited_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid references public.business_profiles(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null
    check (event_type in (
      'user_login',
      'document_upload',
      'application_submission',
      'invoice_creation',
      'customer_creation',
      'admin_review_action'
    )),
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.business_roles enable row level security;
alter table public.business_members enable row level security;
alter table public.business_invitations enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Authenticated users can read business roles" on public.business_roles;
create policy "Authenticated users can read business roles"
  on public.business_roles for select
  using (auth.uid() is not null or auth.role() = 'service_role');

drop policy if exists "Business members can read memberships" on public.business_members;
create policy "Business members can read memberships"
  on public.business_members for select
  using (
    auth.role() = 'service_role'
    or public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1
      from public.business_members bm
      where bm.business_profile_id = business_members.business_profile_id
        and bm.user_id = auth.uid()
    )
  );

drop policy if exists "Owners and admins can manage memberships" on public.business_members;
create policy "Owners and admins can manage memberships"
  on public.business_members for all
  using (
    auth.role() = 'service_role'
    or public.is_admin()
    or exists (
      select 1
      from public.business_members bm
      join public.business_roles br on br.id = bm.role_id
      where bm.business_profile_id = business_members.business_profile_id
        and bm.user_id = auth.uid()
        and br.name in ('owner', 'admin')
    )
  )
  with check (
    auth.role() = 'service_role'
    or public.is_admin()
    or exists (
      select 1
      from public.business_members bm
      join public.business_roles br on br.id = bm.role_id
      where bm.business_profile_id = business_members.business_profile_id
        and bm.user_id = auth.uid()
        and br.name in ('owner', 'admin')
    )
  );

drop policy if exists "Owners and admins can manage invitations" on public.business_invitations;
create policy "Owners and admins can manage invitations"
  on public.business_invitations for all
  using (
    auth.role() = 'service_role'
    or public.is_admin()
    or exists (
      select 1
      from public.business_members bm
      join public.business_roles br on br.id = bm.role_id
      where bm.business_profile_id = business_invitations.business_profile_id
        and bm.user_id = auth.uid()
        and br.name in ('owner', 'admin')
    )
  )
  with check (
    auth.role() = 'service_role'
    or public.is_admin()
    or exists (
      select 1
      from public.business_members bm
      join public.business_roles br on br.id = bm.role_id
      where bm.business_profile_id = business_invitations.business_profile_id
        and bm.user_id = auth.uid()
        and br.name in ('owner', 'admin')
    )
  );

drop policy if exists "Business members can read audit logs" on public.audit_logs;
create policy "Business members can read audit logs"
  on public.audit_logs for select
  using (
    auth.role() = 'service_role'
    or public.is_admin()
    or exists (
      select 1
      from public.business_members bm
      where bm.business_profile_id = audit_logs.business_profile_id
        and bm.user_id = auth.uid()
    )
  );

drop policy if exists "Service role can write audit logs" on public.audit_logs;
create policy "Service role can write audit logs"
  on public.audit_logs for insert
  with check (
    auth.role() = 'service_role'
    or public.is_admin()
    or actor_id = auth.uid()
  );

drop trigger if exists set_business_members_updated_at on public.business_members;
create trigger set_business_members_updated_at
  before update on public.business_members
  for each row execute function public.set_updated_at();

drop trigger if exists set_business_invitations_updated_at on public.business_invitations;
create trigger set_business_invitations_updated_at
  before update on public.business_invitations
  for each row execute function public.set_updated_at();
