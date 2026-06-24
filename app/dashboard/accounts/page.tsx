import type { Metadata } from "next";
import { Landmark, RadioTower } from "lucide-react";
import { accounts } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Accounts",
};

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-electric-blue-bright">
          <RadioTower className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Account applications
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Accounts
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Account records are prepared for secure backend banking integrations.
          API keys are never exposed to this client page.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {accounts.map((account) => (
          <article key={account.account} className="metal-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <Landmark className="size-6" aria-hidden />
              </div>
              <span className="rounded-full border border-electric-blue/30 bg-electric-blue/10 px-3 py-1 text-xs text-electric-blue-bright">
                {account.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">{account.name}</h2>
            <p className="mt-1 text-sm text-muted">{account.type}</p>
            <p className="mt-6 text-3xl font-semibold text-white">
              {account.balance}
            </p>
            <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/45 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted">Routing</span>
                <span className="font-mono text-white">{account.routing}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Account</span>
                <span className="font-mono text-white">{account.account}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
