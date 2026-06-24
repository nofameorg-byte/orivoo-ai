import type { Metadata } from "next";
import { Download, Eye, FileText } from "lucide-react";
import { PrintActions } from "@/components/print-actions";

export const metadata: Metadata = {
  title: "Compliance Binder",
};

const policies = [
  { title: "Privacy Policy", status: "In progress", updated: "Jun 24, 2026" },
  { title: "Terms & Conditions", status: "In progress", updated: "Jun 24, 2026" },
  { title: "Acceptable Use Policy", status: "In progress", updated: "Jun 24, 2026" },
  { title: "KYB workflow", status: "Complete", updated: "Jun 24, 2026" },
  { title: "Customer due diligence workflow", status: "In progress", updated: "Jun 24, 2026" },
  { title: "Document retention policy placeholder", status: "Not started", updated: "Jun 24, 2026" },
  { title: "Suspicious activity monitoring placeholder", status: "Not started", updated: "Jun 24, 2026" },
  { title: "Complaints handling placeholder", status: "Not started", updated: "Jun 24, 2026" },
  { title: "Data security policy placeholder", status: "In progress", updated: "Jun 24, 2026" },
  { title: "Incident response policy placeholder", status: "Not started", updated: "Jun 24, 2026" },
];

export default function ComplianceBinderPage() {
  return (
    <div className="print-page space-y-6">
      <section className="surface-card print-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold print-muted">
          Compliance binder
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          VP23 policy and workflow package.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted print-muted">
          Internal policy package for compliance reviewers and potential
          regulated banking partners. Policies marked as placeholders require
          legal and compliance review before production use.
        </p>
      </section>

      <PrintActions />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {policies.map((policy) => (
          <article key={policy.title} className="bank-card print-card rounded-[2rem] p-6">
            <FileText className="mb-6 size-6 text-gold" aria-hidden />
            <h2 className="text-xl font-semibold text-white">{policy.title}</h2>
            <div className="mt-4 space-y-2 text-sm text-muted print-muted">
              <p>Last updated: {policy.updated}</p>
              <p>Status: {policy.status}</p>
            </div>
            <div className="print-hidden mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-electric-blue/30 px-4 py-2 text-sm font-semibold text-electric-blue-bright"
              >
                <Eye className="size-4" aria-hidden />
                View
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white"
              >
                <Download className="size-4" aria-hidden />
                Export placeholder
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
