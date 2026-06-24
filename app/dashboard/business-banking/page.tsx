import type { Metadata } from "next";
import { bankingProducts, accounts } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Business Banking",
};

export default function BusinessBankingPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Business banking
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          JPMorgan-grade structure with Cash App speed.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          The application separates banking-product readiness from generic account cards:
          checking preparation, savings as a sponsor-bank future, and account details
          tied to partner-readiness identifiers.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {bankingProducts.map((product) => (
          <article key={product.title} className="bank-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
                <product.icon className="size-6" aria-hidden />
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted">
                {product.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">{product.title}</h2>
            <p className="mt-3 leading-7 text-muted">{product.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted">
              Checking accounts
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Account details and rail eligibility
            </h2>
          </div>
          <span className="rounded-full border border-electric-blue/30 bg-electric-blue/10 px-3 py-1 text-xs text-electric-blue-bright">
            Integration mapping pending
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {accounts.map((account) => (
            <article key={account.account} className="rounded-3xl bg-black/45 p-5">
              <h3 className="font-semibold text-white">{account.name}</h3>
              <p className="mt-1 text-sm text-muted">{account.type}</p>
              <p className="mt-5 text-2xl font-semibold text-white">
                {account.balance}
              </p>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Routing</span>
                  <span className="font-mono text-white">{account.routing}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Account</span>
                  <span className="font-mono text-white">{account.account}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Rails</span>
                  <span className="text-right text-gold-bright">{account.rail}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
