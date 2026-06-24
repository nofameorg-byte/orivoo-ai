import type { Metadata } from "next";
import { Users } from "lucide-react";
import { customers } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Receivables
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Customers
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Manage customer identity and invoice balances. Customer rows are
          modeled in Supabase with owner-scoped RLS policies.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {customers.map((customer) => (
          <article
            key={customer.email}
            className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-electric-blue/25 bg-electric-blue/10 text-electric-blue-bright">
              <Users className="size-6" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-white">{customer.name}</h2>
            <p className="mt-1 break-all text-sm text-muted">{customer.email}</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/45 p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted">Open balance</span>
                <span className="font-semibold text-white">{customer.balance}</span>
              </div>
              <span className="mt-4 inline-flex rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                {customer.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
