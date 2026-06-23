import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type NotificationInput = {
  recipientId?: string | null;
  actorId?: string | null;
  title: string;
  body: string;
  type: string;
  data?: Record<string, string | number | boolean | null>;
};

export async function createWorkflowNotification(
  supabase: SupabaseServerClient,
  input: NotificationInput,
) {
  if (!input.recipientId) {
    return;
  }

  await supabase.rpc("create_notification", {
    recipient_uuid: input.recipientId,
    actor_uuid: input.actorId ?? null,
    notification_title: input.title,
    notification_body: input.body,
    notification_kind: input.type,
    notification_data: input.data ?? {},
  });
}
