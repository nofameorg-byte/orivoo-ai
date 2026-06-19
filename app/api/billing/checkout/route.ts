import { NextResponse, type NextRequest } from "next/server";
import {
  createSquareCustomer,
  createSquareSubscriptionCheckout,
  getBillableTier,
} from "@/lib/square";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function getAction(value: unknown) {
  return value === "upgrade" || value === "downgrade" ? value : "subscribe";
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
      tier?: string;
      action?: string;
    };
    const tier = getBillableTier(body.tier ?? "");
    const action = getAction(body.action);
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("display_name, square_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    const squareCustomerId =
      profile?.square_customer_id ??
      (await createSquareCustomer({
        email: user.email,
        displayName:
          profile?.display_name ??
          (typeof user.user_metadata.display_name === "string"
            ? user.user_metadata.display_name
            : null),
        userId: user.id,
      }));

    const { error: updateProfileError } = await admin
      .from("profiles")
      .update({
        square_customer_id: squareCustomerId,
        subscription_status: "pending",
        subscription_tier: tier,
      })
      .eq("id", user.id);

    if (updateProfileError) {
      throw new Error(updateProfileError.message);
    }

    const checkout = await createSquareSubscriptionCheckout({
      tier,
      customerId: squareCustomerId,
      email: user.email,
      userId: user.id,
      action,
    });
    const { error: subscriptionError } = await admin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        square_customer_id: squareCustomerId,
        square_checkout_id: checkout.id,
        tier,
        status: "pending",
        metadata: {
          action,
          order_id: checkout.orderId,
        },
      });

    if (subscriptionError) {
      throw new Error(subscriptionError.message);
    }

    return NextResponse.json({
      checkout_url: checkout.url,
      payment_link_id: checkout.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Square checkout.",
      },
      { status: 400 },
    );
  }
}
