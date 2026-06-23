create extension if not exists pgcrypto;

do $$ begin
  create type public.profile_role as enum ('customer', 'professional', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.language_code as enum ('en', 'es');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.verification_type as enum (
    'identity',
    'business',
    'license',
    'insurance',
    'bank_account',
    'revenue',
    'vp23_elite'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.verification_status as enum ('pending', 'approved', 'rejected', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.job_status as enum ('draft', 'requested', 'scheduled', 'active', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.document_type as enum (
    'contract',
    'permit',
    'inspection_report',
    'insurance_document',
    'license',
    'photo',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.business_document_status as enum ('draft', 'sent', 'accepted', 'declined', 'void');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.partner_type as enum (
    'working_capital',
    'equipment_financing',
    'vehicle_financing',
    'insurance_provider',
    'equipment_rental',
    'material_supplier',
    'business_service',
    'invoice_factoring'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.profile_role not null default 'customer',
  display_name text,
  avatar_url text,
  preferred_language public.language_code not null default 'en',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_es text not null,
  description_en text,
  description_es text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  company_name text not null,
  owner_name text,
  description text,
  service_areas text[] not null default '{}',
  years_in_business integer,
  license_numbers text[] not null default '{}',
  insurance_information text,
  website text,
  phone text,
  email text,
  social_media jsonb not null default '{}'::jsonb,
  languages public.language_code[] not null default array['en']::public.language_code[],
  photos text[] not null default '{}',
  videos text[] not null default '{}',
  rating_average numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  is_identity_verified boolean not null default false,
  is_business_verified boolean not null default false,
  is_license_verified boolean not null default false,
  is_insurance_verified boolean not null default false,
  is_bank_account_verified boolean not null default false,
  is_revenue_verified boolean not null default false,
  is_vp23_elite boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_companies (
  customer_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, company_id)
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  project_details text not null,
  location text,
  service_area text,
  preferred_language public.language_code not null default 'en',
  media_urls text[] not null default '{}',
  status public.job_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  quote_request_id uuid references public.quote_requests(id) on delete set null,
  title text not null,
  description text,
  location text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  status public.job_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  quote_request_id uuid references public.quote_requests(id) on delete set null,
  estimate_number text,
  title text not null,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  status public.business_document_status not null default 'draft',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  estimate_id uuid references public.estimates(id) on delete set null,
  invoice_number text,
  title text not null,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  due_at timestamptz,
  status public.business_document_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  title text not null,
  body text,
  document_url text,
  version integer not null default 1,
  status public.business_document_status not null default 'draft',
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.change_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  price_change_cents integer not null default 0,
  status public.business_document_status not null default 'draft',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  document_type public.document_type not null,
  title text not null,
  storage_bucket text not null default 'vp23-documents',
  storage_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  license_type text,
  license_number text not null,
  issuing_authority text,
  state text,
  expires_at date,
  document_id uuid references public.documents(id) on delete set null,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider_name text not null,
  policy_number text,
  coverage_type text,
  coverage_amount_cents bigint,
  expires_at date,
  document_id uuid references public.documents(id) on delete set null,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  verification_type public.verification_type not null,
  status public.verification_status not null default 'pending',
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  notes text,
  evidence_document_id uuid references public.documents(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_target_required check (company_id is not null or profile_id is not null)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  professional_response text,
  professional_responded_at timestamptz,
  is_removed boolean not null default false,
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  media_type text not null check (media_type in ('photo', 'video')),
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_companies (
  id uuid primary key default gen_random_uuid(),
  partner_type public.partner_type not null,
  name text not null,
  logo_url text,
  description text,
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  service_areas text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.equipment_listings (
  id uuid primary key default gen_random_uuid(),
  partner_company_id uuid references public.partner_companies(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  title text not null,
  description text,
  category text,
  location text,
  service_areas text[] not null default '{}',
  daily_rate_cents integer,
  weekly_rate_cents integer,
  monthly_rate_cents integer,
  photos text[] not null default '{}',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipment_owner_required check (partner_company_id is not null or company_id is not null)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text,
  notification_type text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'VP23 Workspace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_preferred_language_idx on public.profiles(preferred_language);
create index if not exists categories_active_idx on public.categories(is_active);
create index if not exists companies_owner_idx on public.companies(owner_id);
create index if not exists companies_category_idx on public.companies(category_id);
create index if not exists companies_rating_idx on public.companies(rating_average desc);
create index if not exists companies_verified_idx on public.companies(is_business_verified, is_license_verified, is_insurance_verified);
create index if not exists companies_service_areas_idx on public.companies using gin(service_areas);
create index if not exists companies_languages_idx on public.companies using gin(languages);
create index if not exists quote_requests_customer_idx on public.quote_requests(customer_id);
create index if not exists quote_requests_company_idx on public.quote_requests(company_id);
create index if not exists jobs_company_idx on public.jobs(company_id);
create index if not exists jobs_customer_idx on public.jobs(customer_id);
create index if not exists estimates_company_idx on public.estimates(company_id);
create index if not exists invoices_company_idx on public.invoices(company_id);
create index if not exists contracts_company_idx on public.contracts(company_id);
create index if not exists change_orders_job_idx on public.change_orders(job_id);
create index if not exists documents_owner_idx on public.documents(owner_id);
create index if not exists documents_company_idx on public.documents(company_id);
create index if not exists licenses_company_idx on public.licenses(company_id);
create index if not exists insurance_policies_company_idx on public.insurance_policies(company_id);
create index if not exists verification_requests_status_idx on public.verification_requests(status);
create index if not exists verification_requests_company_idx on public.verification_requests(company_id);
create index if not exists reviews_company_idx on public.reviews(company_id);
create index if not exists reviews_customer_idx on public.reviews(customer_id);
create index if not exists partner_companies_type_idx on public.partner_companies(partner_type);
create index if not exists equipment_listings_location_idx on public.equipment_listings(location);
create index if not exists equipment_listings_service_areas_idx on public.equipment_listings using gin(service_areas);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id, read_at);
create index if not exists workspaces_owner_idx on public.workspaces(owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
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
      and role = 'admin'
  );
$$;

create or replace function public.owns_company(company_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies
    where id = company_uuid
      and owner_id = auth.uid()
  );
$$;

create or replace function public.company_customer(company_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.jobs
    where company_id = company_uuid
      and customer_id = auth.uid()
  );
$$;

create or replace function public.refresh_company_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.companies
  set
    rating_average = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where company_id = coalesce(new.company_id, old.company_id)
        and is_removed = false
    ), 0),
    rating_count = (
      select count(*)
      from public.reviews
      where company_id = coalesce(new.company_id, old.company_id)
        and is_removed = false
    )
  where id = coalesce(new.company_id, old.company_id);

  return coalesce(new, old);
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'categories',
    'companies',
    'quote_requests',
    'jobs',
    'estimates',
    'invoices',
    'contracts',
    'change_orders',
    'documents',
    'licenses',
    'insurance_policies',
    'verification_requests',
    'reviews',
    'partner_companies',
    'equipment_listings',
    'workspaces'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

drop trigger if exists refresh_company_rating_on_review_change on public.reviews;
create trigger refresh_company_rating_on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_company_rating();

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
    when new.raw_user_meta_data ->> 'role' in ('customer', 'professional', 'admin')
      then (new.raw_user_meta_data ->> 'role')::public.profile_role
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.companies enable row level security;
alter table public.saved_companies enable row level security;
alter table public.quote_requests enable row level security;
alter table public.jobs enable row level security;
alter table public.estimates enable row level security;
alter table public.invoices enable row level security;
alter table public.contracts enable row level security;
alter table public.change_orders enable row level security;
alter table public.documents enable row level security;
alter table public.licenses enable row level security;
alter table public.insurance_policies enable row level security;
alter table public.verification_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.review_media enable row level security;
alter table public.partner_companies enable row level security;
alter table public.equipment_listings enable row level security;
alter table public.notifications enable row level security;
alter table public.workspaces enable row level security;

create policy "Profiles are readable by owner or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Profiles are editable by owner or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "Categories are public when active"
  on public.categories for select
  using (is_active or public.is_admin());

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Active companies are searchable"
  on public.companies for select
  using (is_active or owner_id = auth.uid() or public.is_admin());

create policy "Professionals create companies"
  on public.companies for insert
  with check (owner_id = auth.uid() or public.is_admin());

create policy "Company owners manage companies"
  on public.companies for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "Company owners delete companies"
  on public.companies for delete
  using (owner_id = auth.uid() or public.is_admin());

create policy "Customers manage saved companies"
  on public.saved_companies for all
  using (customer_id = auth.uid() or public.is_admin())
  with check (customer_id = auth.uid() or public.is_admin());

create policy "Quote participants can read requests"
  on public.quote_requests for select
  using (
    customer_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  );

create policy "Customers create quote requests"
  on public.quote_requests for insert
  with check (customer_id = auth.uid() or public.is_admin());

create policy "Quote participants update requests"
  on public.quote_requests for update
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

create policy "Job participants can read jobs"
  on public.jobs for select
  using (
    customer_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  );

create policy "Company owners manage jobs"
  on public.jobs for all
  using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Company owners manage estimates"
  on public.estimates for all
  using (public.owns_company(company_id) or customer_id = auth.uid() or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Company owners manage invoices"
  on public.invoices for all
  using (public.owns_company(company_id) or customer_id = auth.uid() or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Company owners manage contracts"
  on public.contracts for all
  using (public.owns_company(company_id) or customer_id = auth.uid() or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Company owners manage change orders"
  on public.change_orders for all
  using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Document owners and participants can read documents"
  on public.documents for select
  using (
    owner_id = auth.uid()
    or public.owns_company(company_id)
    or public.company_customer(company_id)
    or public.is_admin()
  );

create policy "Document owners create documents"
  on public.documents for insert
  with check (
    owner_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  );

create policy "Document owners update documents"
  on public.documents for update
  using (
    owner_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  )
  with check (
    owner_id = auth.uid()
    or public.owns_company(company_id)
    or public.is_admin()
  );

create policy "Company owners manage licenses"
  on public.licenses for all
  using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Company owners manage insurance"
  on public.insurance_policies for all
  using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Verification participants read requests"
  on public.verification_requests for select
  using (
    profile_id = auth.uid()
    or public.owns_company(company_id)
    or submitted_by = auth.uid()
    or public.is_admin()
  );

create policy "Users submit verification requests"
  on public.verification_requests for insert
  with check (
    profile_id = auth.uid()
    or public.owns_company(company_id)
    or submitted_by = auth.uid()
    or public.is_admin()
  );

create policy "Admins update verification requests"
  on public.verification_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Visible reviews are public"
  on public.reviews for select
  using (is_removed = false or customer_id = auth.uid() or public.owns_company(company_id) or public.is_admin());

create policy "Customers create reviews"
  on public.reviews for insert
  with check (customer_id = auth.uid() or public.is_admin());

create policy "Customers professionals and admins update reviews"
  on public.reviews for update
  using (customer_id = auth.uid() or public.owns_company(company_id) or public.is_admin())
  with check (customer_id = auth.uid() or public.owns_company(company_id) or public.is_admin());

create policy "Review media follows review visibility"
  on public.review_media for select
  using (
    exists (
      select 1 from public.reviews
      where reviews.id = review_media.review_id
        and (reviews.is_removed = false or reviews.customer_id = auth.uid() or public.owns_company(reviews.company_id) or public.is_admin())
    )
  );

create policy "Review owners upload media"
  on public.review_media for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.reviews
      where reviews.id = review_media.review_id
        and reviews.customer_id = auth.uid()
    )
  );

create policy "Active partners are public"
  on public.partner_companies for select
  using (is_active or public.is_admin());

create policy "Admins manage partners"
  on public.partner_companies for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Available equipment is public"
  on public.equipment_listings for select
  using (is_available or public.owns_company(company_id) or public.is_admin());

create policy "Owners and admins manage equipment"
  on public.equipment_listings for all
  using (public.owns_company(company_id) or public.is_admin())
  with check (public.owns_company(company_id) or public.is_admin());

create policy "Users read notifications"
  on public.notifications for select
  using (recipient_id = auth.uid() or public.is_admin());

create policy "Users update their notifications"
  on public.notifications for update
  using (recipient_id = auth.uid() or public.is_admin())
  with check (recipient_id = auth.uid() or public.is_admin());

create policy "System or admins create notifications"
  on public.notifications for insert
  with check (recipient_id = auth.uid() or public.is_admin());

create policy "Users can read their own workspaces"
  on public.workspaces for select
  using (auth.uid() = owner_id or public.is_admin());

create policy "Users can create their own workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id or public.is_admin());

create policy "Users can update their own workspaces"
  on public.workspaces for update
  using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

create policy "Users can delete their own workspaces"
  on public.workspaces for delete
  using (auth.uid() = owner_id or public.is_admin());

insert into public.categories (slug, name_en, name_es)
values
  ('electrician', 'Electrician', 'Electricista'),
  ('hvac', 'HVAC', 'HVAC'),
  ('plumbing', 'Plumbing', 'Plomeria'),
  ('roofing', 'Roofing', 'Techos'),
  ('concrete', 'Concrete', 'Concreto'),
  ('landscaping', 'Landscaping', 'Jardineria'),
  ('general-contractor', 'General Contractor', 'Contratista general'),
  ('painting', 'Painting', 'Pintura'),
  ('handyman', 'Handyman', 'Mantenimiento'),
  ('cleaning', 'Cleaning', 'Limpieza'),
  ('pest-control', 'Pest Control', 'Control de plagas')
on conflict (slug) do update
set
  name_en = excluded.name_en,
  name_es = excluded.name_es,
  updated_at = now();

insert into storage.buckets (id, name, public)
values ('vp23-documents', 'vp23-documents', false)
on conflict (id) do nothing;

create policy "Authenticated users upload VP23 documents"
  on storage.objects for insert
  with check (
    bucket_id = 'vp23-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners read VP23 documents"
  on storage.objects for select
  using (
    bucket_id = 'vp23-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "Owners update VP23 documents"
  on storage.objects for update
  using (
    bucket_id = 'vp23-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  )
  with check (
    bucket_id = 'vp23-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
