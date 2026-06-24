import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, Printer, ShieldCheck } from "lucide-react";
import { VP23Logo } from "@/components/vp23-logo";

export const metadata: Metadata = {
  title: "Partner Review",
};

const overview = [
  ["Brand", "VP23"],
  ["Legal entity", "Versatile Partners 23, LLC"],
  ["Contact", "contact@vp-23.com"],
  ["Address", "106 Sparrow Circle, Blackville, SC 29817"],
  ["Customer focus", "SMBs, contractors, sole proprietors, entrepreneurs"],
  ["Current status", "Development stage"],
  ["Banking partner status", "Pending approval"],
  ["Live money movement", "Disabled"],
];

const checklist = [
  { section: "Company identity", status: "Complete", notes: "Legal entity, address, contact, website, and brand are documented." },
  { section: "KYB onboarding", status: "Complete", notes: "Protected KYB workflow captures company, address, ownership, documents, and certification." },
  { section: "Beneficial owners", status: "In progress", notes: "Beneficial owner form exists; production verification provider remains pending." },
  { section: "Document vault", status: "Complete", notes: "Private Supabase Storage flow with metadata, type validation, and review statuses." },
  { section: "Customer onboarding", status: "In progress", notes: "Customer records and profiles are built; automated due diligence is planned." },
  { section: "Account applications", status: "Complete", notes: "Business checking and savings application tracking exists." },
  { section: "Admin review tools", status: "Complete", notes: "Admin queues, notes, document review, and risk panels are represented." },
  { section: "Audit logs", status: "In progress", notes: "Schema and helper exist; full event instrumentation is planned." },
  { section: "Privacy policy", status: "In progress", notes: "Policy placeholder exists in legal settings and compliance binder." },
  { section: "Terms & conditions", status: "In progress", notes: "Terms placeholder exists in legal settings and compliance binder." },
  { section: "Security controls", status: "In progress", notes: "Auth, RLS, and server-only secrets are implemented; monitoring is planned." },
  { section: "Bank partner abstraction layer", status: "Complete", notes: "Mock Column, Unit, and Treasury Prime adapters return non-live mock data." },
];

function statusClass(status: string) {
  if (status === "Complete") {
    return "border-electric-blue/30 bg-electric-blue/10 text-electric-blue-bright";
  }

  if (status === "In progress") {
    return "border-gold/30 bg-gold/10 text-gold-bright";
  }

  return "border-white/10 bg-white/[0.04] text-muted";
}

export default function PartnerReviewPage() {
  return (
    <div className="print-page space-y-6">
      <section className="surface-card print-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold print-muted">
              Partner review package
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              VP23 partner-ready overview
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-muted print-muted">
              Internal package for banking partners, fintech infrastructure
              companies, and compliance reviewers. Banking services are subject
              to approval by regulated banking partners.
            </p>
          </div>
          <VP23Logo href="/dashboard/partner-review" size="lg" showText={false} />
        </div>
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
          className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
        >
          Export PDF placeholder
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map(([label, value]) => (
          <article key={label} className="bank-card print-card rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted print-muted">
              {label}
            </p>
            <p className="mt-3 font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 print-card">
          <ShieldCheck className="mb-6 size-7 text-gold" aria-hidden />
          <h2 className="text-2xl font-semibold text-white">Product summary</h2>
          <p className="mt-4 leading-7 text-muted print-muted">
            VP23 is a business-focused financial technology platform designed
            to help small businesses manage payments preparation, invoices,
            customer records, business account applications, transaction
            history, statements, and compliance documents in one secure
            dashboard.
          </p>
          <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <p className="font-semibold text-gold-bright">
              Compliance/KYB status overview
            </p>
            <p className="mt-2 text-sm leading-6 text-muted print-muted">
              KYB workflow, document vault, admin review, status events, and
              audit log schema are prepared. Automated screening, production
              policy approval, and partner-bank submission are in development.
            </p>
          </div>
        </article>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 print-card">
          <h2 className="text-2xl font-semibold text-white">
            Partner readiness checklist
          </h2>
          <div className="mt-5 space-y-3">
            {checklist.map((item) => (
              <article
                key={item.section}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/45 p-4 md:grid-cols-[auto_1fr_auto]"
              >
                {item.status === "Complete" ? (
                  <CheckCircle2 className="mt-1 size-5 text-electric-blue-bright" aria-hidden />
                ) : (
                  <CircleDashed className="mt-1 size-5 text-gold" aria-hidden />
                )}
                <div>
                  <h3 className="font-semibold text-white">{item.section}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted print-muted">
                    {item.notes}
                  </p>
                </div>
                <span className={`h-fit rounded-full border px-3 py-1 text-xs ${statusClass(item.status)}`}>
                  {item.status}
                </span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
