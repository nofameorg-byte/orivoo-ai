create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null default 'ORIVOO Conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_type text not null default 'note',
  content text not null,
  importance integer not null default 5 check (importance between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  memory_type text not null default 'note',
  content text not null,
  importance integer not null default 5 check (importance between 1 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_knowledge (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_memories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null,
  importance integer not null default 5 check (importance between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  summary text not null,
  message_count integer not null default 0 check (message_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_embeddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_table text not null,
  source_id uuid not null,
  embedding_model text,
  embedding jsonb,
  content_hash text,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_id_updated_at_idx
  on public.conversations(user_id, updated_at desc);
create index if not exists conversations_workspace_id_idx
  on public.conversations(workspace_id);
create index if not exists conversations_project_id_idx
  on public.conversations(project_id);
create index if not exists messages_conversation_id_created_at_idx
  on public.messages(conversation_id, created_at);
create index if not exists user_memories_user_id_importance_idx
  on public.user_memories(user_id, importance desc);
create index if not exists memory_candidates_user_id_created_at_idx
  on public.memory_candidates(user_id, created_at desc);
create index if not exists workspace_knowledge_workspace_id_idx
  on public.workspace_knowledge(workspace_id);
create index if not exists project_memories_project_id_importance_idx
  on public.project_memories(project_id, importance desc);
create index if not exists conversation_summaries_conversation_id_created_at_idx
  on public.conversation_summaries(conversation_id, created_at desc);
create index if not exists memory_embeddings_source_idx
  on public.memory_embeddings(source_table, source_id);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.user_memories enable row level security;
alter table public.memory_candidates enable row level security;
alter table public.workspace_knowledge enable row level security;
alter table public.project_memories enable row level security;
alter table public.conversation_summaries enable row level security;
alter table public.memory_embeddings enable row level security;

create policy "Users can read their own conversations"
  on public.conversations for select
  using (
    auth.uid() = user_id
    or (project_id is not null and public.current_user_can_read_project(project_id))
  );

create policy "Users can create their own conversations"
  on public.conversations for insert
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or public.current_user_can_edit_project_content(project_id)
    )
  );

create policy "Users can update their own conversations"
  on public.conversations for update
  using (
    auth.uid() = user_id
    or (project_id is not null and public.current_user_can_edit_project_content(project_id))
  )
  with check (
    auth.uid() = user_id
    or (project_id is not null and public.current_user_can_edit_project_content(project_id))
  );

create policy "Users can delete their own conversations"
  on public.conversations for delete
  using (
    auth.uid() = user_id
    or (project_id is not null and public.current_user_can_edit_project_content(project_id))
  );

create policy "Users can read messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.user_id = auth.uid()
          or (
            conversations.project_id is not null
            and public.current_user_can_read_project(conversations.project_id)
          )
        )
    )
  );

create policy "Users can create messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.user_id = auth.uid()
          or (
            conversations.project_id is not null
            and public.current_user_can_edit_project_content(conversations.project_id)
          )
        )
    )
  );

create policy "Users can manage their own memories"
  on public.user_memories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own memory candidates"
  on public.memory_candidates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Workspace owners can read workspace knowledge"
  on public.workspace_knowledge for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.workspaces
      where workspaces.id = workspace_knowledge.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );

create policy "Workspace owners can manage workspace knowledge"
  on public.workspace_knowledge for all
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.workspaces
      where workspaces.id = workspace_knowledge.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.workspaces
      where workspaces.id = workspace_knowledge.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );

create policy "Project members can read project memories"
  on public.project_memories for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can manage project memories"
  on public.project_memories for all
  using (public.current_user_can_edit_project_content(project_id))
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Users can read conversation summaries"
  on public.conversation_summaries for select
  using (
    auth.uid() = user_id
    or (project_id is not null and public.current_user_can_read_project(project_id))
  );

create policy "Users can manage conversation summaries"
  on public.conversation_summaries for all
  using (
    auth.uid() = user_id
    or (project_id is not null and public.current_user_can_edit_project_content(project_id))
  )
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or public.current_user_can_edit_project_content(project_id)
    )
  );

create policy "Users can manage their memory embeddings"
  on public.memory_embeddings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

drop trigger if exists set_user_memories_updated_at on public.user_memories;
create trigger set_user_memories_updated_at
  before update on public.user_memories
  for each row execute function public.set_updated_at();

drop trigger if exists set_workspace_knowledge_updated_at on public.workspace_knowledge;
create trigger set_workspace_knowledge_updated_at
  before update on public.workspace_knowledge
  for each row execute function public.set_updated_at();

drop trigger if exists set_project_memories_updated_at on public.project_memories;
create trigger set_project_memories_updated_at
  before update on public.project_memories
  for each row execute function public.set_updated_at();

drop trigger if exists set_conversation_summaries_updated_at on public.conversation_summaries;
create trigger set_conversation_summaries_updated_at
  before update on public.conversation_summaries
  for each row execute function public.set_updated_at();
