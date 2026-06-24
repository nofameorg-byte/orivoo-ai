create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'VP23 Financial Workspace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  legal_name text not null,
  entity_type text not null,
  ein_last4 text,
  industry text,
  email text,
  phone text,
  address_line1 text,
  city text,
  state text,
  postal_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_profiles_ein_last4_check
    check (ein_last4 is null or ein_last4 ~ '^[0-9]{4}$')
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  job_description text not null,
  amount_cents integer not null check (amount_cents > 0),
  due_date date not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'void')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.business_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read their own workspaces"
  on public.workspaces for select
  using (auth.uid() = owner_id);

create policy "Users can create their own workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own workspaces"
  on public.workspaces for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own workspaces"
  on public.workspaces for delete
  using (auth.uid() = owner_id);

create policy "Users can read their own business profiles"
  on public.business_profiles for select
  using (auth.uid() = owner_id);

create policy "Users can create their own business profiles"
  on public.business_profiles for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own business profiles"
  on public.business_profiles for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own business profiles"
  on public.business_profiles for delete
  using (auth.uid() = owner_id);

create policy "Users can read their own customers"
  on public.customers for select
  using (auth.uid() = owner_id);

create policy "Users can create their own customers"
  on public.customers for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own customers"
  on public.customers for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own customers"
  on public.customers for delete
  using (auth.uid() = owner_id);

create policy "Users can read their own invoices"
  on public.invoices for select
  using (auth.uid() = owner_id);

create policy "Users can create their own invoices"
  on public.invoices for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own invoices"
  on public.invoices for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own invoices"
  on public.invoices for delete
  using (auth.uid() = owner_id);

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

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

drop trigger if exists set_business_profiles_updated_at on public.business_profiles;
create trigger set_business_profiles_updated_at
  before update on public.business_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.workspaces (owner_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
