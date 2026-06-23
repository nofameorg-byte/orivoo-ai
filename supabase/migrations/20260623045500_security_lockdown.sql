-- VP23 security lockdown forward migration.
-- This migration intentionally does not modify previous migration files.

create or replace function public.has_profile_role(required_role public.profile_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = required_role
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.profile_role;
  requested_language public.language_code;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' = 'professional'
      then 'professional'::public.profile_role
    else 'customer'::public.profile_role
  end;

  requested_language := case
    when new.raw_user_meta_data ->> 'preferred_language' in ('en', 'es')
      then (new.raw_user_meta_data ->> 'preferred_language')::public.language_code
    else 'en'::public.language_code
  end;

  insert into public.profiles (id, display_name, role, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    requested_role,
    requested_language
  )
  on conflict (id) do nothing;

  insert into public.workspaces (owner_id, name)
  values (new.id, 'VP23 Workspace')
  on conflict do nothing;

  return new;
end;
$$;

create or replace function public.prevent_unauthorized_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is null or auth.role() = 'service_role' then
      return new;
    end if;

    if new.role = 'admin' or old.role = 'admin' then
      raise exception 'Admin role changes must be performed directly in the database.';
    end if;

    if not public.is_admin() then
      raise exception 'Only admins can update profile roles.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_profile_role_change on public.profiles;
create trigger prevent_unauthorized_profile_role_change
  before update on public.profiles
  for each row execute function public.prevent_unauthorized_profile_role_change();

create or replace function public.prevent_review_spoofing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if auth.uid() = old.customer_id then
    if new.company_id is distinct from old.company_id
      or new.customer_id is distinct from old.customer_id
      or new.job_id is distinct from old.job_id
      or new.professional_response is distinct from old.professional_response
      or new.professional_responded_at is distinct from old.professional_responded_at
      or new.is_removed is distinct from old.is_removed
      or new.is_flagged is distinct from old.is_flagged then
      raise exception 'Customers cannot change review ownership, moderation, or professional response fields.';
    end if;

    return new;
  end if;

  if public.owns_company(old.company_id) then
    if new.company_id is distinct from old.company_id
      or new.customer_id is distinct from old.customer_id
      or new.job_id is distinct from old.job_id
      or new.rating is distinct from old.rating
      or new.title is distinct from old.title
      or new.body is distinct from old.body
      or new.is_removed is distinct from old.is_removed
      or new.is_flagged is distinct from old.is_flagged then
      raise exception 'Professionals can only update their review response fields.';
    end if;

    return new;
  end if;

  raise exception 'Not authorized to update this review.';
end;
$$;

drop trigger if exists prevent_review_spoofing on public.reviews;
create trigger prevent_review_spoofing
  before update on public.reviews
  for each row execute function public.prevent_review_spoofing();

drop policy if exists "Profiles are editable by owner or admin" on public.profiles;
create policy "Profiles are editable by owner or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Professionals create companies" on public.companies;
create policy "Professionals create companies"
  on public.companies for insert
  with check (
    owner_id = auth.uid()
    and public.has_profile_role('professional')
  );

drop policy if exists "Customers create quote requests" on public.quote_requests;
create policy "Customers create quote requests"
  on public.quote_requests for insert
  with check (
    customer_id = auth.uid()
    and public.has_profile_role('customer')
  );

drop policy if exists "Users submit verification requests" on public.verification_requests;
create policy "Users submit verification requests"
  on public.verification_requests for insert
  with check (
    public.is_admin()
    or (
      submitted_by = auth.uid()
      and company_id is null
      and profile_id = auth.uid()
    )
    or (
      submitted_by = auth.uid()
      and company_id is not null
      and public.owns_company(company_id)
      and (profile_id is null or profile_id = auth.uid())
    )
  );

drop policy if exists "Customers create reviews" on public.reviews;
create policy "Customers create reviews"
  on public.reviews for insert
  with check (
    customer_id = auth.uid()
    and public.has_profile_role('customer')
    and job_id is not null
    and exists (
      select 1
      from public.jobs
      where jobs.id = reviews.job_id
        and jobs.company_id = reviews.company_id
        and jobs.customer_id = auth.uid()
        and jobs.status = 'completed'
    )
  );

drop policy if exists "Customers professionals and admins update reviews" on public.reviews;
create policy "Customers professionals and admins update reviews"
  on public.reviews for update
  using (
    customer_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  )
  with check (
    customer_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  );

drop policy if exists "Review owners upload media" on public.review_media;
create policy "Review owners upload media"
  on public.review_media for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1
      from public.reviews
      where reviews.id = review_media.review_id
        and reviews.customer_id = auth.uid()
        and reviews.job_id is not null
        and exists (
          select 1
          from public.jobs
          where jobs.id = reviews.job_id
            and jobs.company_id = reviews.company_id
            and jobs.customer_id = auth.uid()
            and jobs.status = 'completed'
        )
    )
  );
