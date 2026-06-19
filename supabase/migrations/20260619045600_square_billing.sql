alter table public.profiles
  add column if not exists subscription_tier text not null default 'free',
  add column if not exists subscription_status text not null default 'inactive',
  add column if not exists square_customer_id text;

alter table public.profiles
  drop constraint if exists profiles_subscription_tier_check;

alter table public.profiles
  add constraint profiles_subscription_tier_check
  check (subscription_tier in ('free', 'pro', 'business', 'enterprise'));

alter table public.profiles
  drop constraint if exists profiles_subscription_status_check;

alter table public.profiles
  add constraint profiles_subscription_status_check
  check (
    subscription_status in (
      'inactive',
      'pending',
      'active',
      'canceled',
      'paused',
      'past_due',
      'failed'
    )
  );

create unique index if not exists profiles_square_customer_id_idx
  on public.profiles(square_customer_id)
  where square_customer_id is not null;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  square_customer_id text,
  square_subscription_id text unique,
  square_checkout_id text,
  tier text not null default 'free' check (
    tier in ('free', 'pro', 'business', 'enterprise')
  ),
  status text not null default 'pending' check (
    status in (
      'pending',
      'active',
      'canceled',
      'paused',
      'past_due',
      'failed'
    )
  ),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);
create index if not exists subscriptions_square_customer_id_idx
  on public.subscriptions(square_customer_id);
create index if not exists subscriptions_status_idx
  on public.subscriptions(status);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  square_event_id text not null unique,
  event_type text not null,
  square_object_id text,
  processed_at timestamptz not null default now(),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists billing_events_event_type_idx
  on public.billing_events(event_type);
create index if not exists billing_events_square_object_id_idx
  on public.billing_events(square_object_id);

alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

create policy "Users can read their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Billing events are service role only"
  on public.billing_events for all
  using (false)
  with check (false);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

update public.profiles
set
  subscription_tier = coalesce(subscription_tier, 'free'),
  subscription_status = coalesce(subscription_status, 'inactive')
where subscription_tier = 'free'
  and subscription_status = 'inactive';
