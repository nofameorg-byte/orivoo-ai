create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team', 'enterprise')),
  status text not null default 'inactive',
  created_at timestamptz not null default now()
);

create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ai_messages integer not null default 0,
  documents_uploaded integer not null default 0,
  reports_generated integer not null default 0,
  websites_generated integer not null default 0,
  code_projects_generated integer not null default 0,
  storage_used bigint not null default 0,
  month text not null,
  unique (user_id, month)
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  unique (organization_id, user_id)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now()
);

create index if not exists usage_tracking_user_month_idx
  on public.usage_tracking (user_id, month);

create index if not exists organization_members_user_idx
  on public.organization_members (user_id);

create index if not exists invites_org_status_idx
  on public.invites (organization_id, status);

alter table public.subscriptions enable row level security;
alter table public.usage_tracking enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.invites enable row level security;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = org_id
      and organization_members.user_id = auth.uid()
  ) or public.is_super_admin();
$$;

create or replace function public.can_manage_org(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = org_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
  ) or public.is_super_admin();
$$;

create or replace function public.can_view_user_assets(asset_owner uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select asset_owner = auth.uid()
    or public.is_super_admin()
    or exists (
      select 1
      from public.organization_members viewer
      join public.organization_members owner_member
        on owner_member.organization_id = viewer.organization_id
      where viewer.user_id = auth.uid()
        and owner_member.user_id = asset_owner
    );
$$;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id or public.is_super_admin());

create policy "Users can create their own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Users can update their own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id or public.is_super_admin())
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Users can read their own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id or public.is_super_admin());

create policy "Users can create their own usage"
  on public.usage_tracking for insert
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Users can update their own usage"
  on public.usage_tracking for update
  using (auth.uid() = user_id or public.is_super_admin())
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Organization members can read organizations"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "Users can create organizations they own"
  on public.organizations for insert
  with check (auth.uid() = owner_id);

create policy "Owners and admins can update organizations"
  on public.organizations for update
  using (public.can_manage_org(id))
  with check (public.can_manage_org(id));

create policy "Owners can delete organizations"
  on public.organizations for delete
  using (auth.uid() = owner_id or public.is_super_admin());

create policy "Organization members can read members"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "Organization owners can create their owner membership"
  on public.organization_members for insert
  with check (
    role = 'owner'
    and auth.uid() = user_id
    and exists (
      select 1
      from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.owner_id = auth.uid()
    )
  );

create policy "Owners and admins can manage members"
  on public.organization_members for all
  using (public.can_manage_org(organization_id))
  with check (public.can_manage_org(organization_id));

create policy "Organization members can read invites"
  on public.invites for select
  using (public.is_org_member(organization_id));

create policy "Owners and admins can manage invites"
  on public.invites for all
  using (public.can_manage_org(organization_id))
  with check (public.can_manage_org(organization_id));

create policy "Organization members can read shared projects"
  on public.projects for select
  using (public.can_view_user_assets(user_id));

create policy "Organization members can read shared conversations"
  on public.conversations for select
  using (public.can_view_user_assets(user_id));

create policy "Organization members can read shared documents"
  on public.documents for select
  using (public.can_view_user_assets(user_id));

create policy "Organization members can read shared research reports"
  on public.research_reports for select
  using (public.can_view_user_assets(user_id));

create policy "Organization members can read shared website projects"
  on public.website_projects for select
  using (public.can_view_user_assets(user_id));

create policy "Organization members can read shared code projects"
  on public.code_projects for select
  using (public.can_view_user_assets(user_id));

create policy "Organization members can read shared academy courses"
  on public.academy_courses for select
  using (public.can_view_user_assets(user_id));

create policy "Organization members can read teammate profiles"
  on public.profiles for select
  using (public.can_view_user_assets(id));
