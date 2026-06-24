alter table public.profiles
  add column if not exists deleted_at timestamptz;

alter table public.workspaces
  add column if not exists deleted_at timestamptz;
