import type { Metadata } from "next";
import { adminQueues } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          KYB, compliance, risk, and partner-bank operations.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Bank-like operations require queues, auditability, review states, and
          partner-bank controls. This surface scopes those workflows before live
          money movement.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {adminQueues.map((queue) => (
          <article key={queue.title} className="bank-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-metal-red/25 bg-metal-red/10 text-metal-red-bright">
                <queue.icon className="size-6" aria-hidden />
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted">
                {queue.metric}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-white">{queue.title}</h2>
            <p className="mt-3 leading-7 text-muted">{queue.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-electric-blue/25 bg-electric-blue/10 p-6">
        <h2 className="text-lg font-semibold text-electric-blue-bright">
          Sponsor-bank path
        </h2>
        <p className="mt-3 leading-7 text-muted">
          TODO: Select and contract a sponsor bank or BaaS program, confirm
          permitted customer types, define payment rail limits, receive
          compliance approval, and configure partner-bank settings before
          enabling production Column movement.
        </p>
      </section>
    </div>
  );
}
