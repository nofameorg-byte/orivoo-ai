import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CreditCard, Crown, History, ShieldCheck } from "lucide-react";
import { normalizeSubscriptionTier } from "@/lib/assistant/models";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Billing",
};

const planDetails = {
  free: {
    name: "Free",
    description: "Groq-powered assistant access for individual ORIVOO work.",
    features: ["Groq Llama 3.3 70B", "Personal projects", "Conversation history"],
  },
  pro: {
    name: "Pro",
    description: "Premium model access for builders and researchers.",
    features: ["Groq", "GPT-4.1 placeholder", "Claude Sonnet placeholder"],
  },
  business: {
    name: "Business",
    description: "Team-ready workspaces and all Pro capabilities.",
    features: ["All Pro features", "Team workspaces", "Shared project memory"],
  },
  enterprise: {
    name: "Enterprise",
    description: "Future enterprise models, governance, and advanced support.",
    features: ["Future enterprise models", "Custom workflows", "Priority support"],
  },
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status, square_customer_id")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: subscriptions } = user
    ? await supabase
        .from("subscriptions")
        .select("id, plan_name, status, square_customer_id, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  const subscriptionTier = normalizeSubscriptionTier(
    profile?.subscription_tier,
  );
  const currentPlan = planDetails[subscriptionTier];
  const subscriptionStatus = profile?.subscription_status ?? "inactive";

  return (
    <div className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
            <CreditCard className="size-4" aria-hidden />
            Square Billing
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Manage your ORIVOO subscription.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-muted">
            Square billing is prepared for plan upgrades, cancellations, and
            subscription history. Payment processing is not enabled yet.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Current Plan</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {currentPlan.name}
              </h2>
            </div>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold-bright">
              {subscriptionStatus}
            </span>
          </div>
          <p className="mt-4 leading-7 text-muted">{currentPlan.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {currentPlan.features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <ShieldCheck className="mb-3 size-5 text-gold" aria-hidden />
                <p className="text-sm text-white">{feature}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Square Customer
            </p>
            <p className="mt-2 break-all text-sm text-white">
              {profile?.square_customer_id ?? "Not connected yet"}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <ActionCard
            icon={<Crown className="size-5" aria-hidden />}
            title="Upgrade"
            body="Square checkout will connect here when payment processing is enabled."
            action="Upgrade with Square"
          />
          <ActionCard
            icon={<CreditCard className="size-5" aria-hidden />}
            title="Cancel"
            body="Subscription cancellation is prepared for future Square webhooks and customer portal links."
            action="Cancel subscription"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3">
          <History className="size-5 text-gold" aria-hidden />
          <div>
            <p className="text-sm text-muted">Billing History</p>
            <h2 className="text-2xl font-semibold text-white">
              Subscription events
            </h2>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          {subscriptions && subscriptions.length > 0 ? (
            <div className="divide-y divide-white/10">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="grid gap-3 bg-black/30 p-4 md:grid-cols-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Plan
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {subscription.plan_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Status
                    </p>
                    <p className="mt-1 text-sm text-gold-bright">
                      {subscription.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Created
                    </p>
                    <time
                      dateTime={subscription.created_at}
                      className="mt-1 block text-sm text-white"
                    >
                      {formatDate(subscription.created_at)}
                    </time>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Updated
                    </p>
                    <time
                      dateTime={subscription.updated_at}
                      className="mt-1 block text-sm text-white"
                    >
                      {formatDate(subscription.updated_at)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/30 p-4 text-sm text-muted">
              Billing history will appear here after Square subscription events
              are connected.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ActionCard({
  action,
  body,
  icon,
  title,
}: {
  action: string;
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 leading-6 text-muted">{body}</p>
      <button
        type="button"
        disabled
        className="mt-5 rounded-full border border-white/10 px-4 py-2 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-70"
      >
        {action}
      </button>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
