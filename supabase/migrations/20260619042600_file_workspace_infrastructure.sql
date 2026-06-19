create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Default Project',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  file_type text not null,
  storage_path text not null unique,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_workspace_id_idx on public.projects(workspace_id);
create index if not exists files_project_id_created_at_idx on public.files(project_id, created_at desc);
create index if not exists files_user_id_idx on public.files(user_id);

alter table public.projects enable row level security;
alter table public.files enable row level security;

create policy "Users can read their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.workspaces
      where workspaces.id = projects.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.workspaces
      where workspaces.id = projects.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create policy "Users can read files for their projects"
  on public.files for select
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = files.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can create files for their projects"
  on public.files for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = files.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete files for their projects"
  on public.files for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = files.project_id
        and projects.user_id = auth.uid()
    )
  );

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

insert into public.projects (workspace_id, user_id, name)
select workspaces.id, workspaces.owner_id, 'Default Project'
from public.workspaces
where not exists (
  select 1
  from public.projects
  where projects.workspace_id = workspaces.id
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_workspace_id uuid;
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.workspaces (owner_id)
  values (new.id)
  returning id into created_workspace_id;

  insert into public.projects (workspace_id, user_id, name)
  values (created_workspace_id, new.id, 'Default Project');

  return new;
end;
$$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-files',
  'project-files',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can upload project file objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1
      from public.projects
      where projects.id::text = (storage.foldername(name))[2]
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can view project file objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1
      from public.projects
      where projects.id::text = (storage.foldername(name))[2]
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete project file objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1
      from public.projects
      where projects.id::text = (storage.foldername(name))[2]
        and projects.user_id = auth.uid()
    )
  );
