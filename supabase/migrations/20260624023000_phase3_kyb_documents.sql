alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
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

create table if not exists public.kyb_applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  legal_business_name text not null default 'Versatile Partners 23, LLC',
  dba_name text default 'VP23',
  ein text,
  formation_state text,
  business_type text,
  industry text,
  website text default 'https://vp-23.com',
  contact_email text default 'contact@vp-23.com',
  phone_number text,
  business_address text default '106 Sparrow Circle, Blackville, SC 29817',
  mailing_address text default '106 Sparrow Circle, Blackville, SC 29817',
  expected_monthly_transaction_volume numeric(14, 2),
  expected_average_transaction_size numeric(14, 2),
  source_of_funds text,
  intended_use_of_account text,
  certification_accepted boolean not null default false,
  status text not null default 'draft'
    check (status in (
      'draft',
      'submitted',
      'under_review',
      'more_info_needed',
      'approved',
      'rejected',
      'partner_review'
    )),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.beneficial_owners (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.kyb_applications(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  title text not null,
  ownership_percentage numeric(5, 2) not null
    check (ownership_percentage >= 0 and ownership_percentage <= 100),
  date_of_birth date not null,
  address text not null,
  ssn_last4 text
    check (ssn_last4 is null or ssn_last4 ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.kyb_applications(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  category text not null
    check (category in (
      'EIN letter',
      'Articles of Organization',
      'Operating Agreement',
      'Beneficial Owner ID',
      'Proof of Address',
      'Bank Statement',
      'Business License',
      'Other'
    )),
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null
    check (mime_type in ('application/pdf', 'image/png', 'image/jpg', 'image/jpeg')),
  file_size integer not null check (file_size > 0 and file_size <= 10485760),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'verified', 'rejected')),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_review_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.kyb_applications(id) on delete cascade,
  document_id uuid references public.business_documents(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  note_type text not null default 'internal'
    check (note_type in ('internal', 'more_info_request', 'decision', 'risk')),
  created_at timestamptz not null default now(),
  check (application_id is not null or document_id is not null)
);

create table if not exists public.application_status_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.kyb_applications(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  from_status text,
  to_status text not null,
  message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.kyb_applications enable row level security;
alter table public.beneficial_owners enable row level security;
alter table public.business_documents enable row level security;
alter table public.admin_review_notes enable row level security;
alter table public.application_status_events enable row level security;

drop policy if exists "Users can read their own KYB application" on public.kyb_applications;
create policy "Users can read their own KYB application"
  on public.kyb_applications for select
  using (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Users can create their own KYB application" on public.kyb_applications;
create policy "Users can create their own KYB application"
  on public.kyb_applications for insert
  with check (auth.uid() = owner_id or auth.role() = 'service_role');

drop policy if exists "Users can update their own KYB draft" on public.kyb_applications;
create policy "Users can update their own KYB draft"
  on public.kyb_applications for update
  using (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role')
  with check (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Users can manage their own beneficial owners" on public.beneficial_owners;
create policy "Users can manage their own beneficial owners"
  on public.beneficial_owners for all
  using (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role')
  with check (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Users can manage their own business documents" on public.business_documents;
create policy "Users can manage their own business documents"
  on public.business_documents for all
  using (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role')
  with check (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Admins can manage review notes" on public.admin_review_notes;
create policy "Admins can manage review notes"
  on public.admin_review_notes for all
  using (public.is_admin() or auth.role() = 'service_role')
  with check (public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Users can read their own status events" on public.application_status_events;
create policy "Users can read their own status events"
  on public.application_status_events for select
  using (auth.uid() = owner_id or public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Admins can create status events" on public.application_status_events;
create policy "Admins can create status events"
  on public.application_status_events for insert
  with check (public.is_admin() or auth.role() = 'service_role');

drop trigger if exists set_kyb_applications_updated_at on public.kyb_applications;
create trigger set_kyb_applications_updated_at
  before update on public.kyb_applications
  for each row execute function public.set_updated_at();

drop trigger if exists set_beneficial_owners_updated_at on public.beneficial_owners;
create trigger set_beneficial_owners_updated_at
  before update on public.beneficial_owners
  for each row execute function public.set_updated_at();

drop trigger if exists set_business_documents_updated_at on public.business_documents;
create trigger set_business_documents_updated_at
  before update on public.business_documents
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-documents',
  'business-documents',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpg', 'image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view their own business document files" on storage.objects;
create policy "Users can view their own business document files"
  on storage.objects for select
  using (
    bucket_id = 'business-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or auth.role() = 'service_role'
    )
  );

drop policy if exists "Users can upload their own business document files" on storage.objects;
create policy "Users can upload their own business document files"
  on storage.objects for insert
  with check (
    bucket_id = 'business-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or auth.role() = 'service_role'
    )
  );

drop policy if exists "Users can update their own business document files" on storage.objects;
create policy "Users can update their own business document files"
  on storage.objects for update
  using (
    bucket_id = 'business-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or auth.role() = 'service_role'
    )
  )
  with check (
    bucket_id = 'business-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or auth.role() = 'service_role'
    )
  );

drop policy if exists "Users can delete their own business document files" on storage.objects;
create policy "Users can delete their own business document files"
  on storage.objects for delete
  using (
    bucket_id = 'business-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or auth.role() = 'service_role'
    )
  );
