import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { ledgerEntries } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Ledger",
};

export default function LedgerPage() {
  const csv = [
    ["id", "date", "customer", "description", "type", "status", "amount"],
    ...ledgerEntries.map((entry) => [
      entry.id,
      entry.date,
      entry.customer,
      entry.description,
      entry.type,
      entry.status,
      entry.amount,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Transaction ledger
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Search, filter, date-range, and export transaction records.
        </h1>
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3">
          <Search className="size-4 text-muted" aria-hidden />
          <input
            type="search"
            placeholder="Search ledger by customer, id, or description"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
          />
        </label>
        <input
          type="date"
          aria-label="Start date"
          className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="date"
          aria-label="End date"
          className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
          </button>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="vp23-ledger.csv"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black"
          >
            <Download className="size-4" aria-hidden />
            Export CSV
          </a>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
        <div className="hidden grid-cols-[0.8fr_1fr_1.2fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-muted md:grid">
          <span>Date</span>
          <span>Customer</span>
          <span>Description</span>
          <span>Type</span>
          <span>Status</span>
          <span className="text-right">Amount</span>
        </div>
        {ledgerEntries.map((entry) => (
          <Link
            key={entry.id}
            href={`/dashboard/ledger/${entry.id}`}
            className="grid gap-3 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[0.8fr_1fr_1.2fr_0.7fr_0.7fr_0.7fr] md:px-6"
          >
            <span className="text-sm text-muted">{entry.date}</span>
            <span className="font-medium text-white">{entry.customer}</span>
            <span className="text-muted">{entry.description}</span>
            <span className="text-muted">{entry.type}</span>
            <span className="text-gold-bright">{entry.status}</span>
            <span className="font-semibold text-white md:text-right">
              {entry.amount}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
