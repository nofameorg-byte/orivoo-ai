"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/core/auth";
import { getSiteUrl } from "@/lib/env";
import { getStripePriceEnv, type PlanId } from "@/lib/billing/plans";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return null;
  }

  return new Stripe(key, {
    apiVersion: "2025-11-17.clover",
  });
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function startCheckout(formData: FormData) {
  const plan = (formString(formData, "plan") || "pro") as PlanId;
  const { supabase, user } = await getAuthenticatedUser();

  if (plan === "free") {
    await supabase.from("subscriptions").upsert(
      {
        plan: "free",
        status: "active",
        user_id: user.id,
      },
      { onConflict: "user_id" },
    );
    redirect("/dashboard/billing?message=Free plan activated.");
  }

  const stripe = getStripe();
  const price = getStripePriceEnv(plan);

  if (!stripe || !price) {
    redirect("/dashboard/billing?message=Stripe is not configured for this plan.");
  }

  const checkout = await stripe.checkout.sessions.create({
    cancel_url: `${getSiteUrl()}/dashboard/billing?message=Checkout canceled.`,
    customer_email: user.email ?? undefined,
    line_items: [{ price, quantity: 1 }],
    metadata: {
      plan,
      userId: user.id,
    },
    mode: "subscription",
    success_url: `${getSiteUrl()}/dashboard/billing?message=Checkout complete.`,
  });

  if (!checkout.url) {
    redirect("/dashboard/billing?message=Could not start checkout.");
  }

  redirect(checkout.url);
}

export async function openBillingPortal() {
  const { supabase, user } = await getAuthenticatedUser();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const stripe = getStripe();

  if (!stripe || !subscription?.stripe_customer_id) {
    redirect("/dashboard/billing?message=No Stripe customer is connected.");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${getSiteUrl()}/dashboard/billing`,
  });

  redirect(portal.url);
}

export async function cancelSubscription() {
  const { supabase, user } = await getAuthenticatedUser();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const stripe = getStripe();

  if (stripe && subscription?.stripe_subscription_id) {
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
  }

  await supabase
    .from("subscriptions")
    .update({ plan: "free", status: "canceled" })
    .eq("user_id", user.id);

  redirect("/dashboard/billing?message=Subscription canceled.");
}
