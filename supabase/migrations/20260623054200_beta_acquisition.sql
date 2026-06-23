-- VP23 beta acquisition tools.

alter table public.companies
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_until timestamptz,
  add column if not exists featured_rank integer not null default 0,
  add column if not exists claimed_by uuid references public.profiles(id) on delete set null,
  add column if not exists claimed_at timestamptz;

create table if not exists public.company_claims (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  claimant_name text not null,
  claimant_email text not null,
  claimant_phone text,
  ownership_notes text,
  evidence_document_id uuid references public.documents(id) on delete set null,
  status public.verification_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, claimant_id)
);

create table if not exists public.professional_invitations (
  id uuid primary key default gen_random_uuid(),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  email text not null,
  invite_token text not null unique,
  message text,
  status public.verification_status not null default 'pending',
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_views (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists companies_featured_idx
  on public.companies(is_featured, featured_rank desc, featured_until);

create index if not exists company_claims_status_idx
  on public.company_claims(status);

create index if not exists company_claims_company_idx
  on public.company_claims(company_id);

create index if not exists professional_invitations_invited_by_idx
  on public.professional_invitations(invited_by);

create index if not exists professional_invitations_status_idx
  on public.professional_invitations(status);

create index if not exists company_views_company_created_idx
  on public.company_views(company_id, created_at desc);

alter table public.company_claims enable row level security;
alter table public.professional_invitations enable row level security;
alter table public.company_views enable row level security;

drop trigger if exists set_company_claims_updated_at on public.company_claims;
create trigger set_company_claims_updated_at
  before update on public.company_claims
  for each row execute function public.set_updated_at();

drop trigger if exists set_professional_invitations_updated_at on public.professional_invitations;
create trigger set_professional_invitations_updated_at
  before update on public.professional_invitations
  for each row execute function public.set_updated_at();

drop policy if exists "Claim participants read company claims" on public.company_claims;
create policy "Claim participants read company claims"
  on public.company_claims for select
  using (
    claimant_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  );

drop policy if exists "Authenticated users create company claims" on public.company_claims;
create policy "Authenticated users create company claims"
  on public.company_claims for insert
  with check (claimant_id = auth.uid());

drop policy if exists "Admins update company claims" on public.company_claims;
create policy "Admins update company claims"
  on public.company_claims for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Invitation participants read invitations" on public.professional_invitations;
create policy "Invitation participants read invitations"
  on public.professional_invitations for select
  using (
    invited_by = auth.uid()
    or accepted_by = auth.uid()
    or public.is_admin()
  );

drop policy if exists "Authenticated users create invitations" on public.professional_invitations;
create policy "Authenticated users create invitations"
  on public.professional_invitations for insert
  with check (invited_by = auth.uid() or public.is_admin());

drop policy if exists "Invitation owners update invitations" on public.professional_invitations;
create policy "Invitation owners update invitations"
  on public.professional_invitations for update
  using (invited_by = auth.uid() or accepted_by = auth.uid() or public.is_admin())
  with check (invited_by = auth.uid() or accepted_by = auth.uid() or public.is_admin());

drop policy if exists "Admins read company views" on public.company_views;
create policy "Admins read company views"
  on public.company_views for select
  using (public.is_admin() or viewer_id = auth.uid());

drop policy if exists "Anyone can create company views" on public.company_views;
create policy "Anyone can create company views"
  on public.company_views for insert
  with check (true);
