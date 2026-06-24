import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { settingsCards } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Security, partner integration, and environment controls.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Manage secure workspace settings, partner-readiness controls, and
          account policies.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {settingsCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-electric-blue/25 bg-electric-blue/10 text-electric-blue-bright">
              <card.icon className="size-6" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 leading-7 text-muted">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-electric-blue/25 bg-electric-blue/10 p-6">
        <h2 className="text-xl font-semibold text-white">Legal and account</h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Review policies, company information, contact details, and account
          management controls.
        </p>
        <Link
          href="/dashboard/settings/legal"
          className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
        >
          Open legal settings
        </Link>
      </section>

      <section className="rounded-[2rem] border border-gold/20 bg-gold/10 p-6">
        <div className="flex items-center gap-3 text-gold-bright">
          <KeyRound className="size-5" aria-hidden />
          <h2 className="font-semibold">Environment checklist</h2>
        </div>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
          <li>Public app settings must only include non-secret values.</li>
          <li>Private service keys must remain in server environments.</li>
          <li>Partner credentials must never appear in customer screens.</li>
          <li>Use separate environments for development and production review.</li>
          <li>Partner approval settings remain internal until approved.</li>
          <li>
            Secrets rotation, webhook signatures, and audit logging remain part
            of production readiness review.
          </li>
        </ul>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3 text-electric-blue-bright">
          <ShieldCheck className="size-5" aria-hidden />
          <h2 className="font-semibold">Row Level Security</h2>
        </div>
        <p className="mt-4 leading-7 text-muted">
          Profiles, business profiles, customers, and invoices are scoped to
          authorized access. Internal routes re-check access before using
          partner-readiness placeholders.
        </p>
      </section>
    </div>
  );
}
