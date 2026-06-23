-- VP23 transaction engine and real-world workflow fixes.

alter type public.job_status add value if not exists 'pending';
alter type public.job_status add value if not exists 'accepted';
alter type public.job_status add value if not exists 'declined';
alter type public.job_status add value if not exists 'converted_to_job';
alter type public.job_status add value if not exists 'in_progress';

alter table public.quote_requests
  add column if not exists professional_response text,
  add column if not exists responded_at timestamptz,
  add column if not exists converted_job_id uuid references public.jobs(id) on delete set null;

alter table public.jobs
  add column if not exists customer_accepted_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists professional_notes text;

alter table public.companies
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text;

create index if not exists quote_requests_status_idx
  on public.quote_requests(status);

create index if not exists jobs_status_idx
  on public.jobs(status);

create index if not exists companies_city_state_postal_idx
  on public.companies(city, state, postal_code);

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

  if tg_op = 'UPDATE' and old.company_id is not null and old.company_id is distinct from new.company_id then
    perform public.refresh_company_verification_flags(old.company_id);
  end if;

  return new;
end;
$$;

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
    ) or exists (
      select 1 from public.company_claims
      where company_id = company_uuid
        and status = 'approved'
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

create or replace function public.sync_company_verification_from_claim()
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

drop trigger if exists sync_company_verification_from_claim on public.company_claims;
create trigger sync_company_verification_from_claim
  after insert or update or delete on public.company_claims
  for each row execute function public.sync_company_verification_from_claim();

create or replace function public.prevent_non_professional_company_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = new.owner_id
      and role = 'professional'
  ) then
    raise exception 'Only professional accounts can own companies.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_non_professional_company_owner on public.companies;
create trigger prevent_non_professional_company_owner
  before insert or update of owner_id on public.companies
  for each row execute function public.prevent_non_professional_company_owner();

create or replace function public.flag_review_on_review_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reviews
  set is_flagged = true
  where id = new.review_id;

  return new;
end;
$$;

drop trigger if exists flag_review_on_review_flag on public.review_flags;
create trigger flag_review_on_review_flag
  after insert on public.review_flags
  for each row execute function public.flag_review_on_review_flag();

drop policy if exists "Customers create quote requests" on public.quote_requests;
create policy "Customers create quote requests"
  on public.quote_requests for insert
  with check (
    customer_id = auth.uid()
    and public.has_profile_role('customer')
  );

drop policy if exists "Quote participants update requests" on public.quote_requests;
create policy "Professionals update quote requests"
  on public.quote_requests for update
  using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

drop policy if exists "Customers update their jobs" on public.jobs;
create policy "Customers update their jobs"
  on public.jobs for update
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create or replace function public.prevent_customer_job_spoofing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or public.owns_company(old.company_id) then
    return new;
  end if;

  if auth.uid() = old.customer_id then
    if new.company_id is distinct from old.company_id
      or new.customer_id is distinct from old.customer_id
      or new.quote_request_id is distinct from old.quote_request_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.status is distinct from 'scheduled'
      or new.customer_accepted_at is null then
      raise exception 'Customers can only accept pending jobs.';
    end if;

    return new;
  end if;

  raise exception 'Not authorized to update this job.';
end;
$$;

drop trigger if exists prevent_customer_job_spoofing on public.jobs;
create trigger prevent_customer_job_spoofing
  before update on public.jobs
  for each row execute function public.prevent_customer_job_spoofing();
