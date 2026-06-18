create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  model text not null default 'llama-3.3-70b-versatile',
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

create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users can read their own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create their own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

create policy "Users can read messages in their conversations"
  on public.messages for select
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
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
        and conversations.user_id = auth.uid()
    )
  );

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists touch_conversation_on_message_created on public.messages;
create trigger touch_conversation_on_message_created
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();
