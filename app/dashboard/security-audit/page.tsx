import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Audit",
};

const auditChecks = [
  { item: "Authentication enabled", status: "Pass", notes: "Supabase Auth protects dashboard access." },
  { item: "Protected dashboard routes", status: "Pass", notes: "Dashboard layout redirects unauthenticated users to login." },
  { item: "RLS enabled", status: "Pass", notes: "Application tables use owner, member, admin, and service-role scoped policies." },
  { item: "Admin-only routes protected", status: "Pass", notes: "/dashboard/admin requires an authenticated profile with admin role." },
  { item: "Service role never exposed client-side", status: "Pass", notes: "Service role belongs only in server environment variables." },
  { item: "Column API key server-only", status: "Pass", notes: "Column helpers and routes are server-side; no NEXT_PUBLIC key is used." },
  { item: "No live banking rails connected", status: "Pass", notes: "Partner adapters return mock data and live movement remains disabled." },
  { item: "Partner adapters mocked only", status: "Pass", notes: "Column, Unit, and Treasury Prime adapters are mock abstractions." },
  { item: "Document uploads private", status: "Pass", notes: "Business document bucket is private with owner/admin/service policies." },
  { item: "File type validation enabled", status: "Pass", notes: "Document vault permits PDF, PNG, JPG, and JPEG only." },
  { item: "File size validation enabled", status: "Pass", notes: "Client and storage policy enforce a 10MB maximum." },
  { item: "Delete account is soft-delete only", status: "Pass", notes: "Profile and workspace are soft-deleted; compliance records are retained." },
  { item: "Audit logging enabled", status: "Warning", notes: "Schema and helper exist; full event instrumentation should be completed before production." },
  { item: "Legal pages present", status: "Pass", notes: "Legal settings and compliance binder are available." },
  { item: "Terms acceptance placeholder", status: "Warning", notes: "Schema fields and UI status are prepared; app usage is not blocked yet." },
  { item: "Privacy policy present", status: "Warning", notes: "Policy placeholder exists and requires final legal approval." },
  { item: "Acceptable use policy present", status: "Warning", notes: "Policy placeholder exists and requires final compliance approval." },
];

function statusClass(status: string) {
  if (status === "Pass") {
    return "border-electric-blue/30 bg-electric-blue/10 text-electric-blue-bright";
  }

  if (status === "Warning") {
    return "border-gold/30 bg-gold/10 text-gold-bright";
  }

  return "border-metal-red/30 bg-metal-red/10 text-metal-red-bright";
}

export default function SecurityAuditPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <ShieldCheck className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            Security + production readiness audit
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Internal security checks before partner review.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          This page tracks application controls, RLS readiness, secret handling,
          document privacy, legal placeholders, and live-rail safety.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {auditChecks.map((check) => (
          <article
            key={check.item}
            className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-start gap-4">
              {check.status === "Pass" ? (
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-electric-blue-bright" />
              ) : (
                <AlertTriangle className="mt-1 size-5 shrink-0 text-gold" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <h2 className="font-semibold text-white">{check.item}</h2>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs ${statusClass(check.status)}`}>
                    {check.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{check.notes}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
