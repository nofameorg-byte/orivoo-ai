import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { recentTransactions } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Transactions",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Ledger
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Transactions
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Sandbox transaction activity for MVP review. Production activity must
          include webhook verification, immutable audit trails, and daily
          reconciliation.
        </p>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
        <div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr] border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-muted md:grid">
          <span>Description</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-white/10">
          {recentTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr] md:items-center md:px-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/45">
                  <transaction.icon
                    className={`size-5 ${transaction.tone}`}
                    aria-hidden
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{transaction.name}</h2>
                  <p className="text-sm text-muted">{transaction.id}</p>
                </div>
              </div>
              <p className="text-sm text-muted">{transaction.date}, 2026</p>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-electric-blue/25 bg-electric-blue/10 px-3 py-1 text-xs text-electric-blue-bright">
                <ReceiptText className="size-3.5" aria-hidden />
                Posted
              </span>
              <p className={`font-semibold md:text-right ${transaction.tone}`}>
                {transaction.amount}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
