import { NextResponse, type NextRequest } from "next/server";
import {
  cancelSquareSubscription,
  resumeSquareSubscription,
} from "@/lib/square";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getCurrentSubscription(userId: string, admin = false) {
  const supabase = admin ? createAdminClient() : await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, square_subscription_id, tier, status, current_period_start, current_period_end, cancel_at_period_end, updated_at",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await getCurrentSubscription(user.id);

    return NextResponse.json({
      subscription,
      management: {
        supports_hosted_portal: false,
        message:
          "Square subscriptions are managed through this authenticated ORIVOO endpoint.",
        actions: ["cancel", "reactivate"],
        tier_changes: "Use /api/billing/checkout with action upgrade or downgrade.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load subscription.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: string;
    };
    const admin = createAdminClient();
    const subscription = await getCurrentSubscription(user.id, true);

    if (!subscription?.square_subscription_id) {
      throw new Error("No Square subscription is available to manage.");
    }

    if (body.action === "cancel") {
      await cancelSquareSubscription(subscription.square_subscription_id);
      await admin
        .from("subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: true,
        })
        .eq("id", subscription.id);
      await admin
        .from("profiles")
        .update({
          subscription_status: "canceled",
        })
        .eq("id", user.id);

      return NextResponse.json({ status: "cancel_requested" });
    }

    if (body.action === "reactivate") {
      await resumeSquareSubscription(subscription.square_subscription_id);
      await admin
        .from("subscriptions")
        .update({
          status: "active",
          cancel_at_period_end: false,
        })
        .eq("id", subscription.id);
      await admin
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_tier: subscription.tier,
          plan: subscription.tier,
        })
        .eq("id", user.id);

      return NextResponse.json({ status: "reactivate_requested" });
    }

    throw new Error("Unsupported billing portal action.");
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to manage subscription.",
      },
      { status: 400 },
    );
  }
}
