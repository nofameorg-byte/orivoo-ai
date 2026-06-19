alter table public.profiles
  add column if not exists subscription_tier text not null default 'free',
  add column if not exists selected_model text not null default 'groq-llama-3.3-70b';

alter table public.profiles
  drop constraint if exists profiles_subscription_tier_check;

alter table public.profiles
  add constraint profiles_subscription_tier_check
  check (subscription_tier in ('free', 'pro', 'enterprise'));

alter table public.profiles
  drop constraint if exists profiles_selected_model_check;

alter table public.profiles
  add constraint profiles_selected_model_check
  check (length(trim(selected_model)) > 0);
