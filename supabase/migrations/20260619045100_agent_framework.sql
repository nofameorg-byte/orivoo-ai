create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  system_prompt text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_memory (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id)
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  user_message text not null,
  conversation_history text not null default '',
  selected_agent_ids uuid[] not null default '{}',
  status text not null default 'queued' check (
    status in ('queued', 'running', 'completed', 'failed')
  ),
  merged_output text,
  result_artifact_id uuid references public.artifacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_run_results (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reasoning text not null,
  output text not null,
  created_at timestamptz not null default now()
);

create index if not exists project_memory_project_id_idx
  on public.project_memory(project_id);
create index if not exists project_memory_user_id_idx
  on public.project_memory(user_id);
create index if not exists agent_runs_project_id_updated_at_idx
  on public.agent_runs(project_id, updated_at desc);
create index if not exists agent_runs_user_id_idx
  on public.agent_runs(user_id);
create index if not exists agent_run_results_agent_run_id_idx
  on public.agent_run_results(agent_run_id);
create index if not exists agent_run_results_project_id_idx
  on public.agent_run_results(project_id);

alter table public.agents enable row level security;
alter table public.project_memory enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_run_results enable row level security;

insert into public.agents (name, description, system_prompt)
values
  (
    'Research Agent',
    'Finds context, frames evidence, and produces source-aware research direction.',
    'You are the ORIVOO Research Agent. Prioritize evidence quality, assumptions, gaps, and cited findings.'
  ),
  (
    'Code Agent',
    'Plans technical implementation, architecture, edge cases, and verification.',
    'You are the ORIVOO Code Agent. Prioritize maintainable architecture, implementation steps, risks, and tests.'
  ),
  (
    'Legal Agent',
    'Drafts legal context, risk notes, compliance questions, and review-ready language.',
    'You are the ORIVOO Legal Agent. Provide careful drafting support, risk framing, and recommend professional review.'
  ),
  (
    'Business Agent',
    'Builds strategy, positioning, operations, pricing, and go-to-market plans.',
    'You are the ORIVOO Business Agent. Prioritize market logic, practical operations, revenue, and execution clarity.'
  ),
  (
    'Civic Agent',
    'Analyzes public programs, policy, civic workflows, and stakeholder impacts.',
    'You are the ORIVOO Civic Agent. Prioritize public context, policy constraints, stakeholders, and civic outcomes.'
  ),
  (
    'Design Agent',
    'Shapes brand, UX, visual systems, information architecture, and design direction.',
    'You are the ORIVOO Design Agent. Prioritize user experience, brand coherence, accessibility, and visual hierarchy.'
  )
on conflict (name) do update
set
  description = excluded.description,
  system_prompt = excluded.system_prompt;

create policy "Authenticated users can read agents"
  on public.agents for select
  to authenticated
  using (true);

create policy "Project members can read project memory"
  on public.project_memory for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can create project memory"
  on public.project_memory for insert
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can update project memory"
  on public.project_memory for update
  using (public.current_user_can_edit_project_content(project_id))
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can delete project memory"
  on public.project_memory for delete
  using (public.current_user_can_edit_project_content(project_id));

create policy "Project members can read agent runs"
  on public.agent_runs for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can create agent runs"
  on public.agent_runs for insert
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can update agent runs"
  on public.agent_runs for update
  using (public.current_user_can_edit_project_content(project_id))
  with check (public.current_user_can_edit_project_content(project_id));

create policy "Editors can delete agent runs"
  on public.agent_runs for delete
  using (public.current_user_can_edit_project_content(project_id));

create policy "Project members can read agent run results"
  on public.agent_run_results for select
  using (public.current_user_can_read_project(project_id));

create policy "Editors can create agent run results"
  on public.agent_run_results for insert
  with check (
    auth.uid() = user_id
    and public.current_user_can_edit_project_content(project_id)
  );

create policy "Editors can delete agent run results"
  on public.agent_run_results for delete
  using (public.current_user_can_edit_project_content(project_id));

drop trigger if exists set_project_memory_updated_at on public.project_memory;
create trigger set_project_memory_updated_at
  before update on public.project_memory
  for each row execute function public.set_updated_at();

drop trigger if exists set_agent_runs_updated_at on public.agent_runs;
create trigger set_agent_runs_updated_at
  before update on public.agent_runs
  for each row execute function public.set_updated_at();
