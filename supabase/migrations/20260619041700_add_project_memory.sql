create table if not exists public.project_memory (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  memory_type text not null check (
    memory_type in (
      'project_context',
      'requirements',
      'architecture',
      'preferences',
      'notes'
    )
  ),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_memory_project_id_updated_at_idx
  on public.project_memory (project_id, updated_at desc);

drop trigger if exists set_project_memory_updated_at on public.project_memory;
create trigger set_project_memory_updated_at
  before update on public.project_memory
  for each row
  execute function public.set_updated_at();

alter table public.project_memory enable row level security;

create policy "Users can read memory for their own projects"
  on public.project_memory
  for select
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_memory.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can create memory for their own projects"
  on public.project_memory
  for insert
  with check (
    exists (
      select 1
      from public.projects
      where projects.id = project_memory.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update memory for their own projects"
  on public.project_memory
  for update
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_memory.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects
      where projects.id = project_memory.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete memory for their own projects"
  on public.project_memory
  for delete
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_memory.project_id
        and projects.user_id = auth.uid()
    )
  );
