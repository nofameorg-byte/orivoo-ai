import { NextResponse, type NextRequest } from "next/server";
import type { Json } from "@/lib/database.types";
import { getSiteUrl } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeSquareStatus,
  retrieveSquareSubscription,
  tierFromPlanVariationId,
  verifySquareWebhookSignature,
  type SquareSubscriptionPayload,
} from "@/lib/square";

type SquareWebhookEvent = {
  event_id?: string;
  type?: string;
  created_at?: string;
  data?: {
    id?: string;
    object?: {
      subscription?: SquareSubscriptionPayload;
      payment?: {
        id?: string;
        customer_id?: string;
        status?: string;
      };
    };
  };
};

function getNotificationUrl(request: NextRequest) {
  return (
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ??
    `${getSiteUrl()}${request.nextUrl.pathname}`
  );
}

function getSquareObjectId(event: SquareWebhookEvent) {
  return (
    event.data?.object?.subscription?.id ??
    event.data?.object?.payment?.id ??
    event.data?.id ??
    null
  );
}

async function findUserIdByCustomer(customerId: string) {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("square_customer_id", customerId)
    .maybeSingle();

  return profile?.id ?? null;
}

async function syncSubscription(subscription: SquareSubscriptionPayload) {
  if (!subscription.id || !subscription.customer_id) {
    return;
  }

  const userId = await findUserIdByCustomer(subscription.customer_id);

  if (!userId) {
    return;
  }

  const supabase = createAdminClient();
  const status = normalizeSquareStatus(subscription.status);
  const tier = tierFromPlanVariationId(subscription.plan_variation_id);
  const profileStatus = status === "active" ? "active" : status;
  const profileTier = status === "active" ? tier : "free";

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      square_customer_id: subscription.customer_id,
      square_subscription_id: subscription.id,
      tier,
      status,
      current_period_start: subscription.start_date ?? null,
      current_period_end: subscription.charged_through_date ?? null,
      cancel_at_period_end: Boolean(subscription.canceled_date),
      metadata: {
        square_status: subscription.status,
        plan_variation_id: subscription.plan_variation_id,
        version: subscription.version,
        canceled_date: subscription.canceled_date,
      },
    },
    { onConflict: "square_subscription_id" },
  );

  await supabase
    .from("profiles")
    .update({
      subscription_tier: profileTier,
      subscription_status: profileStatus,
      square_customer_id: subscription.customer_id,
    })
    .eq("id", userId);
}

async function handleEvent(event: SquareWebhookEvent) {
  const eventType = event.type ?? "";

  if (
    eventType === "subscription.created" ||
    eventType === "subscription.updated" ||
    eventType === "subscription.canceled"
  ) {
    const subscription =
      event.data?.object?.subscription ??
      (event.data?.id
        ? (await retrieveSquareSubscription(event.data.id)).subscription
        : null);

    if (subscription) {
      await syncSubscription(subscription);
    }
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");
  const notificationUrl = getNotificationUrl(request);

  if (
    !verifySquareWebhookSignature({
      rawBody,
      signature,
      notificationUrl,
    })
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const event = JSON.parse(rawBody) as SquareWebhookEvent;
  const eventId =
    event.event_id ??
    `${event.type ?? "unknown"}:${getSquareObjectId(event) ?? "unknown"}:${
      event.created_at ?? Date.now()
    }`;
  const supabase = createAdminClient();
  const { error: eventError } = await supabase.from("billing_events").insert({
    square_event_id: eventId,
    event_type: event.type ?? "unknown",
    square_object_id: getSquareObjectId(event),
    payload: event as Json,
  });

  if (eventError) {
    if (eventError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  await handleEvent(event);

  return NextResponse.json({ received: true });
}
