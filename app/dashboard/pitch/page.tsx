import type { Metadata } from "next";
import { Download, Printer, Sparkles } from "lucide-react";
import { VP23Logo } from "@/components/vp23-logo";

export const metadata: Metadata = {
  title: "Internal Pitch",
};

const pitchSections = [
  {
    title: "Problem",
    body: "Small businesses often manage customer records, invoices, payment preparation, account applications, and compliance documents across disconnected tools.",
  },
  {
    title: "Solution",
    body: "VP23 centralizes operational finance workflows into one secure dashboard designed for business owners and internal review teams.",
  },
  {
    title: "Target customers",
    body: "Small businesses, contractors, sole proprietors, and entrepreneurs that need organized financial operations and partner-ready application workflows.",
  },
  {
    title: "Core features",
    body: "Customer portal, invoices, document vault, KYB onboarding, business account applications, ledger, statements, notifications, audit logs, and admin review tools.",
  },
  {
    title: "Why VP23",
    body: "VP23 combines premium brand trust, compliance-first onboarding, and server-side infrastructure preparation without enabling premature money movement.",
  },
  {
    title: "Compliance-first approach",
    body: "KYB, beneficial owner capture, document retention placeholders, admin review, audit logs, and policy binder workflows are core product surfaces.",
  },
  {
    title: "Banking partner needs",
    body: "Sponsor-bank approval, production policy review, transaction monitoring, partner credentials, webhook reconciliation, and final operating procedures.",
  },
  {
    title: "Roadmap",
    body: "Complete compliance policies, instrument audit events, finalize partner adapter contracts, integrate approved provider APIs, and expand customer workflows.",
  },
];

export default function PitchPage() {
  return (
    <div className="print-page space-y-6">
      <section className="surface-card print-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3 text-gold">
              <Sparkles className="size-5" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">
                Internal one-page pitch
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              VP23: business-focused fintech operations.
            </h1>
          </div>
          <VP23Logo href="/dashboard/pitch" size="lg" showText={false} />
        </div>
        <p className="mt-6 max-w-5xl text-lg leading-8 text-muted print-muted">
          VP23 is a business-focused financial technology platform designed to
          help small businesses, contractors, sole proprietors, and
          entrepreneurs manage payments, invoices, customer records, business
          account applications, transaction history, statements, and compliance
          documents in one secure dashboard.
        </p>
      </section>

      <div className="print-hidden flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => globalThis.print()}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
        >
          <Printer className="size-4" aria-hidden />
          Print
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
        >
          <Download className="size-4" aria-hidden />
          Export PDF placeholder
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-2">
        {pitchSections.map((section) => (
          <article key={section.title} className="bank-card print-card rounded-[2rem] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-gold print-muted">
              {section.title}
            </p>
            <p className="mt-4 leading-7 text-muted print-muted">
              {section.body}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
