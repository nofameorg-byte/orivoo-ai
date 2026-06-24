import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal, Users } from "lucide-react";
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

      <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
        <label className="block">
          <span className="sr-only">Search customers</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3">
            <Search className="size-4 text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search customers by name, email, or invoice history"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
            />
          </div>
        </label>
        <select
          aria-label="Customer type filter"
          className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none"
          defaultValue="all"
        >
          <option value="all">All customers</option>
          <option value="business">Business customers</option>
          <option value="consumer">Consumer customers</option>
        </select>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
        </button>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {customers.map((customer) => (
          <Link
            key={customer.email}
            href={`/dashboard/customers/${customer.id}`}
            className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-electric-blue/25 bg-electric-blue/10 text-electric-blue-bright">
              <Users className="size-6" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-white">{customer.name}</h2>
            <p className="mt-1 break-all text-sm text-muted">{customer.email}</p>
            <span className="mt-4 inline-flex rounded-full border border-electric-blue/25 bg-electric-blue/10 px-3 py-1 text-xs text-electric-blue-bright">
              {customer.type} customer
            </span>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/45 p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted">Open balance</span>
                <span className="font-semibold text-white">{customer.balance}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {customer.history}
              </p>
              <span className="mt-4 inline-flex rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                {customer.status}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
