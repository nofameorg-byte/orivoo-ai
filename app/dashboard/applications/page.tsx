import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, ListChecks } from "lucide-react";
import { accountApplications, applicationStatuses } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Applications",
};

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <ListChecks className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Account applications
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Business checking and savings application tracking.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Track draft, submitted, under review, approved, and rejected
          applications while partner-bank approval remains pending.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {accountApplications.map((application) => (
          <article
            key={application.product}
            className="bank-card rounded-[2rem] p-6"
          >
            <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
              {application.status}
            </span>
            <h2 className="mt-5 text-xl font-semibold text-white">
              {application.product}
            </h2>
            <p className="mt-3 leading-7 text-muted">{application.detail}</p>
            <p className="mt-5 text-sm text-muted">
              Updated {application.updated} · {application.owner}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">Status lifecycle</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {applicationStatuses.map((status, index) => (
            <article key={status} className="rounded-3xl bg-black/45 p-4">
              {index < 2 ? (
                <CheckCircle2 className="mb-4 size-5 text-electric-blue-bright" />
              ) : (
                <CircleDashed className="mb-4 size-5 text-muted" />
              )}
              <p className="font-semibold text-white">{status}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
