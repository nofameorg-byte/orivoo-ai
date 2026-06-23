-- VP23 trust engine forward migration.
-- Adds functional trust workflow support without changing auth/RLS foundations.

alter table public.companies
  add column if not exists logo_url text,
  add column if not exists cover_image_url text;

alter table public.verification_requests
  add column if not exists expires_at date;

create table if not exists public.review_helpful_votes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, voter_id)
);

create table if not exists public.review_flags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  flagged_by uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status public.verification_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, flagged_by)
);

create index if not exists review_helpful_votes_voter_idx
  on public.review_helpful_votes(voter_id);

create index if not exists review_flags_review_idx
  on public.review_flags(review_id);

create index if not exists review_flags_status_idx
  on public.review_flags(status);

create index if not exists verification_requests_expires_at_idx
  on public.verification_requests(expires_at);

create index if not exists licenses_expires_status_idx
  on public.licenses(expires_at, verification_status);

create index if not exists insurance_policies_expires_status_idx
  on public.insurance_policies(expires_at, verification_status);

alter table public.review_helpful_votes enable row level security;
alter table public.review_flags enable row level security;

drop trigger if exists set_review_flags_updated_at on public.review_flags;
create trigger set_review_flags_updated_at
  before update on public.review_flags
  for each row execute function public.set_updated_at();

create or replace function public.refresh_company_verification_flags(company_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.companies
  set
    is_identity_verified = exists (
      select 1 from public.verification_requests
      where company_id = company_uuid
        and verification_type = 'identity'
        and status = 'approved'
        and (expires_at is null or expires_at >= current_date)
    ),
    is_business_verified = exists (
      select 1 from public.verification_requests
      where company_id = company_uuid
        and verification_type = 'business'
        and status = 'approved'
        and (expires_at is null or expires_at >= current_date)
    ),
    is_license_verified = exists (
      select 1 from public.licenses
      where company_id = company_uuid
        and verification_status = 'approved'
        and (expires_at is null or expires_at >= current_date)
    ),
    is_insurance_verified = exists (
      select 1 from public.insurance_policies
      where company_id = company_uuid
        and verification_status = 'approved'
        and (expires_at is null or expires_at >= current_date)
    ),
    is_revenue_verified = exists (
      select 1 from public.verification_requests
      where company_id = company_uuid
        and verification_type = 'revenue'
        and status = 'approved'
        and (expires_at is null or expires_at >= current_date)
    ),
    is_vp23_elite = exists (
      select 1 from public.verification_requests
      where company_id = company_uuid
        and verification_type = 'vp23_elite'
        and status = 'approved'
        and (expires_at is null or expires_at >= current_date)
    ),
    updated_at = now()
  where id = company_uuid;
end;
$$;

create or replace function public.sync_verification_request_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and new.expires_at is not null and new.expires_at < current_date then
    new.status = 'expired';
  end if;

  return new;
end;
$$;

drop trigger if exists sync_verification_request_status on public.verification_requests;
create trigger sync_verification_request_status
  before insert or update on public.verification_requests
  for each row execute function public.sync_verification_request_status();

create or replace function public.sync_company_verification_from_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.company_id is not null then
    perform public.refresh_company_verification_flags(new.company_id);
  end if;

  if old.company_id is not null and old.company_id is distinct from new.company_id then
    perform public.refresh_company_verification_flags(old.company_id);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_company_verification_from_request on public.verification_requests;
create trigger sync_company_verification_from_request
  after insert or update on public.verification_requests
  for each row execute function public.sync_company_verification_from_request();

create or replace function public.sync_license_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status = 'approved' and new.expires_at is not null and new.expires_at < current_date then
    new.verification_status = 'expired';
  end if;

  return new;
end;
$$;

drop trigger if exists sync_license_status on public.licenses;
create trigger sync_license_status
  before insert or update on public.licenses
  for each row execute function public.sync_license_status();

create or replace function public.sync_company_verification_from_license()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_company_verification_flags(coalesce(new.company_id, old.company_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_company_verification_from_license on public.licenses;
create trigger sync_company_verification_from_license
  after insert or update or delete on public.licenses
  for each row execute function public.sync_company_verification_from_license();

create or replace function public.sync_insurance_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status = 'approved' and new.expires_at is not null and new.expires_at < current_date then
    new.verification_status = 'expired';
  end if;

  return new;
end;
$$;

drop trigger if exists sync_insurance_status on public.insurance_policies;
create trigger sync_insurance_status
  before insert or update on public.insurance_policies
  for each row execute function public.sync_insurance_status();

create or replace function public.sync_company_verification_from_insurance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_company_verification_flags(coalesce(new.company_id, old.company_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_company_verification_from_insurance on public.insurance_policies;
create trigger sync_company_verification_from_insurance
  after insert or update or delete on public.insurance_policies
  for each row execute function public.sync_company_verification_from_insurance();

drop policy if exists "Review helpful votes are readable with reviews" on public.review_helpful_votes;
create policy "Review helpful votes are readable with reviews"
  on public.review_helpful_votes for select
  using (
    exists (
      select 1 from public.reviews
      where reviews.id = review_helpful_votes.review_id
        and (reviews.is_removed = false or reviews.customer_id = auth.uid() or public.owns_company(reviews.company_id) or public.is_admin())
    )
  );

drop policy if exists "Authenticated users manage own helpful votes" on public.review_helpful_votes;
create policy "Authenticated users manage own helpful votes"
  on public.review_helpful_votes for all
  using (voter_id = auth.uid() or public.is_admin())
  with check (voter_id = auth.uid() or public.is_admin());

drop policy if exists "Review flags are readable by participants and admins" on public.review_flags;
create policy "Review flags are readable by participants and admins"
  on public.review_flags for select
  using (
    flagged_by = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.reviews
      where reviews.id = review_flags.review_id
        and (reviews.customer_id = auth.uid() or public.owns_company(reviews.company_id))
    )
  );

drop policy if exists "Authenticated users create review flags" on public.review_flags;
create policy "Authenticated users create review flags"
  on public.review_flags for insert
  with check (flagged_by = auth.uid());

drop policy if exists "Admins update review flags" on public.review_flags;
create policy "Admins update review flags"
  on public.review_flags for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Owners upload company media" on storage.objects;
create policy "Owners upload company media"
  on storage.objects for insert
  with check (
    bucket_id = 'vp23-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
