create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model text not null,
  provider text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  estimated_cost numeric(12, 6) not null default 0 check (estimated_cost >= 0),
  created_at timestamptz not null default now()
);

create index if not exists usage_logs_user_id_created_at_idx
  on public.usage_logs(user_id, created_at desc);
create index if not exists usage_logs_model_idx
  on public.usage_logs(model);
create index if not exists usage_logs_provider_idx
  on public.usage_logs(provider);

alter table public.usage_logs enable row level security;

create policy "Users can read their own usage logs"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their own usage logs"
  on public.usage_logs for insert
  with check (auth.uid() = user_id);
