import Link from "next/link";
import { CircleDollarSign, Copy, RadioTower, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  accounts,
  balanceMetrics,
  bankingProducts,
  quickActions,
  recentTransactions,
  securityHighlights,
} from "@/lib/vp23/data";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : user?.email?.split("@")[0] ?? "Operator");

  return (
    <div className="space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-electric-blue/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-metal-red/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-electric-blue/25 bg-electric-blue/10 px-4 py-2 text-sm text-electric-blue-bright">
              <RadioTower className="size-4" aria-hidden />
              Sandbox mode active
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome back, {displayName}. Your money command deck is armed.
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-muted">
              TODO: Complete production KYB/KYC, risk controls, and compliance
              approvals before enabling live funds movement.
            </p>
          </div>
          <div className="metal-card rounded-[1.5rem] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              Total balance
            </p>
            <p className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
              $179,070.90
            </p>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/45 p-4">
              <span className="text-sm text-muted">Column sandbox ledger</span>
              <span className="text-sm font-semibold text-gold-bright">
                +18.4%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {balanceMetrics.map((metric) => (
          <article key={metric.label} className="bank-card rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {metric.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/10"
          >
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <action.icon className="size-5" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-white">{action.label}</h2>
            <p className="mt-2 text-sm text-muted">
              Launch {action.label.toLowerCase()} workflow
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">
              Business Banking
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Checking, savings future, and account details
            </h2>
          </div>
          <Link
            href="/dashboard/business-banking"
            className="text-sm font-semibold text-electric-blue-bright"
          >
            Manage banking
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {bankingProducts.map((product) => (
            <article key={product.title} className="rounded-3xl bg-black/45 p-5">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
                <product.icon className="size-5" aria-hidden />
              </div>
              <h3 className="font-semibold text-white">{product.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{product.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gold">
                Account card
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {accounts[0].name}
              </h2>
            </div>
            <CircleDollarSign className="size-8 text-gold-bright" aria-hidden />
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/55 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Routing number
                </p>
                <p className="mt-2 font-mono text-xl text-white">
                  {accounts[0].routing}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Account number
                </p>
                <p className="mt-2 font-mono text-xl text-white">
                  {accounts[0].account}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-electric-blue/40 hover:text-white"
            >
              <Copy className="size-4" aria-hidden />
              Copy sandbox details
            </button>
          </div>
        </article>

        <article className="surface-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gold">
                Recent transactions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Latest movement
              </h2>
            </div>
            <Link
              href="/dashboard/transactions"
              className="text-sm font-semibold text-electric-blue-bright"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/45 p-4"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <transaction.icon
                    className={`size-5 ${transaction.tone}`}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {transaction.name}
                  </p>
                  <p className="text-sm text-muted">{transaction.date}</p>
                </div>
                <p className={`font-semibold ${transaction.tone}`}>
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 lg:grid-cols-4">
        {securityHighlights.map((item) => (
          <div key={item} className="rounded-3xl bg-black/40 p-5">
            <ShieldCheck className="mb-5 size-6 text-electric-blue-bright" aria-hidden />
            <p className="leading-6 text-muted">{item}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
