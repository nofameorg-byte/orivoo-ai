import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, MessageSquareText, Users } from "lucide-react";
import {
  customerActivity,
  customers,
  recentTransactions,
  transfers,
} from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Customer Profile",
};

type CustomerProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerProfilePage({
  params,
}: CustomerProfilePageProps) {
  const { id } = await params;
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-sm font-semibold text-electric-blue-bright"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to customers
      </Link>

      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <Users className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Customer profile
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          {customer.name}
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          {customer.type} customer · {customer.history}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-6">
          <article className="bank-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-white">
              Contact information
            </h2>
            <div className="mt-5 space-y-3 text-sm">
              <p className="text-muted">
                Email: <span className="text-white">{customer.email}</span>
              </p>
              <p className="text-muted">
                Phone: <span className="text-white">{customer.phone}</span>
              </p>
              <p className="text-muted">
                Open balance:{" "}
                <span className="font-semibold text-white">{customer.balance}</span>
              </p>
            </div>
          </article>

          <article className="bank-card rounded-[2rem] p-6">
            <div className="flex items-center gap-3 text-electric-blue-bright">
              <MessageSquareText className="size-5" aria-hidden />
              <h2 className="text-xl font-semibold text-white">
                Customer notes
              </h2>
            </div>
            <textarea
              placeholder="Add customer note..."
              className="mt-5 min-h-36 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none placeholder:text-muted"
            />
          </article>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold text-white">Document list</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["W-9 placeholder", "Service agreement", "Proof of address"].map(
                (document) => (
                  <div key={document} className="rounded-2xl bg-black/45 p-4">
                    <FileText className="mb-3 size-5 text-gold" aria-hidden />
                    <p className="font-medium text-white">{document}</p>
                    <p className="mt-1 text-sm text-muted">Review pending</p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold text-white">
                Invoice history
              </h2>
              <div className="mt-5 space-y-3">
                {recentTransactions
                  .filter((transaction) => transaction.name.includes("Invoice"))
                  .map((transaction) => (
                    <div key={transaction.id} className="rounded-2xl bg-black/45 p-4">
                      <p className="font-medium text-white">{transaction.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {transaction.date} · {transaction.amount}
                      </p>
                    </div>
                  ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold text-white">
                Transfer history
              </h2>
              <div className="mt-5 space-y-3">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="rounded-2xl bg-black/45 p-4">
                    <p className="font-medium text-white">
                      {transfer.destination}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {transfer.date} · {transfer.amount} · {transfer.status}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold text-white">
              Activity timeline
            </h2>
            <div className="mt-5 space-y-3">
              {customerActivity.map((activity) => (
                <div key={activity.label} className="rounded-2xl bg-black/45 p-4">
                  <p className="font-medium text-white">{activity.label}</p>
                  <p className="mt-1 text-sm text-muted">
                    {activity.date} · {activity.type}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
