create table if not exists public.research_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null default 'queued' check (
    status in ('queued', 'running', 'completed', 'failed')
  ),
  query text not null,
  result_artifact_id uuid references public.artifacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists research_jobs_project_id_updated_at_idx
  on public.research_jobs(project_id, updated_at desc);
create index if not exists research_jobs_user_id_idx
  on public.research_jobs(user_id);
create index if not exists research_jobs_result_artifact_id_idx
  on public.research_jobs(result_artifact_id);

alter table public.research_jobs enable row level security;

create policy "Users can read research jobs for their projects"
  on public.research_jobs for select
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = research_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can create research jobs for their projects"
  on public.research_jobs for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = research_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update research jobs for their projects"
  on public.research_jobs for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = research_jobs.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = research_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete research jobs for their projects"
  on public.research_jobs for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.projects
      where projects.id = research_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

drop trigger if exists set_research_jobs_updated_at on public.research_jobs;
create trigger set_research_jobs_updated_at
  before update on public.research_jobs
  for each row execute function public.set_updated_at();
