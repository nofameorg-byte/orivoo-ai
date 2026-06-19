create table if not exists public.artifact_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.artifact_folders(id) on delete set null,
  title text not null,
  artifact_type text not null check (
    artifact_type in (
      'document',
      'report',
      'code',
      'website_plan',
      'research',
      'business_plan',
      'legal_draft',
      'civic_report'
    )
  ),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artifact_folders_project_id_idx
  on public.artifact_folders(project_id);
create index if not exists artifact_folders_user_id_idx
  on public.artifact_folders(user_id);
create index if not exists artifacts_project_id_updated_at_idx
  on public.artifacts(project_id, updated_at desc);
create index if not exists artifacts_user_id_idx
  on public.artifacts(user_id);
create index if not exists artifacts_folder_id_idx
  on public.artifacts(folder_id);

alter table public.artifact_folders enable row level security;
alter table public.artifacts enable row level security;

create policy "Users can read artifact folders for their projects"
  on public.artifact_folders for select
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifact_folders.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can create artifact folders for their projects"
  on public.artifact_folders for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifact_folders.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update artifact folders for their projects"
  on public.artifact_folders for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifact_folders.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifact_folders.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete artifact folders for their projects"
  on public.artifact_folders for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifact_folders.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can read artifacts for their projects"
  on public.artifacts for select
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can create artifacts for their projects"
  on public.artifacts for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
    and (
      folder_id is null
      or exists (
        select 1
        from public.artifact_folders
        where artifact_folders.id = artifacts.folder_id
          and artifact_folders.project_id = artifacts.project_id
          and artifact_folders.user_id = auth.uid()
      )
    )
  );

create policy "Users can update artifacts for their projects"
  on public.artifacts for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
    and (
      folder_id is null
      or exists (
        select 1
        from public.artifact_folders
        where artifact_folders.id = artifacts.folder_id
          and artifact_folders.project_id = artifacts.project_id
          and artifact_folders.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete artifacts for their projects"
  on public.artifacts for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = artifacts.project_id
        and projects.user_id = auth.uid()
    )
  );

drop trigger if exists set_artifact_folders_updated_at on public.artifact_folders;
create trigger set_artifact_folders_updated_at
  before update on public.artifact_folders
  for each row execute function public.set_updated_at();

drop trigger if exists set_artifacts_updated_at on public.artifacts;
create trigger set_artifacts_updated_at
  before update on public.artifacts
  for each row execute function public.set_updated_at();
