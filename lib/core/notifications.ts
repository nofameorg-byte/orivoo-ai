import type { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export async function createNotification({
  body,
  metadata = {},
  title,
  type,
  userId,
}: {
  body: string;
  metadata?: Json;
  title: string;
  type: string;
  userId: string | null;
}) {
  const supabase = await createClient();

  await supabase.from("notifications").insert({
    body,
    metadata,
    notification_type: type,
    title,
    user_id: userId,
  });
}

export async function getRecentNotifications(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("id,title,body,notification_type,is_read,created_at")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}
