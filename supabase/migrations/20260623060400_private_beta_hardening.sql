-- VP23 private beta hardening.
-- Adds a safe in-app notification helper for workflow-generated notifications.

create or replace function public.create_notification(
  recipient_uuid uuid,
  actor_uuid uuid,
  notification_title text,
  notification_body text,
  notification_kind text,
  notification_data jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_uuid uuid;
begin
  if auth.uid() is null and auth.role() <> 'service_role' then
    raise exception 'Authentication required to create notifications.';
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    title,
    body,
    notification_type,
    data
  )
  values (
    recipient_uuid,
    actor_uuid,
    notification_title,
    notification_body,
    notification_kind,
    coalesce(notification_data, '{}'::jsonb)
  )
  returning id into notification_uuid;

  return notification_uuid;
end;
$$;

create index if not exists notifications_type_created_idx
  on public.notifications(notification_type, created_at desc);
