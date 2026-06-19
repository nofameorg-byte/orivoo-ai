alter table public.profiles
  add column if not exists language text not null default 'en',
  add column if not exists theme text not null default 'dark',
  add column if not exists is_super_admin boolean not null default false;

create table if not exists public.user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_key text not null,
  memory_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, memory_key)
);

create table if not exists public.project_memories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  memory_key text not null,
  memory_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, memory_key)
);

create table if not exists public.assistant_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  tone text not null default 'professional',
  language text not null default 'en',
  industry text,
  custom_instructions text,
  memory_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  notification_type text not null default 'system',
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  in_app_enabled boolean not null default true,
  research_completion boolean not null default true,
  website_generation boolean not null default true,
  code_generation boolean not null default true,
  document_processing boolean not null default true,
  admin_announcements boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_memories_user_idx
  on public.user_memories (user_id, updated_at desc);

create index if not exists project_memories_project_idx
  on public.project_memories (project_id, updated_at desc);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.user_memories enable row level security;
alter table public.project_memories enable row level security;
alter table public.assistant_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

create or replace function public.is_super_admin()
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
      and profiles.is_super_admin = true
  );
$$;

create policy "Users can manage their own memories"
  on public.user_memories for all
  using (auth.uid() = user_id or public.is_super_admin())
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Users can manage memories for their own projects"
  on public.project_memories for all
  using (
    public.is_super_admin()
    or exists (
      select 1
      from public.projects
      where projects.id = project_memories.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1
      from public.projects
      where projects.id = project_memories.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can manage their own assistant preferences"
  on public.assistant_preferences for all
  using (auth.uid() = user_id or public.is_super_admin())
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Users can read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id or user_id is null or public.is_super_admin());

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id or public.is_super_admin())
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Super admins can create notifications"
  on public.notifications for insert
  with check (public.is_super_admin() or auth.uid() = user_id);

create policy "Users can manage their own notification preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id or public.is_super_admin())
  with check (auth.uid() = user_id or public.is_super_admin());

create policy "Super admins can read all profiles"
  on public.profiles for select
  using (auth.uid() = id or public.is_super_admin());

create policy "Super admins can read all projects"
  on public.projects for select
  using (public.is_super_admin());

create policy "Super admins can read all conversations"
  on public.conversations for select
  using (public.is_super_admin());

create policy "Super admins can read all messages"
  on public.messages for select
  using (public.is_super_admin());

create policy "Super admins can read all documents"
  on public.documents for select
  using (public.is_super_admin());

create policy "Super admins can read all document chunks"
  on public.document_chunks for select
  using (public.is_super_admin());

create policy "Super admins can read all research reports"
  on public.research_reports for select
  using (public.is_super_admin());

create policy "Super admins can read all research sources"
  on public.research_sources for select
  using (public.is_super_admin());

create policy "Super admins can read all website projects"
  on public.website_projects for select
  using (public.is_super_admin());

create policy "Super admins can read all website pages"
  on public.website_pages for select
  using (public.is_super_admin());

create policy "Super admins can read all code projects"
  on public.code_projects for select
  using (public.is_super_admin());

create policy "Super admins can read all code files"
  on public.code_files for select
  using (public.is_super_admin());

drop trigger if exists set_user_memories_updated_at on public.user_memories;
create trigger set_user_memories_updated_at
  before update on public.user_memories
  for each row execute function public.set_updated_at();

drop trigger if exists set_project_memories_updated_at on public.project_memories;
create trigger set_project_memories_updated_at
  before update on public.project_memories
  for each row execute function public.set_updated_at();

drop trigger if exists set_assistant_preferences_updated_at on public.assistant_preferences;
create trigger set_assistant_preferences_updated_at
  before update on public.assistant_preferences
  for each row execute function public.set_updated_at();

drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, language, is_super_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'language', 'en'),
    lower(new.email) = 'nofameorg@gmail.com'
  )
  on conflict (id) do update
  set is_super_admin = public.profiles.is_super_admin
    or lower(new.email) = 'nofameorg@gmail.com';

  insert into public.workspaces (owner_id)
  values (new.id)
  on conflict do nothing;

  insert into public.assistant_preferences (user_id, language)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'language', 'en'))
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

update public.profiles
set is_super_admin = true
where id in (
  select id
  from auth.users
  where lower(email) = 'nofameorg@gmail.com'
);

insert into public.assistant_preferences (user_id, language)
select id, 'en'
from auth.users
on conflict (user_id) do nothing;

insert into public.notification_preferences (user_id)
select id
from auth.users
on conflict (user_id) do nothing;
