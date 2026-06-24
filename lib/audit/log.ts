import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AuditEventType =
  | "user_login"
  | "document_upload"
  | "application_submission"
  | "invoice_creation"
  | "customer_creation"
  | "admin_review_action";

type AuditLogInput = {
  eventType: AuditEventType;
  businessProfileId?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditLogInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: user.id,
    business_profile_id: input.businessProfileId ?? null,
    entity_id: input.entityId ?? null,
    entity_type: input.entityType ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
  });

  return { error: error?.message ?? null };
}
