create extension if not exists pgcrypto;

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

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'ORIVOO AI Workspace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger set_workspaces_updated_at
  before update on public.workspaces
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;

create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can create their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles
  for delete
  using (auth.uid() = id);

create policy "Users can read their own workspaces"
  on public.workspaces
  for select
  using (auth.uid() = owner_id);

create policy "Users can create their own workspaces"
  on public.workspaces
  for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own workspaces"
  on public.workspaces
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own workspaces"
  on public.workspaces
  for delete
  using (auth.uid() = owner_id);
