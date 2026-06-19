create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  studio text not null default 'assistant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, conversation_id)
);

create index if not exists projects_user_id_updated_at_idx
  on public.projects (user_id, updated_at desc);

create index if not exists project_conversations_project_id_created_at_idx
  on public.project_conversations (project_id, created_at desc);

create index if not exists project_conversations_conversation_id_idx
  on public.project_conversations (conversation_id);

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.project_conversations enable row level security;

create policy "Users can read their own projects"
  on public.projects
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects
  for delete
  using (auth.uid() = user_id);

create policy "Users can read links for their own projects"
  on public.project_conversations
  for select
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_conversations.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can link conversations to their own projects"
  on public.project_conversations
  for insert
  with check (
    exists (
      select 1
      from public.projects
      where projects.id = project_conversations.project_id
        and projects.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.conversations
      where conversations.id = project_conversations.conversation_id
        and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete links for their own projects"
  on public.project_conversations
  for delete
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_conversations.project_id
        and projects.user_id = auth.uid()
    )
  );
