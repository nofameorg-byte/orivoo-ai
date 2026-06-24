import type { Metadata } from "next";
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
          Keep public Supabase values client-safe and store COLUMN_API_KEY only
          in server-side environment variables.
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

      <section className="rounded-[2rem] border border-gold/20 bg-gold/10 p-6">
        <div className="flex items-center gap-3 text-gold-bright">
          <KeyRound className="size-5" aria-hidden />
          <h2 className="font-semibold">Environment checklist</h2>
        </div>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
          <li>NEXT_PUBLIC_SUPABASE_URL is safe for browser use.</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY is safe for browser use with RLS.</li>
          <li>COLUMN_API_KEY must remain server-only and never use NEXT_PUBLIC.</li>
          <li>COLUMN_BASE_URL and COLUMN_ENVIRONMENT control integration targeting.</li>
          <li>COLUMN_PARTNER_BANK_ID and SPONSOR_BANK_NAME model bank sponsor settings.</li>
          <li>
            TODO: Add production secrets rotation, webhook signatures, and audit
            logging before going live.
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
          auth.uid() in Supabase policies. Server routes re-check authentication
          before using banking integration placeholders.
        </p>
      </section>
    </div>
  );
}
