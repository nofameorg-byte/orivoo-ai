create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.documents
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

create index if not exists conversations_project_updated_idx
  on public.conversations (project_id, updated_at desc);

create index if not exists documents_project_updated_idx
  on public.documents (project_id, updated_at desc);

alter table public.projects enable row level security;

create policy "Users can read their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
