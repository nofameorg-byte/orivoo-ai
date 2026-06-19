create table if not exists public.code_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text not null,
  prompt text not null,
  framework text not null,
  language text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.code_files (
  id uuid primary key default gen_random_uuid(),
  code_project_id uuid not null references public.code_projects(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code_project_id, file_path)
);

create index if not exists code_projects_user_updated_idx
  on public.code_projects (user_id, updated_at desc);

create index if not exists code_projects_project_updated_idx
  on public.code_projects (project_id, updated_at desc);

create index if not exists code_files_project_path_idx
  on public.code_files (code_project_id, file_path);

alter table public.code_projects enable row level security;
alter table public.code_files enable row level security;

create policy "Users can read their own code projects"
  on public.code_projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own code projects"
  on public.code_projects for insert
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1
        from public.projects
        where projects.id = code_projects.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can update their own code projects"
  on public.code_projects for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1
        from public.projects
        where projects.id = code_projects.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete their own code projects"
  on public.code_projects for delete
  using (auth.uid() = user_id);

create policy "Users can read files for their own code projects"
  on public.code_files for select
  using (
    exists (
      select 1
      from public.code_projects
      where code_projects.id = code_files.code_project_id
        and code_projects.user_id = auth.uid()
    )
  );

create policy "Users can create files for their own code projects"
  on public.code_files for insert
  with check (
    exists (
      select 1
      from public.code_projects
      where code_projects.id = code_files.code_project_id
        and code_projects.user_id = auth.uid()
    )
  );

create policy "Users can update files for their own code projects"
  on public.code_files for update
  using (
    exists (
      select 1
      from public.code_projects
      where code_projects.id = code_files.code_project_id
        and code_projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.code_projects
      where code_projects.id = code_files.code_project_id
        and code_projects.user_id = auth.uid()
    )
  );

create policy "Users can delete files for their own code projects"
  on public.code_files for delete
  using (
    exists (
      select 1
      from public.code_projects
      where code_projects.id = code_files.code_project_id
        and code_projects.user_id = auth.uid()
    )
  );

drop trigger if exists set_code_projects_updated_at on public.code_projects;
create trigger set_code_projects_updated_at
  before update on public.code_projects
  for each row execute function public.set_updated_at();

drop trigger if exists set_code_files_updated_at on public.code_files;
create trigger set_code_files_updated_at
  before update on public.code_files
  for each row execute function public.set_updated_at();
