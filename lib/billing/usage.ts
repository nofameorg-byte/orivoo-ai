import { createClient } from "@/lib/supabase/server";

export type UsageMetric =
  | "ai_messages"
  | "documents_uploaded"
  | "reports_generated"
  | "websites_generated"
  | "code_projects_generated"
  | "storage_used";

export function getUsageMonth(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function incrementUsage({
  amount = 1,
  metric,
  userId,
}: {
  amount?: number;
  metric: UsageMetric;
  userId: string;
}) {
  const supabase = await createClient();
  const month = getUsageMonth();
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  if (!usage) {
    await supabase.from("usage_tracking").insert({
      [metric]: amount,
      month,
      user_id: userId,
    });
    return;
  }

  await supabase
    .from("usage_tracking")
    .update({
      [metric]: Number(usage[metric] ?? 0) + amount,
    })
    .eq("id", usage.id);
}
