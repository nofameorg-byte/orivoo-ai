create table if not exists public.website_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text not null,
  prompt text not null,
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_pages (
  id uuid primary key default gen_random_uuid(),
  website_project_id uuid not null references public.website_projects(id) on delete cascade,
  page_name text not null,
  page_slug text not null,
  page_content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_project_id, page_slug)
);

create index if not exists website_projects_user_updated_idx
  on public.website_projects (user_id, updated_at desc);

create index if not exists website_projects_project_updated_idx
  on public.website_projects (project_id, updated_at desc);

create index if not exists website_pages_project_slug_idx
  on public.website_pages (website_project_id, page_slug);

alter table public.website_projects enable row level security;
alter table public.website_pages enable row level security;

create policy "Users can read their own website projects"
  on public.website_projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own website projects"
  on public.website_projects for insert
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1
        from public.projects
        where projects.id = website_projects.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can update their own website projects"
  on public.website_projects for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1
        from public.projects
        where projects.id = website_projects.project_id
          and projects.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete their own website projects"
  on public.website_projects for delete
  using (auth.uid() = user_id);

create policy "Users can read pages for their own website projects"
  on public.website_pages for select
  using (
    exists (
      select 1
      from public.website_projects
      where website_projects.id = website_pages.website_project_id
        and website_projects.user_id = auth.uid()
    )
  );

create policy "Users can create pages for their own website projects"
  on public.website_pages for insert
  with check (
    exists (
      select 1
      from public.website_projects
      where website_projects.id = website_pages.website_project_id
        and website_projects.user_id = auth.uid()
    )
  );

create policy "Users can update pages for their own website projects"
  on public.website_pages for update
  using (
    exists (
      select 1
      from public.website_projects
      where website_projects.id = website_pages.website_project_id
        and website_projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.website_projects
      where website_projects.id = website_pages.website_project_id
        and website_projects.user_id = auth.uid()
    )
  );

create policy "Users can delete pages for their own website projects"
  on public.website_pages for delete
  using (
    exists (
      select 1
      from public.website_projects
      where website_projects.id = website_pages.website_project_id
        and website_projects.user_id = auth.uid()
    )
  );

drop trigger if exists set_website_projects_updated_at on public.website_projects;
create trigger set_website_projects_updated_at
  before update on public.website_projects
  for each row execute function public.set_updated_at();

drop trigger if exists set_website_pages_updated_at on public.website_pages;
create trigger set_website_pages_updated_at
  before update on public.website_pages
  for each row execute function public.set_updated_at();
