import type { Metadata } from "next";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { paymentRails } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Payments",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Payments
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          ACH, wires, and real-time payments.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Payment rails are presented like a bank product suite. Sandbox ACH can
          be simulated; wires and RTP remain gated by sponsor-bank support,
          compliance controls, and Column production approval.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {paymentRails.map((rail) => (
          <article key={rail.name} className="bank-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-electric-blue/25 bg-electric-blue/10 text-electric-blue-bright">
                <rail.icon className="size-6" aria-hidden />
              </div>
              <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                {rail.status}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-white">{rail.name}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 rounded-2xl bg-black/45 p-3">
                <span className="text-muted">Speed</span>
                <span className="text-right text-white">{rail.speed}</span>
              </div>
              <div className="flex justify-between gap-4 rounded-2xl bg-black/45 p-3">
                <span className="text-muted">Limit</span>
                <span className="text-right text-white">{rail.limit}</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-gold/40"
            >
              Configure rail
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-metal-red/25 bg-metal-red/10 p-6">
        <div className="flex items-center gap-3 text-metal-red-bright">
          <ShieldAlert className="size-5" aria-hidden />
          <h2 className="font-semibold">Production rail gates</h2>
        </div>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
          <li>TODO: Complete KYB/KYC before increasing ACH limits.</li>
          <li>TODO: Add wire approvals, callbacks, dual control, and audit trails.</li>
          <li>TODO: Confirm sponsor-bank RTP eligibility and operating rules.</li>
          <li>TODO: Store Column transfer IDs and webhook states in RLS tables.</li>
        </ul>
      </section>
    </div>
  );
}
