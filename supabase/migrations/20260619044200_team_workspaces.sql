alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'pro', 'business', 'enterprise'));

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create unique index if not exists project_members_one_owner_idx
  on public.project_members(project_id)
  where role = 'owner';

create index if not exists project_members_project_id_idx
  on public.project_members(project_id);
create index if not exists project_members_user_id_idx
  on public.project_members(user_id);

alter table public.project_members enable row level security;

insert into public.project_members (project_id, user_id, role)
select projects.id, projects.user_id, 'owner'
from public.projects
on conflict (project_id, user_id) do update
set role = 'owner';

create or replace function public.current_user_project_role(target_project_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select project_members.role
      from public.project_members
      where project_members.project_id = target_project_id
        and project_members.user_id = auth.uid()
      limit 1
    ),
    (
      select 'owner'
      from public.projects
      where projects.id = target_project_id
        and projects.user_id = auth.uid()
      limit 1
    )
  );
$$;

create or replace function public.current_user_has_team_plan()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.plan in ('business', 'enterprise')
  );
$$;

create or replace function public.current_user_can_read_project(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_project_role(target_project_id)
    in ('owner', 'admin', 'editor', 'viewer');
$$;

create or replace function public.current_user_can_edit_project_content(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_project_role(target_project_id)
    in ('owner', 'admin', 'editor');
$$;

create or replace function public.current_user_can_manage_project(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_project_role(target_project_id)
    in ('owner', 'admin');
$$;

create or replace function public.current_user_is_project_owner(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_project_role(target_project_id) = 'owner';
$$;

create or replace function public.transfer_project_ownership(
  target_project_id uuid,
  new_owner_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_has_team_plan() then
    raise exception 'Team workspaces require a Business or Enterprise plan.';
  end if;

  if not public.current_user_is_project_owner(target_project_id) then
    raise exception 'Only the project owner can transfer ownership.';
  end if;

  if not exists (select 1 from auth.users where auth.users.id = new_owner_id) then
    raise exception 'Target user does not exist.';
  end if;

  update public.project_members
  set role = 'admin'
  where project_members.project_id = target_project_id
    and project_members.role = 'owner';

  insert into public.project_members (project_id, user_id, role)
  values (target_project_id, new_owner_id, 'owner')
  on conflict (project_id, user_id) do update
  set role = 'owner';

  update public.projects
  set user_id = new_owner_id
  where projects.id = target_project_id;
end;
$$;

create policy "Project members can read project memberships"
  on public.project_members for select
  using (public.current_user_can_read_project(project_id));

create policy "Owners and admins can invite project members"
  on public.project_members for insert
  with check (
    (
      auth.uid() = user_id
      and role = 'owner'
      and exists (
        select 1
        from public.projects
        where projects.id = project_members.project_id
          and projects.user_id = auth.uid()
      )
    )
    or (
      public.current_user_has_team_plan()
      and public.current_user_can_manage_project(project_id)
    )
  );

create policy "Owners and admins can update project members"
  on public.project_members for update
  using (
    public.current_user_has_team_plan()
    and public.current_user_can_manage_project(project_id)
  )
  with check (
    public.current_user_has_team_plan()
    and public.current_user_can_manage_project(project_id)
  );

create policy "Owners and admins can remove project members"
  on public.project_members for delete
  using (
    public.current_user_has_team_plan()
    and public.current_user_can_manage_project(project_id)
  );

drop policy if exists "Users can read their own projects" on public.projects;
drop policy if exists "Users can update their own projects" on public.projects;
drop policy if exists "Users can delete their own projects" on public.projects;

create policy "Project members can read projects"
  on public.projects for select
  using (public.current_user_can_read_project(id));

create policy "Owners and admins can update projects"
  on public.projects for update
  using (public.current_user_can_manage_project(id))
  with check (public.current_user_can_manage_project(id));

create policy "Owners can delete projects"
  on public.projects for delete
  using (public.current_user_is_project_owner(id));

drop policy if exists "Users can read files for their projects" on public.files;
drop policy if exists "Users can create files for their projects" on public.files;
drop policy if exists "Users can delete files for their projects" on public.files;

create policy "Project members can read files"
  on public.files for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can create files"
  on public.files for insert
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can delete files"
  on public.files for delete
  using (public.current_user_can_edit_project_content(project_id));

drop policy if exists "Users can read artifact folders for their projects"
  on public.artifact_folders;
drop policy if exists "Users can create artifact folders for their projects"
  on public.artifact_folders;
drop policy if exists "Users can update artifact folders for their projects"
  on public.artifact_folders;
drop policy if exists "Users can delete artifact folders for their projects"
  on public.artifact_folders;

create policy "Project members can read artifact folders"
  on public.artifact_folders for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can create artifact folders"
  on public.artifact_folders for insert
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can update artifact folders"
  on public.artifact_folders for update
  using (public.current_user_can_edit_project_content(project_id))
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can delete artifact folders"
  on public.artifact_folders for delete
  using (public.current_user_can_edit_project_content(project_id));

drop policy if exists "Users can read artifacts for their projects"
  on public.artifacts;
drop policy if exists "Users can create artifacts for their projects"
  on public.artifacts;
drop policy if exists "Users can update artifacts for their projects"
  on public.artifacts;
drop policy if exists "Users can delete artifacts for their projects"
  on public.artifacts;

create policy "Project members can read artifacts"
  on public.artifacts for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can create artifacts"
  on public.artifacts for insert
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
    and (
      folder_id is null
      or exists (
        select 1
        from public.artifact_folders
        where artifact_folders.id = artifacts.folder_id
          and artifact_folders.project_id = artifacts.project_id
          and public.current_user_can_read_project(artifact_folders.project_id)
      )
    )
  );

create policy "Editors can update artifacts"
  on public.artifacts for update
  using (public.current_user_can_edit_project_content(project_id))
  with check (
    public.current_user_can_edit_project_content(project_id)
    and (
      folder_id is null
      or exists (
        select 1
        from public.artifact_folders
        where artifact_folders.id = artifacts.folder_id
          and artifact_folders.project_id = artifacts.project_id
          and public.current_user_can_read_project(artifact_folders.project_id)
      )
    )
  );

create policy "Editors can delete artifacts"
  on public.artifacts for delete
  using (public.current_user_can_edit_project_content(project_id));

drop policy if exists "Users can read research jobs for their projects"
  on public.research_jobs;
drop policy if exists "Users can create research jobs for their projects"
  on public.research_jobs;
drop policy if exists "Users can update research jobs for their projects"
  on public.research_jobs;
drop policy if exists "Users can delete research jobs for their projects"
  on public.research_jobs;

create policy "Project members can read research jobs"
  on public.research_jobs for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can create research jobs"
  on public.research_jobs for insert
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can update research jobs"
  on public.research_jobs for update
  using (public.current_user_can_edit_project_content(project_id))
  with check (public.current_user_can_edit_project_content(project_id));

create policy "Editors can delete research jobs"
  on public.research_jobs for delete
  using (public.current_user_can_edit_project_content(project_id));

drop policy if exists "Users can upload project file objects" on storage.objects;
drop policy if exists "Users can view project file objects" on storage.objects;
drop policy if exists "Users can delete project file objects" on storage.objects;

create policy "Editors can upload project file objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1
      from public.projects
      where projects.id::text = (storage.foldername(name))[2]
        and public.current_user_can_edit_project_content(projects.id)
    )
  );

create policy "Project members can view project file objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-files'
    and exists (
      select 1
      from public.projects
      where projects.id::text = (storage.foldername(name))[2]
        and public.current_user_can_read_project(projects.id)
    )
  );

create policy "Editors can delete project file objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-files'
    and exists (
      select 1
      from public.projects
      where projects.id::text = (storage.foldername(name))[2]
        and public.current_user_can_edit_project_content(projects.id)
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_workspace_id uuid;
  created_project_id uuid;
  requested_plan text;
begin
  requested_plan := coalesce(
    new.raw_user_meta_data ->> 'plan',
    new.raw_user_meta_data ->> 'subscription_plan',
    'free'
  );

  if requested_plan not in ('free', 'pro', 'business', 'enterprise') then
    requested_plan := 'free';
  end if;

  insert into public.profiles (id, display_name, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    requested_plan
  )
  on conflict (id) do nothing;

  insert into public.workspaces (owner_id)
  values (new.id)
  returning id into created_workspace_id;

  insert into public.projects (workspace_id, user_id, name)
  values (created_workspace_id, new.id, 'Default Project')
  returning id into created_project_id;

  insert into public.project_members (project_id, user_id, role)
  values (created_project_id, new.id, 'owner')
  on conflict (project_id, user_id) do update
  set role = 'owner';

  return new;
end;
$$;
