import { CreditCard, Gauge, Sparkles } from "lucide-react";
import {
  cancelSubscription,
  openBillingPortal,
  startCheckout,
} from "@/app/actions/billing";
import { getAuthenticatedUser } from "@/lib/core/auth";
import { getUsageMonth } from "@/lib/billing/usage";
import { plans, type PlanId } from "@/lib/billing/plans";

type BillingPageProps = {
  searchParams: Promise<{ message?: string }>;
};

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { message } = await searchParams;
  const { supabase, user } = await getAuthenticatedUser();
  const month = getUsageMonth();
  const [{ data: subscription }, { data: usage }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan,status,stripe_customer_id,stripe_subscription_id,created_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle(),
  ]);
  const activePlan = (subscription?.plan ?? "free") as PlanId;

  return (
    <div id="workspace" className="space-y-8">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm text-gold-bright">
          <Sparkles className="size-4" aria-hidden />
          Billing
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Plans, usage, and Stripe billing.
        </h1>
        <p className="mt-4 max-w-3xl text-muted">
          Upgrade plans, manage subscriptions, and monitor ORIVOO usage.
        </p>
      </section>

      {message ? (
        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold-bright">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        {(Object.keys(plans) as PlanId[]).map((planId) => {
          const plan = plans[planId];
          const isActive = planId === activePlan;
          return (
            <div
              key={planId}
              className={`rounded-3xl border p-5 ${
                isActive
                  ? "border-gold/40 bg-gold/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <CreditCard className="mb-5 size-6 text-gold" aria-hidden />
              <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <p className="mt-4 text-2xl font-semibold text-white">
                {plan.price}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <form action={startCheckout} className="mt-5">
                <input type="hidden" name="plan" value={planId} />
                <button
                  disabled={isActive}
                  className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isActive ? "Current plan" : `Upgrade to ${plan.name}`}
                </button>
              </form>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Gauge className="size-6 text-gold" aria-hidden />
            <h2 className="text-2xl font-semibold text-white">
              Usage dashboard
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["AI messages", usage?.ai_messages ?? 0],
              ["Documents", usage?.documents_uploaded ?? 0],
              ["Reports", usage?.reports_generated ?? 0],
              ["Websites", usage?.websites_generated ?? 0],
              ["Code projects", usage?.code_projects_generated ?? 0],
              ["Storage", formatBytes(usage?.storage_used ?? 0)],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold text-white">Manage billing</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Current plan: {plans[activePlan].name}. Status:{" "}
            {subscription?.status ?? "inactive"}.
          </p>
          <form action={openBillingPortal} className="mt-5">
            <button className="w-full rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold-bright">
              Open Stripe portal
            </button>
          </form>
          <form action={cancelSubscription} className="mt-3">
            <button className="w-full rounded-full border border-red-400/25 px-5 py-3 text-sm text-red-100 hover:bg-red-500/10">
              Cancel subscription
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
