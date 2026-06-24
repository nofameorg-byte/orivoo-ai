import type { Metadata } from "next";
import { Building2, ShieldAlert } from "lucide-react";
import { complianceTodos } from "@/lib/vp23/data";

export const metadata: Metadata = {
  title: "Business profile",
};

export default function BusinessProfilePage() {
  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
            <Building2 className="size-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">
              Business profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Prepare the business record for partner-bank review.
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted">
              This profile is scoped to authorized workspace access. Production
              onboarding must verify the business, owners, control persons, and
              permitted use case before any partner-approved activity.
            </p>
          </div>
        </div>
      </section>

      <form className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 sm:p-8">
        <label className="block">
          <span className="text-sm font-medium text-white">Legal business name</span>
          <input
            required
            name="legalName"
            minLength={2}
            maxLength={120}
            placeholder="VP23 Holdings LLC"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-white">Entity type</span>
          <select
            required
            name="entityType"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
            defaultValue=""
          >
            <option value="" disabled>
              Select type
            </option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="sole_proprietor">Sole proprietor</option>
            <option value="partnership">Partnership</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-white">EIN last 4</span>
          <input
            required
            name="einLast4"
            inputMode="numeric"
            pattern="[0-9]{4}"
            placeholder="1234"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-white">Industry</span>
          <input
            required
            name="industry"
            minLength={2}
            maxLength={80}
            placeholder="Construction services"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-white">Business email</span>
          <input
            required
            name="email"
            type="email"
            placeholder="ops@vp23.example"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-white">Phone</span>
          <input
            required
            name="phone"
            type="tel"
            minLength={7}
            maxLength={24}
            placeholder="+1 555 0100"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-white">Business address</span>
          <input
            required
            name="address"
            minLength={6}
            maxLength={160}
            placeholder="100 Blackline Ave, Atlanta, GA 30303"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-gold/60"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="button"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-bright"
          >
            Save business profile
          </button>
        </div>
      </form>

      <section className="rounded-[2rem] border border-metal-red/25 bg-metal-red/10 p-6">
        <div className="mb-4 flex items-center gap-3 text-metal-red-bright">
          <ShieldAlert className="size-5" aria-hidden />
          <h2 className="font-semibold">Production compliance review</h2>
        </div>
        <ul className="space-y-3 text-sm leading-6 text-muted">
          {complianceTodos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
