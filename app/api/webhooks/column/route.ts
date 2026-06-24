import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

function safeWebhookResponse(received: boolean, status = 200) {
  return NextResponse.json({ received }, { status });
}

function timingSafeEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return crypto.subtle
    .digest("SHA-256", leftBytes)
    .then(() => {
      let diff = 0;
      for (let index = 0; index < leftBytes.length; index += 1) {
        diff |= leftBytes[index] ^ rightBytes[index];
      }
      return diff === 0;
    })
    .catch(() => false);
}

export async function POST(request: Request) {
  const configuredSecret = process.env.COLUMN_WEBHOOK_SECRET;
  const providedSecret =
    request.headers.get("column-webhook-secret") ??
    request.headers.get("x-column-webhook-secret") ??
    "";

  if (configuredSecret) {
    const verified = await timingSafeEqual(providedSecret, configuredSecret);

    if (!verified) {
      return safeWebhookResponse(false, 401);
    }
  }

  let event: unknown = null;

  try {
    event = await request.json();
  } catch {
    return safeWebhookResponse(false, 400);
  }

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServiceRoleClient();
      await supabase.from("audit_logs").insert({
        event_type: "admin_review_action",
        entity_type: "column_webhook",
        metadata: {
          received: true,
          // Store only a placeholder marker until signed webhook payload
          // schemas and retention policies are finalized.
          payloadType:
            typeof event === "object" && event !== null
              ? "object"
              : typeof event,
        },
      });
    } else {
      console.info("Column webhook received; service role logging not configured.");
    }
  } catch {
    // Do not leak database or provider details to webhook callers.
    console.warn("Column webhook placeholder logging failed.");
  }

  // Real money movement is intentionally not processed here.
  return safeWebhookResponse(true);
}
