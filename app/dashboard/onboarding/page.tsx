import type { Metadata } from "next";
import {
  Building2,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "KYB Onboarding",
};

const steps = [
  "Company information",
  "Business address",
  "Ownership information",
  "Beneficial owners",
  "Business documents",
  "Review and submit",
];

const applicationStatuses = [
  "Draft",
  "Submitted",
  "Under Review",
  "More Info Needed",
  "Approved",
  "Rejected",
  "Partner Review",
];

const timeline = [
  { label: "Started application", status: "Complete" },
  { label: "Submitted business details", status: "In progress" },
  { label: "Uploaded documents", status: "Pending" },
  { label: "Beneficial owners added", status: "Pending" },
  { label: "Internal review", status: "Pending" },
  { label: "Partner bank review", status: "Pending" },
  { label: "Ready for account creation", status: "Pending" },
];

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition placeholder:text-muted/60 focus:border-gold/60";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3 text-gold">
          <ClipboardCheck className="size-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
            KYB onboarding
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Business account application for Versatile Partners 23, LLC.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Complete the business profile, beneficial owner details, documents,
          and certification needed for internal review and future partner-bank
          submission.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-6">
        {steps.map((step, index) => (
          <article key={step} className="bank-card rounded-3xl p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              Step {index + 1}
            </p>
            <h2 className="mt-2 text-sm font-semibold text-white">{step}</h2>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <form className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <section>
            <div className="mb-5 flex items-center gap-3">
              <Building2 className="size-5 text-gold" aria-hidden />
              <h2 className="text-xl font-semibold text-white">
                Company information
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Legal business name
                </span>
                <input
                  required
                  name="legalBusinessName"
                  defaultValue="Versatile Partners 23, LLC"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  DBA / brand name
                </span>
                <input
                  name="dbaName"
                  defaultValue="VP23"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">EIN</span>
                <input
                  required
                  name="ein"
                  inputMode="numeric"
                  pattern="[0-9-]{9,10}"
                  placeholder="XX-XXXXXXX"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Formation state
                </span>
                <input
                  required
                  name="formationState"
                  defaultValue="SC"
                  maxLength={2}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Business type
                </span>
                <select
                  required
                  name="businessType"
                  defaultValue="llc"
                  className={inputClass}
                >
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietor">Sole proprietor</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">Industry</span>
                <input
                  required
                  name="industry"
                  placeholder="Financial technology"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">Website</span>
                <input
                  required
                  type="url"
                  name="website"
                  defaultValue="https://vp-23.com"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Contact email
                </span>
                <input
                  required
                  type="email"
                  name="contactEmail"
                  defaultValue="contact@vp-23.com"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Phone number
                </span>
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="+1 555 0100"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="size-5 text-electric-blue-bright" aria-hidden />
              <h2 className="text-xl font-semibold text-white">
                Business address
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-white">
                  Business address
                </span>
                <input
                  required
                  name="businessAddress"
                  defaultValue="106 Sparrow Circle, Blackville, SC 29817"
                  className={inputClass}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-white">
                  Mailing address
                </span>
                <input
                  name="mailingAddress"
                  defaultValue="106 Sparrow Circle, Blackville, SC 29817"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3">
              <FileText className="size-5 text-gold" aria-hidden />
              <h2 className="text-xl font-semibold text-white">
                Account intent and volume
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Expected monthly transaction volume
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  name="expectedMonthlyVolume"
                  placeholder="50000"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Expected average transaction size
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  name="expectedAverageTransactionSize"
                  placeholder="2500"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Source of funds
                </span>
                <input
                  required
                  name="sourceOfFunds"
                  placeholder="Operating revenue"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Intended use of account
                </span>
                <input
                  required
                  name="intendedUseOfAccount"
                  placeholder="Business operating payments and receivables"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3">
              <Users className="size-5 text-electric-blue-bright" aria-hidden />
              <h2 className="text-xl font-semibold text-white">
                Beneficial owners
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Beneficial owner full name
                </span>
                <input required name="ownerName" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Beneficial owner title
                </span>
                <input
                  required
                  name="ownerTitle"
                  placeholder="Managing member"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Ownership percentage
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  name="ownershipPercentage"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Date of birth
                </span>
                <input
                  required
                  type="date"
                  name="ownerDateOfBirth"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">Address</span>
                <input required name="ownerAddress" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Last 4 SSN placeholder
                </span>
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  name="ownerSsnLast4"
                  placeholder="1234"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/45 p-5">
            <h2 className="text-xl font-semibold text-white">
              Business documents
            </h2>
            <p className="mt-2 leading-7 text-muted">
              Upload EIN letter, Articles of Organization, Operating Agreement,
              Beneficial Owner ID, proof of address, bank statement, business
              license, or other requested documents in the document vault.
            </p>
            <a
              href="/dashboard/documents"
              className="mt-5 inline-flex rounded-full border border-gold/30 px-4 py-2 text-sm font-semibold text-gold-bright"
            >
              Open document vault
            </a>
          </section>

          <section className="rounded-3xl border border-gold/25 bg-gold/10 p-5">
            <label className="flex gap-3 text-sm leading-6 text-white">
              <input
                required
                type="checkbox"
                name="certification"
                className="mt-1 size-4 accent-[#D4AF37]"
              />
              <span>
                I certify that the information provided is accurate and that I
                am authorized to submit this business application for review.
              </span>
            </label>
            <button
              type="button"
              className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
            >
              Save KYB application draft
            </button>
          </section>
        </form>

        <aside className="space-y-6">
          <section className="bank-card rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Application status
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Draft</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {applicationStatuses.map((status) => (
                <span
                  key={status}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    status === "Draft"
                      ? "border-gold/30 bg-gold/10 text-gold-bright"
                      : "border-white/10 bg-white/[0.03] text-muted"
                  }`}
                >
                  {status}
                </span>
              ))}
            </div>
          </section>

          <section className="bank-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-white">
              Account application timeline
            </h2>
            <div className="mt-5 space-y-4">
              {timeline.map((event) => {
                const complete = event.status === "Complete";

                return (
                  <div key={event.label} className="flex gap-3">
                    {complete ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-electric-blue-bright" />
                    ) : (
                      <CircleDashed className="mt-0.5 size-5 shrink-0 text-muted" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {event.label}
                      </p>
                      <p className="text-xs text-muted">{event.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
