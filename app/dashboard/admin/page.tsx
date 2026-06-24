import type { Metadata } from "next";
import {
  Ban,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  MessageSquarePlus,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { auditLogEvents, phase4AdminQueues } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Admin KYB Review",
};

const reviewQueues = [
  { title: "Pending KYB applications", count: "12", icon: ClipboardList },
  { title: "Missing documents", count: "5", icon: FileWarning },
  { title: "Manual review", count: "3", icon: ShieldAlert },
  { title: "Approved", count: "18", icon: CheckCircle2 },
  { title: "Rejected", count: "2", icon: XCircle },
];

const applications = [
  {
    business: "Versatile Partners 23, LLC",
    owner: "VP23 applicant",
    status: "Under Review",
    documents: "5 of 8 uploaded",
    risk: "Medium",
  },
  {
    business: "Northstar Construction",
    owner: "Morgan Lee",
    status: "More Info Needed",
    documents: "Missing Operating Agreement",
    risk: "Low",
  },
  {
    business: "Redline Fabrication",
    owner: "Jordan Smith",
    status: "Partner Review",
    documents: "All documents uploaded",
    risk: "Low",
  },
];

const adminActions = [
  { label: "Approve application", icon: CheckCircle2 },
  { label: "Reject application", icon: XCircle },
  { label: "Request more information", icon: MessageSquarePlus },
  { label: "Add internal note", icon: ClipboardList },
  { label: "Suspend business profile", icon: Ban },
  { label: "Mark document verified", icon: ShieldCheck },
  { label: "Mark document unverified", icon: ShieldAlert },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
          Admin KYB review
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Review applications, documents, compliance notes, and partner status.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Internal review tools for KYB applications, missing documents, manual
          compliance review, approval decisions, rejections, and partner-bank
          readiness.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {reviewQueues.map((queue) => (
          <article key={queue.title} className="bank-card rounded-3xl p-5">
            <queue.icon className="mb-5 size-6 text-gold" aria-hidden />
            <p className="text-3xl font-semibold text-white">{queue.count}</p>
            <h2 className="mt-2 text-sm leading-6 text-muted">{queue.title}</h2>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-5">
        {phase4AdminQueues.map((queue) => (
          <article key={queue.title} className="bank-card rounded-3xl p-5">
            <p className="text-3xl font-semibold text-white">{queue.count}</p>
            <h2 className="mt-3 font-semibold text-white">{queue.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{queue.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.48fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">
                Review queue
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Applications requiring action
              </h2>
            </div>
            <select
              aria-label="Filter review queue"
              className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none"
              defaultValue="all"
            >
              <option value="all">All queues</option>
              <option value="pending">Pending KYB applications</option>
              <option value="missing">Missing documents</option>
              <option value="manual">Manual review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-4">
            {applications.map((application) => (
              <article
                key={application.business}
                className="rounded-3xl border border-white/10 bg-black/45 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {application.business}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Owner: {application.owner}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold-bright">
                    {application.status}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.03] p-3">
                    <span className="text-muted">Documents</span>
                    <p className="mt-1 text-white">{application.documents}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] p-3">
                    <span className="text-muted">Risk</span>
                    <p className="mt-1 text-white">{application.risk}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="bank-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-white">Admin actions</h2>
            <div className="mt-5 grid gap-2">
              {adminActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-gold/40"
                >
                  <action.icon className="size-4 text-gold" aria-hidden />
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold text-white">
              Internal note
            </h2>
            <textarea
              placeholder="Add review note, missing document request, or partner-bank instruction."
              className="mt-4 min-h-32 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none placeholder:text-muted focus:border-gold/60"
            />
            <button
              type="button"
              className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
            >
              Save internal note
            </button>
          </section>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">Activity logs</h2>
        <p className="mt-2 text-sm text-muted">
          Audit categories tracked for compliance and administrative review.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {auditLogEvents.map((event) => (
            <article key={event} className="rounded-2xl bg-black/45 p-4">
              <p className="font-medium text-white">{event}</p>
              <p className="mt-1 text-sm text-muted">Audit event enabled</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
