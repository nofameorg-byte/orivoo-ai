import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { ledgerEntries } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Ledger Detail",
};

type LedgerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LedgerDetailPage({
  params,
}: LedgerDetailPageProps) {
  const { id } = await params;
  const entry = ledgerEntries.find((item) => item.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/ledger"
        className="inline-flex items-center gap-2 text-sm font-semibold text-electric-blue-bright"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to ledger
      </Link>

      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <ReceiptText className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Transaction details
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white">{entry.id}</h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Detailed ledger record for internal reconciliation and audit review.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Date", entry.date],
          ["Customer", entry.customer],
          ["Description", entry.description],
          ["Type", entry.type],
          ["Status", entry.status],
          ["Amount", entry.amount],
        ].map(([label, value]) => (
          <article key={label} className="bank-card rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              {label}
            </p>
            <p className="mt-3 text-xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
