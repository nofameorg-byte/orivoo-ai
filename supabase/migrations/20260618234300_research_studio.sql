create table if not exists public.research_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  topic text not null,
  report_content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_sources (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.research_reports(id) on delete cascade,
  source_title text not null,
  source_url text,
  source_type text not null default 'reference',
  source_content text,
  created_at timestamptz not null default now()
);

create index if not exists research_reports_user_updated_idx
  on public.research_reports (user_id, updated_at desc);

create index if not exists research_reports_project_updated_idx
  on public.research_reports (project_id, updated_at desc);

create index if not exists research_sources_report_idx
  on public.research_sources (report_id, created_at asc);

alter table public.research_reports enable row level security;
alter table public.research_sources enable row level security;

create policy "Users can read their own research reports"
  on public.research_reports for select
  using (auth.uid() = user_id);

create policy "Users can create their own research reports"
  on public.research_reports for insert
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1
        from public.projects
        where projects.id = research_reports.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can update their own research reports"
  on public.research_reports for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1
        from public.projects
        where projects.id = research_reports.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete their own research reports"
  on public.research_reports for delete
  using (auth.uid() = user_id);

create policy "Users can read sources for their own reports"
  on public.research_sources for select
  using (
    exists (
      select 1
      from public.research_reports
      where research_reports.id = research_sources.report_id
        and research_reports.user_id = auth.uid()
    )
  );

create policy "Users can create sources for their own reports"
  on public.research_sources for insert
  with check (
    exists (
      select 1
      from public.research_reports
      where research_reports.id = research_sources.report_id
        and research_reports.user_id = auth.uid()
    )
  );

create policy "Users can update sources for their own reports"
  on public.research_sources for update
  using (
    exists (
      select 1
      from public.research_reports
      where research_reports.id = research_sources.report_id
        and research_reports.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.research_reports
      where research_reports.id = research_sources.report_id
        and research_reports.user_id = auth.uid()
    )
  );

create policy "Users can delete sources for their own reports"
  on public.research_sources for delete
  using (
    exists (
      select 1
      from public.research_reports
      where research_reports.id = research_sources.report_id
        and research_reports.user_id = auth.uid()
    )
  );

drop trigger if exists set_research_reports_updated_at on public.research_reports;
create trigger set_research_reports_updated_at
  before update on public.research_reports
  for each row execute function public.set_updated_at();
