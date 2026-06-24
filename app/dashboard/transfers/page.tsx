import type { Metadata } from "next";
import { ArrowLeftRight, RadioTower } from "lucide-react";
import { transfers } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Transfers",
};

export default function TransfersPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-electric-blue-bright">
          <RadioTower className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Transfer preparation
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Transfers
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          The transfer form uses HTML validation for the MVP. Backend route
          handlers also validate inputs before calling placeholder partner
          preparation functions. No live banking rails are connected.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <ArrowLeftRight className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Prepare transfer
              </h2>
              <p className="text-sm text-muted">No live funds are moved.</p>
            </div>
          </div>
          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-white">From account</span>
              <select
                required
                name="fromAccount"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-electric-blue/60"
                defaultValue=""
              >
                <option value="" disabled>
                  Select account
                </option>
                <option value="operating">VP23 Operating</option>
                <option value="reserve">VP23 Tax Reserve</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Destination</span>
              <input
                required
                name="destination"
                minLength={2}
                maxLength={100}
                placeholder="Contractor payout"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-electric-blue/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Amount</span>
              <input
                required
                name="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="2500.00"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-electric-blue/60"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
            >
              Prepare transfer
            </button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Recent transfers</h2>
          <div className="mt-5 space-y-3">
            {transfers.map((transfer) => (
              <article
                key={transfer.id}
                className="rounded-2xl border border-white/10 bg-black/45 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">
                      {transfer.destination}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {transfer.id} • {transfer.date}
                    </p>
                  </div>
                  <p className="font-semibold text-white">{transfer.amount}</p>
                </div>
                <span className="mt-4 inline-flex rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                  {transfer.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
